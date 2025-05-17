import { CaldavAccount } from "@/helpers/api/classes/CaldavAccount"
import { Calendars } from "@/helpers/api/classes/Calendars"
import { User } from "@/helpers/api/classes/User"
import { getUserIDFromLogin, middleWareForAuthorisation } from "@/helpers/api/user"
import { addTrailingSlashtoURL, getRandomColourCode, isValidResultArray, replaceSpacewithHyphen } from "@/helpers/general"
import { AES } from "crypto-js"
import { createDAVClient } from "tsdav"
import CryptoJS from "crypto-js"
import { shouldLogforAPI } from "@/helpers/logs"

export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(await middleWareForAuthorisation(req,res))
        {
            if(req.body.caldav_accounts_id!=null && req.body.caldav_accounts_id!=""&&req.body.calendarName!=null&&req.body.calendarName!="")
            {
                // var userid=await User.idFromAuthorisation(req.headers.authorization)

                var userid = await getUserIDFromLogin(req, res)
                if(userid==null){
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

                }

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
                        const calendarColor= getRandomColourCode()
                        const result = await client.makeCalendar({
                            url: url,
                            props: {
                              displayname: req.body.calendarName,
                              calendarColor: calendarColor
                            },
                          });
                          if(shouldLogforAPI()) console.log("api/calendars/create result", result)
                          let failed_firstTry=(result && "ok" in  result )
                          var result2=null
                          if(result  && "ok" in  result && result["ok"].toString!="true"){
                              failed_firstTry=true
                              var url=addTrailingSlashtoURL(caldavFromDB.url)+caldavFromDB.username+"/"+replaceSpacewithHyphen(req.body.calendarName.trim())
                              result2 = await client.makeCalendar({
                                url: url,
                                props: {
                                  displayname: req.body.calendarName,
                                },
                              });
                            if (process.env.NEXT_API_DEBUG_MODE && process.env.NEXT_API_DEBUG_MODE.toLowerCase()=="true") console.log("result2", result2)
                          }
                          //Try a second time to create. without calendars.

                          if(failed_firstTry){
                            return res.status(200).json({ success: true, data: { message: result2} })

                          }else{
                            return res.status(200).json({ success: true, data: { message: result} })

                          }

                    }else
                    {
                        return res.status(401).json({ success: false, data: { message: 'NO_CALDAV_ACCOUNT_ACCESS'} })

                    }
                            
                           
                              
                              

                        
    
                }else
                {
                    return  res.status(401).json({ success: false, data: { message: 'NO_CALDAV_ACCOUNT_ACCESS'} })

                }
                
    
            }
            else
            {
                return  res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })

            }
        }
        else
        {
            return  res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }
    else {
        return  res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
}