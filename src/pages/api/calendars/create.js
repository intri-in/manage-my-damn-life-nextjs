import { CaldavAccount } from "@/helpers/api/classes/CaldavAccount"
import { Calendars } from "@/helpers/api/classes/Calendars"
import { User } from "@/helpers/api/classes/User"
import { middleWareForAuthorisation } from "@/helpers/api/user"
import { addTrailingSlashtoURL, getRandomColourCode, isValidResultArray, replaceSpacewithHyphen } from "@/helpers/general"
import { AES } from "crypto-js"
import { createDAVClient } from "tsdav"
import CryptoJS from "crypto-js"

export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            if(req.body.caldav_accounts_id!=null && req.body.caldav_accounts_id!=""&&req.body.calendarName!=null&&req.body.calendarName!="")
            {
                var userid=await User.idFromAuthorisation(req.headers.authorization)
                var user = new User(userid)
                var caldav_accounts= await user.getCaldavAccountsAllData()
                var caldavAccountFound=-1
                var caldavFromDB=null
                if(caldav_accounts!=null&&Array.isArray(caldav_accounts)&&caldav_accounts.length>0)
                {
                    
                    
                    for(const i in caldav_accounts)
                    {
                        if(caldav_accounts[i].caldav_accounts_id==req.body.caldav_accounts_id)
                        {
                            caldavAccountFound=i
                            caldavFromDB=caldav_accounts[i]
                            //Try to create calendar on caldav account.
                        }
                    }

                    if(caldavAccountFound!=-1&&caldavFromDB!=null)
                    {
                        const client =  await createDAVClient({
                            serverUrl: caldavFromDB.url,
                            credentials: {
                                username: caldavFromDB.username,
                                password: AES.decrypt(caldavFromDB.password,process.env.AES_PASSWORD).toString(CryptoJS.enc.Utf8)
                            },
                            authMethod: 'Basic',
                            defaultAccountType: 'caldav',
                        })
                        var url=addTrailingSlashtoURL(caldavFromDB.url)+"calendars/"+caldavFromDB.username+"/"+replaceSpacewithHyphen(req.body.calendarName.trim())
                        console.log(url)
                        var calendarColor= getRandomColourCode()
                        console.log(calendarColor)
                        const result = await client.makeCalendar({
                            url: url,
                            props: {
                              displayname: req.body.calendarName,
                            },
                          });

                          res.status(200).json({ success: true, data: { message: result} })

                    }else
                    {
                        res.status(401).json({ success: false, data: { message: 'NO_CALDAV_ACCOUNT_ACCESS'} })

                    }
                            
                           
                              
                              

                        
    
                }else
                {
                    res.status(401).json({ success: false, data: { message: 'NO_CALDAV_ACCOUNT_ACCESS'} })

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
    }
    else {
    res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
}