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
export async function getUserDetailsfromUsername(username)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM users WHERE username= ?", [ username], function (err, result, fields) {
            con.end()
            if (err) {
                console.log(err);
                return resolve(null)
            }
            return resolve(Object.values(JSON.parse(JSON.stringify(result))));

        })
        
    })

}
export async function getTotalNumberofUsers()
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM users", [], function (err, result, fields) {
            con.end()
            if (err) {
                console.log(err);
                return resolve(null)
            }
            var allUsers=Object.values(JSON.parse(JSON.stringify(result)))
            return resolve(result.length);

        })
    })

}
export async function checkifUserisInDB(username)
{
    var userdetails= await getUserDetailsfromUsername(username);
    if(userdetails!=null &&userdetails.length>0)
    {
        return true;

    }
    else
    {
        return false;
    }
}

export async function insertUserIntoDB(username,password,email)
{
    var totalUsers= await getTotalNumberofUsers()
    var userAllowedtoRegister=await userRegistrationAllowed()
    if(totalUsers>0&&userAllowedtoRegister==true)
    {
        forceInsertUserIntoDB(username, password, email)
        return true
    }
    else if(totalUsers==0)
    {
        //The first user will be an admin.
        forceInsertUserIntoDB(username, password,email,"1")
        return true
    }
    else
    {
        //Do nothing.

        return false
    }

       
}
export async function forceInsertUserIntoDB(username,password,email,level)
{
    var isUserinDB= await checkifUserisInDB(username)

    if(varNotEmpty(level)==false)
    {
        level=0
    }
    if(isUserinDB==true)
    {
        // No need to to anything.
    }
    else
    {
        var con = getConnectionVar()
        var userhash= crypto.createHash('sha512').update(username).digest('hex')
        //var password = crypto.createHash('sha512').update(password).digest('hex')
        const salt = await bcrypt.genSalt(10)
        const passwordHash  = await bcrypt.hash(password, salt)
        const id = getRandomString(16)
        var created=Math.floor(Date.now() / 1000)

        con.query('INSERT INTO users (username, password, email, created, userhash,level,id) VALUES (?,?, ? ,?,?,?,?)', [username, passwordHash, email, created, userhash,level, id], function (error, results, fields) {
            if (error) {
                console.log(error.message)
            }
            con.end()
            });
    
    }

}

export function checkCredentialsinDB(username, password)
{
    var con = getConnectionVar()
    //var passwordHash = crypto.createHash('sha512').update(password).digest('hex')

    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM users WHERE username= ?", [ username], function (err, result, fields) {
            con.end()
            if (err) {
                console.log(err);
                return resolve(null)
            }
            var result= Object.values(JSON.parse(JSON.stringify(result)))
            if(Array.isArray(result) && result.length>0 && varNotEmpty(result))
            {
                var userPasswordFromDB = result[0].password
                bcrypt.compare(password,userPasswordFromDB, function(err, compResult) {
                    //console.log(compResult, password, userPasswordFromDB)
                    if(compResult==true)
                    {
                        return resolve(result)
                    }else{
                        return resolve(null)
                    }
                });            
            }else{
                return resolve(null)
            }

        })
    })

}

export async function startLoginRequest(username, password)
{
    const userlogin = await checkCredentialsinDB(username, password)
    if(userlogin!=null&&userlogin.length>0)
    {
        var userhash= userlogin[0].userhash
        const ssid = await generateSSID(userhash)
        return {userhash: userhash, ssid: ssid}
    }else{
        return false
    }
}

export async function generateSSID(userhash) 
{
    var allActiveSSID= await getAllSSIDFromDB(userhash)
    console.log(allActiveSSID.length, " ", process.env.MAX_CONCURRENT_LOGINS_ALLOWED)
    if(allActiveSSID!=null&&allActiveSSID.length>process.env.MAX_CONCURRENT_LOGINS_ALLOWED)
    {

        var ssidDeleteResponse = await deleteExtraSSID(userhash)
    }
    var token = crypto.randomBytes(64).toString('hex');
    var con = getConnectionVar()
    var created=Math.floor(Date.now() / 1000)
    var tokenHash = crypto.createHash('sha512').update(token).digest('hex')
    /**
     * bcrypt is painfully slow for ssid, because we need to check it again and again (with nearly every request). Even if the db is compromised, the ssids could be easily reset.
     */
    //const salt = await bcrypt.genSalt(10)
    //const tokenHash  = await bcrypt.hash(token, salt)

    return new Promise( (resolve, reject) => {
        con.query('INSERT INTO ssid_table (userhash, ssid, created) VALUES (?,? ,?)', [userhash, tokenHash, created], function (error, results, fields) {
            if (error) {
                console.log(error.message)
            }
            con.end()
            return resolve(token);

        });

    })
    
    
}

