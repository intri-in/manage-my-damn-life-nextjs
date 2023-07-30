import validator from 'validator';
import { createDAVClient, DAVClient, getBasicAuthHeaders } from 'tsdav';
import { caldavAccountExistinDB, insertCalendarsintoDB, isValidCaldavAccount, getCaldavAccountfromDetails, insertCalendarintoDB, checkifCalendarExistforUser } from '@/helpers/api/cal/calendars'
import { getConnectionVar } from '@/helpers/api/db';
import { middleWareForAuthorisation, getUseridFromUserhash, getUserHashSSIDfromAuthorisation, getUserIDFromLogin } from '@/helpers/api/user';
import { createCalDAVAccount } from '@/helpers/api/cal/caldav';
import { AES } from 'crypto-js';
import { logError, logVar } from '@/helpers/general';
export default async function handler(req, res) {
    if (req.method === 'GET') {

        if(await middleWareForAuthorisation(req,res))
        {
            const userid =  await getUserIDFromLogin(req, res)
            if(userid==null){
                return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

            }

            if(req.query.url!=null && req.query.username!=null && req.query.accountname!=null &&req.query.password!=null)
            {
                if ((req.query.url!=null&&validator.isURL(req.query.url)) || req.query.url.startsWith("http://localhost") || req.query.url.startsWith("https://localhost") ){
                    if(req.query.username!=null&&req.query.password!=null)
                    {

                        var url = req.query.url
                        var username = validator.escape(req.query.username)
                        var password = req.query.password
                        var accountname = validator.escape(req.query.accountname)
                        var response={} //final response of the api
                        const client =  await createDAVClient({
                            serverUrl: url,
                            credentials: {
                                username: username,
                                password: password
                            },
                            authMethod: 'Basic',
                            defaultAccountType: 'caldav',
                        }).catch((reason)=>{
                            logError(reason, "api/caldav/register client:")
                            return res.status(401).json({ success: false, data: {message: reason.message}})


                        })
                        if(client!=null && typeof(client)== 'object')
                        {
                            const calendars = await client.fetchCalendars()
                            //Caldav authentication was succesful. We'll save the details in the db now.
                            if(calendars!=null)
                            {
                                

                               var answer= await saveDatatoDatabase(accountname, username, password, url, calendars, userid)
                                res.status(200).json({ success: true, data: answer})
    
                            }else
                            {
                                res.status(401).json({ success: false, data: {message: 'INVALID_CALDAV_DETAILS'}})

                            }
                                
                        }
                        else
                        {
                            if(res.headersSent==false)
                            {
                                var message = response.message
                                res.status(401).json({ success: false, data: {message: message}})
                            }
                            

                        }
                    }
                    else
                    {
                        res.status(401).json({ success: false, data: {message: 'PLEASE_LOGIN'}})

                    }
                    //if(response!=null)
        
                }
                else {
                    res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })
                }
            }
            else
            {
                res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })

            }
            
    
        }
        else
        {
            res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
        

    } else {
        res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
}

async function saveDatatoDatabase(accountname, username, password, url, calendars,userid)
{

    var calDavAccountIsInDb=await caldavAccountExistinDB(username, url)
    if(calDavAccountIsInDb==false || (calDavAccountIsInDb!=null&&calDavAccountIsInDb.length==0))
    {

            const result = await createCalDAVAccount(accountname, username, password, url, userid)
    } 
    calDavAccountIsInDb=await getCaldavAccountfromDetails(username, url)

        if(isValidCaldavAccount(calDavAccountIsInDb))
        {

            var caldav_accounts_id= calDavAccountIsInDb[0].caldav_accounts_id
            if(calendars!=null && calendars.length>0)
            {
                calendars.forEach(element => {
                    checkifCalendarExistforUser(element, caldav_accounts_id).then((result) =>{
                        if(result==false)
                        {
                            insertCalendarintoDB(element, caldav_accounts_id)
                        }
                        
                    })
                
                    
                });
            }
            
            return true
        }
        else
        {
            return false
        }

       
    

}