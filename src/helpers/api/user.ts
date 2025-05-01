import { getConnectionVar, getSequelizeObj } from '@/helpers/api/db';
import crypto from "crypto"
import { Base64 } from 'js-base64';
import { getRegistrationStatus, userRegistrationAllowed } from './settings';
import { varNotEmpty } from '../general';
import bcrypt from 'bcryptjs';
import { getUserIDFromNextAuthSession, nextAuthEnabled } from '../thirdparty/nextAuth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]'; 
import { getToken } from 'next-auth/jwt';
import { getRandomString } from '../crypto';
import { users } from 'models/users';
import { ssid_table } from 'models/ssid_table';

const Users= users.initModel(getSequelizeObj())
const SSID_Model = ssid_table.initModel(getSequelizeObj())
let MAX_CONCURRENT_LOGINS_ALLOWED = 5
    
if(process.env.MAX_CONCURRENT_LOGINS_ALLOWED){
    MAX_CONCURRENT_LOGINS_ALLOWED = parseInt(process.env.MAX_CONCURRENT_LOGINS_ALLOWED)
}
let MAX_SESSION_LENGTH = 2592000
if(process.env.MAX_SESSION_LENGTH){
    MAX_SESSION_LENGTH = parseInt(process.env.MAX_SESSION_LENGTH)
}
export async function getUserDetailsfromUsername(username)
{

    const resultfromDB = await Users.findAll({
        where:{
            username:username
        },
        raw: true,
        nest: true,
    })

    
    return resultfromDB

    // var con = getConnectionVar()
    // return new Promise( (resolve, reject) => {
    //     con.query("SELECT * FROM users WHERE username= ?", [ username], function (err, result, fields) {
    //         con.end()
    //         if (err) {
    //             console.log(err);
    //             return resolve(null)
    //         }
    //         return resolve(Object.values(JSON.parse(JSON.stringify(result))));

    //     })
        
    // })

}
export async function getTotalNumberofUsers()
{
    const resultfromDB = await Users.findAll({
        raw: true,
        nest: true,
    })

    if(resultfromDB && Array.isArray(resultfromDB)){
        return resultfromDB.length
    }

    return 0
    // var con = getConnectionVar()
    // return new Promise( (resolve, reject) => {
    //     con.query("SELECT * FROM users", [], function (err, result, fields) {
    //         con.end()
    //         if (err) {
    //             console.log(err);
    //             return resolve(null)
    //         }
    //         var allUsers=Object.values(JSON.parse(JSON.stringify(result)))
    //         return resolve(result.length);

    //     })
    // })

}
export async function checkifUserisInDB(username)
{
    var userdetails= await getUserDetailsfromUsername(username);
    if(userdetails && Array.isArray(userdetails) && userdetails.length>0)
    {
        return true;
    }
    return false;
}

export async function insertUserIntoDB(username,password,email)
{
    var totalUsers= await getTotalNumberofUsers()
    var userAllowedtoRegister=await userRegistrationAllowed()
    if(totalUsers>0&&userAllowedtoRegister==true)
    {
        await forceInsertUserIntoDB(username, password, email)
        return true
    }
    else if(totalUsers==0)
    {
        //The first user will be an admin.
        await forceInsertUserIntoDB(username, password,email,"1")
        return true
    }
    else
    {
        //Do nothing.
        return false
    }

       
}
export async function forceInsertUserIntoDB(username,password,email,userLevel?)
{
    var isUserinDB= await checkifUserisInDB(username)

    const level = userLevel?? 0
    
    if(!isUserinDB){
        
        const userhash= crypto.createHash('sha512').update(username).digest('hex')
        const salt = await bcrypt.genSalt(10)
        const passwordHash  = await bcrypt.hash(password, salt)
        const id = getRandomString(32)

        const created=Math.floor(Date.now() / 1000).toString()
        await users.create({ 
            username:username, 
            password:passwordHash, 
            email:email, 
            created:created, 
            userhash:userhash,
            level:level,
            id:id });


        // var con = getConnectionVar()
        // //var password = crypto.createHash('sha512').update(password).digest('hex')

        // con.query('INSERT INTO users (username, password, email, created, userhash,level,id) VALUES (?,?, ? ,?,?,?,?)', [username, passwordHash, email, created, userhash,level, id], function (error, results, fields) {
        //     if (error) {
        //         console.log(error.message)
        //     }
        //     con.end()
        //     });
    
    }

}