export async function deleteExtraSSID(userhash)
{
    var allSSID= await getAllSSIDFromDB(userhash)

    if(allSSID!=null&&allSSID.length>process.env.MAX_CONCURRENT_LOGINS_ALLOWED)
    {
        //Delete the older SSID.
        var idOfSSIDtoDelete = allSSID[0].ssid_table_id
        await deleteSSIDbyID(idOfSSIDtoDelete, userhash)
    }
}

export async function deleteAllSSID(userhash)
{
    var con = getConnectionVar()

    con.query('DELETE FROM ssid_table WHERE userhash=?', [ userhash], function (error, results, fields) {
        if (error) {
            console.log(error.message)
        }
        con.end()
        });

}
export async function deleteSSIDbyID(ssid_table_id, userhash)
{
    var con = getConnectionVar()

    con.query('DELETE FROM ssid_table WHERE ssid_table_id=? AND userhash=?', [ssid_table_id,  userhash], function (error, results, fields) {
        if (error) {
            console.log(error.message)
        }
        con.end()
        });

}
export async  function getAllSSIDFromDB(userhash)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM ssid_table WHERE userhash= ?", [userhash], function (err, result, fields) {
            con.end()
            if (err) {
                console.log(err);
                return resolve(null)
            }
            return resolve(Object.values(JSON.parse(JSON.stringify(result))));

        })
    })

}

export async function getUserIDFromLogin(req,res){
    if(!varNotEmpty(req) || !varNotEmpty(res)){
        return null
    }

    if(nextAuthEnabled()){
        const session = await getServerSession(req, res, authOptions)
        const id_fromNextAuth= getUserIDFromNextAuthSession(session)
        return await getUserIDFromNextAuthID(id_fromNextAuth)
    }else{
        var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)
        const userid = await getUseridFromUserhash(userHash[0])
        return userid
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

    
        var header= Base64.decode(authHeaders.split("Basic ")[1])
        var userssidArray=header.split(':')
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
    if(nextAuthEnabled()){
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
        
                var userssidArray= await getUserHashSSIDfromAuthorisation(authHeaders)
                if(userssidArray!=null && Array.isArray(userssidArray) && userssidArray.length==2)
                {
                   
                        const isValid= await checkSSIDValidity(userssidArray[0], userssidArray[1])
                        //console.log(isValid)
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
    var resultfromDB= await getAllSSIDFromDB(userhash)
    if(resultfromDB!=null && Array.isArray(resultfromDB)&&resultfromDB.length>0)
    {
        if(resultfromDB!=null && Array.isArray(resultfromDB)&&resultfromDB.length>0)
            {
                var toReturn = false
                for(const i in resultfromDB)
                {
                    var compareResult = await bcrypt.compare(ssid, resultfromDB[i].ssid)
                    
                        if(compareResult==true)
                        {
                            var currenttime=Math.floor(Date.now() / 1000)

                            if(process.env.ENFORCE_SESSION_TIMEOUT==true)
                            {
                                var maxValidityTime=resultfromDB[i].created+process.env.MAX_SESSION_LENGTH
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
    var con = getConnectionVar()
    var ssidHash = crypto.createHash('sha512').update(ssid).digest('hex')

    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM ssid_table WHERE userhash= ? AND ssid=?", [userhash, ssidHash], function (err, result, fields) {
            con.end()

            if (err){
                console.log("checkSSIDValidity"+ err)
                return resolve(false)

            } 
            var resultfromDB= Object.values(JSON.parse(JSON.stringify(result)))
            if(resultfromDB!=null && Array.isArray(resultfromDB)&&resultfromDB.length>0)
            {
                var currenttime=Math.floor(Date.now() / 1000)
                if(process.env.ENFORCE_SESSION_TIMEOUT==true)
                {
                    var maxValidityTinme=resultfromDB[0].created+process.env.MAX_SESSION_LENGTH
                    if(currenttime>maxValidityTinme)
                    {
                        return resolve(false)
                    }
                    else
                    {
                        return resolve(true)
                    }

                }
                else
                {
                    //SSID is valid.
                    return resolve(true)
                }

            }
            else
            {
                return resolve(false);
            }
            
            return resolve(false)
        })
    }).catch((reason) =>{
        console.log(reason)
    })
       

}
export function getUseridFromUserhash(userhash)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM users WHERE userhash=? ", [ userhash], function (err, result, fields) {
            con.end()
            if (err) {
                console.log(err);
                return resolve("")
            }
            var resultfromDB = Object.values(JSON.parse(JSON.stringify(result)))

            if(resultfromDB!=null&&Array.isArray(resultfromDB)&&resultfromDB.length>0)
            {
                return resolve(resultfromDB[0].users_id)

            }
            else
            {
                return resolve("")
            }
            return resolve("");

        })
    })
}