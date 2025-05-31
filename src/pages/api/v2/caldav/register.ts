import validator from 'validator';
import { createDAVClient, DAVClient, getBasicAuthHeaders } from 'tsdav';
import { caldavAccountExistinDB,  isValidCaldavAccount, getCaldavAccountfromDetails, insertCalendarintoDB, checkifCalendarExistforUser } from '@/helpers/api/cal/calendars'
import { getConnectionVar } from '@/helpers/api/db';
import { middleWareForAuthorisation, getUseridFromUserhash, getUserHashSSIDfromAuthorisation, getUserIDFromLogin } from '@/helpers/api/user';
import { createCalDAVAccount } from '@/helpers/api/cal/caldav';
import { AES } from 'crypto-js';
import { logError, logVar } from '@/helpers/general';
import { UsersClass } from '@/helpers/api/v2/classes/UsersClass';
import { processCalendarFromCaldav } from '@/helpers/api/v2/caldavHelper';
import { CaldavAccountClass } from '@/helpers/api/v2/classes/CaldavAccountClass';
import { isCaldavURLinAllowedList } from '@/helpers/validators';
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})

    }
    if(await middleWareForAuthorisation(req,res)==false)
    {
        return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

    }
    // console.log(req.body.url)
    const userid =  await  UsersClass.getUserIDFromLogin(req, res)
    if(userid==null){
        return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

    }
    if(req.body.url!=null && req.body.username!=null && req.body.accountname!=null &&req.body.password!=null)
    {
        const authMethod = req.body.authMethod ? req.body.authMethod :"Basic"
        if ((req.body.url!=null&&validator.isURL(req.body.url)) || req.body.url.startsWith("http://localhost") || req.body.url.startsWith("https://localhost") || isCaldavURLinAllowedList(req.body.url) ){
            if(req.body.username!=null&&req.body.password!=null)
            {

                var url = req.body.url
                var username = validator.escape(req.body.username)
                var password = req.body.password
                var accountname = validator.escape(req.body.accountname)
                var response={} //final response of the api
                const client =  await createDAVClient({
                    serverUrl: url,
                    credentials: {
                        username: username,
                        password: password
                    },
                    authMethod:authMethod,
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
                        const caldav_account = new CaldavAccountClass(userid)
                        let caldav_accounts_fromDB= await caldav_account.accountExists(username, url,userid)
                        if(caldav_accounts_fromDB==null){
                            //Save Caldav Account.
                            caldav_accounts_fromDB = await caldav_account.save(accountname, username, password, url, authMethod)
                            var output ={
                                name: caldav_accounts_fromDB!.name,
                                username:req.body.username,
                                caldav_accounts_id: caldav_accounts_fromDB!.caldav_accounts_id,
                                url: caldav_accounts_fromDB!.url,
                                calendars: processCalDAVResponse(calendars)
                            }   
                            
                            return res.status(200).json({ version: 2, success: true, data: output})


                        }else{
                            return res.status(409).json({ version: 2, success: false, data: {message:"CALDAV_ALREADY_EXISTS"}})

                        }
                    }else
                    {
                        res.status(401).json({ success: false, data: {message: 'INVALID_CALDAV_DETAILS'}})

                    }
                        
                }
                else
                {
                    if(res.headersSent==false)
                    {
                        var message = response["message"]
                        res.status(401).json({ success: false, data: {message: message}})
                    }
                    

                }
            }
            else
            {
                return res.status(401).json({ success: false, data: {message: 'PLEASE_LOGIN'}})

            }
            //if(response!=null)

        }
        else {
            return res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })
        }
    }
    else
    {
        res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })

    }
            
     
}


function processCalDAVResponse(calendarsFromCaldav: any){
    if(!calendarsFromCaldav && !Array.isArray(calendarsFromCaldav)){
        return null
    }
    var output: any = []
    calendarsFromCaldav.forEach(calendar => {

        const processedCal = processCalendarFromCaldav(calendar)
        if(processedCal!.displayName !="" && processedCal!.url!=""){
            output.push(processedCal)

        }
        
    }
    );

    return output
}