export async function checkCredentialsinDB(username, password) : Promise<users[] | null>
{
    const resultfromDB = await Users.findAll({
        where:{
            username:username
        },
        raw: true,
        nest: true,
    })
    // console.log(resultfromDB)
    if(resultfromDB && Array.isArray(resultfromDB) && resultfromDB.length>0){
        return new Promise( (resolve, reject) => {

            const userPasswordFromDB = resultfromDB[0]["password"]
            bcrypt.compare(password,userPasswordFromDB, function(err, compResult) {
                // console.log(compResult, password, userPasswordFromDB)
                if(compResult==true)
                {
                    return resolve(resultfromDB)
                }else{
                    return resolve(null)
                }
            });            
        })
    


    }
    return null

    // var con = getConnectionVar()
    // //var passwordHash = crypto.createHash('sha512').update(password).digest('hex')

    // return new Promise( (resolve, reject) => {
    //     con.query("SELECT * FROM users WHERE username= ?", [ username], function (err, result, fields) {
    //         con.end()
    //         if (err) {
    //             console.log(err);
    //             return resolve(null)
    //         }
    //         var result= Object.values(JSON.parse(JSON.stringify(result)))
    //         if(Array.isArray(result) && result.length>0 && varNotEmpty(result))
    //         {
    //             var userPasswordFromDB = result[0].password
    //             bcrypt.compare(password,userPasswordFromDB, function(err, compResult) {
    //                 //console.log(compResult, password, userPasswordFromDB)
    //                 if(compResult==true)
    //                 {
    //                     return resolve(result)
    //                 }else{
    //                     return resolve(null)
    //                 }
    //             });            
    //         }else{
    //             return resolve(null)
    //         }

    //     })
    // })

}

export async function startLoginRequest(username, password)
{
    const userlogin = await checkCredentialsinDB(username, password)
    if(userlogin && Array.isArray(userlogin) && userlogin.length>0)
    {
        const userhash= userlogin[0].userhash
        const ssid = await generateSSID(userhash)
        return {userhash: userhash, ssid: ssid}
    }else{
        return false
    }
}

export async function generateSSID(userhash) 
{
    const allActiveSSID= await getAllSSIDFromDB(userhash)
    // console.log(allActiveSSID.length, " ", process.env.MAX_CONCURRENT_LOGINS_ALLOWED)
    if(allActiveSSID!=null&&allActiveSSID.length>MAX_CONCURRENT_LOGINS_ALLOWED)
    {

        await deleteExtraSSID(userhash)
    }
    const token = crypto.randomBytes(64).toString('hex');
    const created=Math.floor(Date.now() / 1000).toString()
    const tokenHash = crypto.createHash('sha512').update(token).digest('hex')
    /**
     * bcrypt is painfully slow for ssid, because we need to check it again and again (with nearly every request). Even if the db is compromised, the ssids could be easily reset.
     */
    //const salt = await bcrypt.genSalt(10)
    //const tokenHash  = await bcrypt.hash(token, salt)
    await SSID_Model.create({ 
        userhash:userhash, 
        ssid:tokenHash, 
        created:created});

    return token
    
    // return new Promise( (resolve, reject) => {
    //     con.query('INSERT INTO ssid_table (userhash, ssid, created) VALUES (?,? ,?)', [userhash, tokenHash, created], function (error, results, fields) {
    //         if (error) {
    //             console.log(error.message)
    //         }
    //         con.end()
    //         return resolve(token);

    //     });

    // })
    
    
}

export async function deleteExtraSSID(userhash)
{
    const allSSID= await getAllSSIDFromDB(userhash)
    // console.log("allSSID", allSSID)
    if(allSSID && Array.isArray(allSSID) && allSSID.length>MAX_CONCURRENT_LOGINS_ALLOWED)
    {
        //Delete the older SSID.
        const idOfSSIDtoDelete = allSSID[0].ssid_table_id
        await deleteSSIDbyID(idOfSSIDtoDelete, userhash)
    }
}

