import { CaldavAccount } from "@/helpers/api/classes/CaldavAccount"
import { Calendars } from "@/helpers/api/classes/Calendars"
import { User } from "@/helpers/api/classes/User"
import { middleWareForAuthorisation } from "@/helpers/api/user"
import { isValidResultArray, logVar } from "@/helpers/general"
import { AES } from "crypto-js"
import { createDAVClient } from "tsdav"
import CryptoJS from "crypto-js"
const LOGTAG = "api/calendars/refresh"
export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            var userid=await User.idFromAuthorisation(req.headers.authorization)
            var user = new User(userid)
            var caldav_accounts= await user.getCaldavAccountsAllData()
            var finalResponse= []
            if(caldav_accounts!=null&&Array.isArray(caldav_accounts)&&caldav_accounts.length>0)
            {
                
                
                for(const i in caldav_accounts)
                {
                    var caldavAccount = new CaldavAccount(caldav_accounts[i])
                    const client =  await createDAVClient({
                        serverUrl: caldav_accounts[i].url,
                        credentials: {
                            username: caldav_accounts[i].username,
                            password: AES.decrypt(caldav_accounts[i].password,process.env.AES_PASSWORD).toString(CryptoJS.enc.Utf8)
                        },
                        authMethod: 'Basic',
                        defaultAccountType: 'caldav',
                    }).catch((reason) =>
                    {
                        logVar(reason, "api/calendars/refresh")
                        // Invalid calDAV account. Client is null.
                    })
                    logVar(caldav_accounts[i], "caldav_accounts: api/calendars/refresh")
                    logVar(client, "client: api/calendars/refresh")

                    if(client!=null && typeof(client)== 'object')
                    {
                        const calendars = await client.fetchCalendars()
                        logVar(calendars, "calendars: "+LOGTAG)

                        if(isValidResultArray(calendars))
                        {
                            for (const j in calendars)
                            {
                                //console.log(calendars[j])
                                var calExists=await caldavAccount.calendarExists(calendars[j])

                                if(calExists==true)
                                {
                                    await Calendars.updateCalendarinDB(calendars[j])
                                }
                                else
                                {
                                    await caldavAccount.insertCalendar(calendars[j])
                                }
                            }

                            //Clean up extra calendars not on CalDAV server.
                            var allCalendarsfromDB= await caldavAccount.getAllCalendars()
                            if(isValidResultArray(allCalendarsfromDB))
                            {
                                for (const k in allCalendarsfromDB)
                                {
                                    var found = false
                                    for (const l in calendars)
                                    {
                                        if(calendars[l].url == allCalendarsfromDB[k].url)
                                        {
                                            found=true
                                        }
                                    }


                                    if(found==false)
                                    {
                                        //Delete the calendar as it is not in CalDAV Account.

                                        var answerObjects = await Calendars.deleteAllEvents(allCalendarsfromDB[k])

                                        var answer = await Calendars.deleteCalendar(allCalendarsfromDB[k])

                                      

                                    }

                                }
                            }
                        }


                    }else{
                        res.status(401).json({ success: false, data: { message: "INVALID_CALDAV_ACCOUNT" }})
    
                    }    

  
                }
                res.status(200).json({ success: true, data: { message: "REFRESH_OK" }})

               

            }
            else
            {
                res.status(200).json({ success: false, data: { message: "NO_CALDAV_ACCOUNTS" }})

            }

        }else
        {
            res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }
    else {
        res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
}

