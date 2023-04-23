import { getConnectionVar } from '@/helpers/api/db';
import crypto from "crypto"
import { Base64 } from 'js-base64';
import { getRegistrationStatus, userRegistrationAllowed } from './settings';
import { varNotEmpty } from '../general';
export async function getUserDetailsfromUsername(username)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM users WHERE username= ?", [ username], function (err, result, fields) {
            if (err) throw err;
            con.end()
            resolve(Object.values(JSON.parse(JSON.stringify(result))));

        })
        
    })

}
export async function getTotalNumberofUsers()
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM users", [], function (err, result, fields) {
            if (err) throw err;
            con.end()
            var allUsers=Object.values(JSON.parse(JSON.stringify(result)))
            resolve(result.length);

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
        var password = crypto.createHash('sha512').update(password).digest('hex')
        var created=Math.floor(Date.now() / 1000)

        con.query('INSERT INTO users (username, password, email, created, userhash,level) VALUES (?,?, ? ,?,?,?)', [username, password, email, created, userhash,level], function (error, results, fields) {
            if (error) {
                throw error.message
            }
            con.end()
            });
    
    }

}

export function checkCredentialsinDB(username, password)
{
    var con = getConnectionVar()
    var passwordHash = crypto.createHash('sha512').update(password).digest('hex')
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM users WHERE username= ? AND password = ?", [ username, passwordHash], function (err, result, fields) {
            if (err) throw err;
            con.end()
            resolve(Object.values(JSON.parse(JSON.stringify(result))));

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

    return new Promise( (resolve, reject) => {
        con.query('INSERT INTO ssid_table (userhash, ssid, created) VALUES (?,? ,?)', [userhash, token, created], function (error, results, fields) {
            if (error) {
                throw error.message
            }
            con.end()
            resolve(token);

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

export async function deleteSSIDbyID(ssid_table_id, userhash)
{
    var con = getConnectionVar()

    con.query('DELETE FROM ssid_table WHERE ssid_table_id=? AND userhash=?', [ssid_table_id,  userhash], function (error, results, fields) {
        if (error) {
            throw error.message
        }
        con.end()
        });

}
export async  function getAllSSIDFromDB(userhash)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM ssid_table WHERE userhash= ?", [userhash], function (err, result, fields) {
            if (err) throw err;
            con.end()
            resolve(Object.values(JSON.parse(JSON.stringify(result))));

        })
    })

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
export async function middleWareForAuthorisation(authHeaders)
{
    try{
    if(authHeaders!=null && authHeaders!="" && authHeaders!=undefined &&authHeaders!="null")
    {

        var userssidArray= await getUserHashSSIDfromAuthorisation(authHeaders)
        if(userssidArray!=null && Array.isArray(userssidArray) && userssidArray.length==2)
        {
           
                return(await checkSSIDValidity(userssidArray[0], (userssidArray[1])))
                 
            
        }
        else
        {
            return false
        }
        //
    }
    else
    {
        return false
    }
    } 
    catch(e)
    {
        //console.log("middleWareForAuthorisation", e)
        return false
    }
}
export async function checkSSIDValidity(userhash, ssid)
{
    var con = getConnectionVar()
    
    return new Promise( (resolve, reject) => {
 
        con.query("SELECT * FROM ssid_table WHERE userhash= ? AND ssid=?", [userhash, ssid], function (err, result, fields) {
            
            if (err){
                con.end()
                console.log("checkSSIDValidity"+ err)
                resolve(false)

            } 
            con.end()
            var resultfromDB= Object.values(JSON.parse(JSON.stringify(result)))
            if(resultfromDB!=null && Array.isArray(resultfromDB)&&resultfromDB.length>0)
            {
                var currenttime=Math.floor(Date.now() / 1000)
                if(process.env.ENFORCE_SESSION_TIMEOUT==true)
                {
                    var maxValidityTinme=resultfromDB[0].created+process.env.MAX_SESSION_LENGTH
                    if(currenttime>maxValidityTinme)
                    {
                        resolve(false)
                    }
                    else
                    {
                        resolve(true)
                    }

                }
                else
                {
                    //SSID is valid.
                    resolve(true)
                }

            }
            else
            {
                resolve(false);
            }
            
            resolve(false)
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
            if (err) throw err;
            con.end()
            var resultfromDB = Object.values(JSON.parse(JSON.stringify(result)))

            if(resultfromDB!=null&&Array.isArray(resultfromDB)&&resultfromDB.length>0)
            {
                resolve(resultfromDB[0].users_id)

            }
            else
            {
                resolve("")
            }
            resolve("");

        })
    })
}