export async function deleteAllSSID(userhash)
{

    // Delete everyone named "Jane"
    await SSID_Model.destroy({
        where: {
            userhash: userhash,
        },
    });
    // var con = getConnectionVar()

    // con.query('DELETE FROM ssid_table WHERE userhash=?', [ userhash], function (error, results, fields) {
    //     if (error) {
    //         console.log(error.message)
    //     }
    //     con.end()
    //     });

}
export async function deleteSSIDbyID(ssid_table_id, userhash)
{
    // Delete everyone named "Jane"
    await SSID_Model.destroy({
        where: {
            ssid_table_id: ssid_table_id,
            userhash:userhash
        },
    });
    return 
    // var con = getConnectionVar()

    // con.query('DELETE FROM ssid_table WHERE ssid_table_id=? AND userhash=?', [ssid_table_id,  userhash], function (error, results, fields) {
    //     if (error) {
    //         console.log(error.message)
    //     }
    //     con.end()
    //     });

}
export async  function getAllSSIDFromDB(userhash)
{
    const resultfromDB = await SSID_Model.findAll({
        where:{
            userhash:userhash,
        },
        raw: true,
        nest: true,
    })

    return resultfromDB


    // var con = getConnectionVar()
    // return new Promise( (resolve, reject) => {
    //     con.query("SELECT * FROM ssid_table WHERE userhash= ?", [userhash], function (err, result, fields) {
    //         con.end()
    //         if (err) {
    //             console.log(err);
    //             return resolve(null)
    //         }
    //         return resolve(Object.values(JSON.parse(JSON.stringify(result))));

    //     })
    // })

}

export async function getUserIDFromLogin(req,res){
    if(!varNotEmpty(req) || !varNotEmpty(res)){
        return null
    }

    if(await nextAuthEnabled()){
        const session = await getServerSession(req, res, authOptions)
        const id_fromNextAuth= getUserIDFromNextAuthSession(session)
        return await getUserIDFromNextAuthID(id_fromNextAuth)
    }else{
        const userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)
        if(userHash){

            const userid = await getUseridFromUserhash_ORM(userHash[0])
            return userid
        }
        return null
    }

}

export async function getUserIDFromNextAuthID_FromSession(req,res){
    const session = await getServerSession(req, res, authOptions)
    const id_fromNextAuth= getUserIDFromNextAuthSession(session)
    return await getUserIDFromNextAuthID(id_fromNextAuth)

}

export async function getUserIDFromNextAuthID(id){

    const Users=  users.initModel(getSequelizeObj())
    const res = await Users.findOne({
        where:{
            id:id
        },
        raw: true,
        nest: true,
    })

    if(res && res.users_id){
        return res.users_id
    }
    return null
}

export async function getUserHashSSIDfromAuthorisation(authHeaders)
{
    if(authHeaders!=null && authHeaders!="" && authHeaders!=undefined && authHeaders!="null")
    {

    
        const header= Base64.decode(authHeaders.split("Basic ")[1])
        const userssidArray=header.split(':')
        return userssidArray
    }
    else{
        return null
    }
    
}
export async function middleWareForAuthorisation(req, res)
{
    if(!varNotEmpty(req)){
        return false
    }
    if(await nextAuthEnabled()){
        const session = await getServerSession(req, res, authOptions)
        if(session){
            return true
        }else{
            return false
        }
    }
    else{
        try{
                const authHeaders = req.headers.authorization
        
                const userssidArray= await getUserHashSSIDfromAuthorisation(authHeaders)
                // console.log("userssidArray",userssidArray, (userssidArray!=null && Array.isArray(userssidArray) && userssidArray.length==2))
                if(userssidArray!=null && Array.isArray(userssidArray) && userssidArray.length==2)
                {
                   
                        const isValid= await checkSSIDValidity(userssidArray[0], userssidArray[1])
                        // console.log("isValid", isValid)
                        return isValid
                         
                    
                }
                else
                {
                    return false
                }
                //
           
            } 
            catch(e)
            {
                //console.log("middleWareForAuthorisation", e)
                return false
            }
        
    }
}

/**
 * 
 * Bcrypt version of checking ssid validity. Unused because it is painfully slow.
 * @param {string} userhash 
 * @param {string} ssid 
 * @returns boolean. True if the userhash, ssid combination is good.
 */
export async function checkSSIDValidity_V2(userhash, ssid)
{
    const resultfromDB= await getAllSSIDFromDB(userhash)
    if(resultfromDB!=null && Array.isArray(resultfromDB)&&resultfromDB.length>0)
    {
        if(resultfromDB && Array.isArray(resultfromDB)&&resultfromDB.length>0)
            {
                let toReturn = false
                for(const i in resultfromDB)
                {
                    const compareResult = await bcrypt.compare(ssid, resultfromDB[i].ssid)
                    
                        if(compareResult==true)
                        {
                            const currenttime=Math.floor(Date.now() / 1000)

                            if(process.env.ENFORCE_SESSION_TIMEOUT?.toLowerCase()=="true")
                            {

                                const maxValidityTime=parseInt(resultfromDB[i].created!)+MAX_SESSION_LENGTH
                                //console.log(currenttime>maxValidityTime, currenttime, maxValidityTime)
                                if(currenttime>maxValidityTime)
                                {
                                    toReturn=false
                                    break;
                                }
                                else
                                {
                                    toReturn=true
                                    break;
                                }
            
                            }
                            else
                            {
                                //SSID is valid.
                                toReturn=true
                                break;

                            }

                        }
                }


                return toReturn

            }
            else
            {
                return false;
            }
    }else{
        return false
    }
}
export async function checkSSIDValidity(userhash, ssid)
{
    const ssidHash = crypto.createHash('sha512').update(ssid).digest('hex')

    const resultfromDB= await SSID_Model.findAll({
        where:{
        userhash: userhash,
        ssid: ssidHash
    }});

    // console.log("resultfromDB SSID", resultfromDB)
    if(resultfromDB!=null && Array.isArray(resultfromDB)&&resultfromDB.length>0)
    {
        const currenttime=Math.floor(Date.now() / 1000)
        if(process.env.ENFORCE_SESSION_TIMEOUT && process.env.ENFORCE_SESSION_TIMEOUT?.toLowerCase()=="true")
        {
            const maxValidityTime=parseInt(resultfromDB[0].created!)+MAX_SESSION_LENGTH
            if(currenttime>maxValidityTime)
            {
                return false
            }
            else
            {
                return true
            }

        }
        else
        {
            //SSID is valid.
            return true
        }

    }
    else
    {
        return false
    }
    // return new Promise( (resolve, reject) => {
    //     con.query("SELECT * FROM ssid_table WHERE userhash= ? AND ssid=?", [userhash, ssidHash], function (err, result, fields) {
    //         con.end()

    //         if (err){
    //             console.log("checkSSIDValidity"+ err)
    //             return resolve(false)

    //         } 
    //         var resultfromDB= Object.values(JSON.parse(JSON.stringify(result)))
            
            
    //         return resolve(false)
    //     })
    // }).catch((reason) =>{
    //     console.log(reason)
    // })
       

}

export async function getUseridFromUserhash_ORM(userhash)
{
    const res = await Users.findAll({
        where:{
            userhash:userhash,
        }, 
        raw: true,
        nest: true,
    })
    if(res && Array.isArray(res) && res.length>0){
        
        return res[0]["users_id"]
    }

    return null

}
/**
 * @deprecated 
 * @param {*} userhash 
 * @returns 
 */
export function getUseridFromUserhash(userhash)
{
    // var con = getConnectionVar()
    // return new Promise( (resolve, reject) => {
    //     con.query("SELECT * FROM users WHERE userhash=? ", [ userhash], function (err, result, fields) {
    //         con.end()
    //         if (err) {
    //             console.log(err);
    //             return resolve("")
    //         }
    //         var resultfromDB = Object.values(JSON.parse(JSON.stringify(result)))

    //         if(resultfromDB!=null&&Array.isArray(resultfromDB)&&resultfromDB.length>0)
    //         {
    //             return resolve(resultfromDB[0].users_id)

    //         }
    //         else
    //         {
    //             return resolve("")
    //         }
    //         return resolve("");

    //     })
    // })
}