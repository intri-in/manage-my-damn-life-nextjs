import { CaldavAccount } from "@/helpers/api/classes/CaldavAccount"
import { Calendars } from "@/helpers/api/classes/Calendars"
import { User } from "@/helpers/api/classes/User"
import { getUserIDFromLogin, middleWareForAuthorisation } from "@/helpers/api/user"
import { isValidResultArray, logVar } from "@/helpers/general"
import { AES } from "crypto-js"
import { createDAVClient } from "tsdav"
import CryptoJS from "crypto-js"
import { processCalendarFromCaldav } from "@/helpers/api/v2/caldavHelper"
import { shouldLogforAPI } from "@/helpers/logs"
import { accessTokenNeedsRefresh, getTSDAVCalDAVClient, getTSDAVInputFromCalDAVAccount, refreshTokenAndSaveinDB } from "@/helpers/api/tsdav"
import { caldav_accounts } from "models/caldav_accounts"
import { TSDAVAuthMethodTypes } from "types/tsdav"
const LOGTAG = "api/v2/calendars/refresh"
export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(await middleWareForAuthorisation(req,res))
        {
            // var userid=await User.idFromAuthorisation(req.headers.authorization)

            var userid = await getUserIDFromLogin(req, res)
            if(userid==null){
                return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

            }

            var user = new User(userid)
            var caldav_accounts: caldav_accounts[]= await user.getCaldavAccountsAllData()
            var finalResponse: any= []
            if(caldav_accounts!=null&&Array.isArray(caldav_accounts)&&caldav_accounts.length>0)
            {
                
                
                for(const i in caldav_accounts)
                {
                    var caldavAccount  = new CaldavAccount(caldav_accounts[i])
                    // console.log(">>>>" ,caldav_accounts[i].authMethod?.toUpperCase()=="OAUTH",accessTokenNeedsRefresh(caldav_accounts[i]) )
                    if(caldav_accounts[i].authMethod?.toUpperCase()=="OAUTH" && accessTokenNeedsRefresh(caldav_accounts[i])){
                        await refreshTokenAndSaveinDB(caldav_accounts[i])
            
                    }
                    
                    
                    const client = await getTSDAVCalDAVClient(getTSDAVInputFromCalDAVAccount([caldav_accounts[i]],"api/v2/calendars/refresh"))
                
                    
                    //logVar(caldav_accounts[i], "caldav_accounts: api/calendars/refresh")
                    //logVar(client, "client: api/calendars/refresh")

                    if(client!=null && typeof(client)== 'object')
                    {
                        const calendars = await client.fetchCalendars()
                        if(shouldLogforAPI()) console.log(calendars, "calendars : "+LOGTAG)
                        
                        
                        let tempCalList:any = []
                        if(isValidResultArray(calendars))
                        {
                            for (const j in calendars)
                            {
                                //console.log(calendars[j])
                                const processedCal = processCalendarFromCaldav(calendars[j])
                                tempCalList.push(processedCal)
                                const calExists=await caldavAccount.calendarExists(calendars[j])
                                // console.log("calExists", processedCal, calExists)
                                if(calExists && Array.isArray(calExists) && calExists.length>0)
                                {
                                    await Calendars.updateCalendarinDB(calendars[j], calExists)
                                }
                                else
                                {
                                    await caldavAccount.insertCalendar(processedCal)
                                }
                            }
    
                            }
                        finalResponse.push({username: caldav_accounts[i].username, url: caldav_accounts[i].url, name:caldav_accounts[i].name, status: "ok", provider: caldav_accounts[i].provider, authMethod: caldav_accounts[i].authMethod, caldav_accounts_id:caldav_accounts[i]["caldav_accounts_id"], calendars: tempCalList})
                        
                        
                    }else{
                        finalResponse.push({url: caldav_accounts[i].url, status: "error",caldav_accounts_id:caldav_accounts[i]["caldav_accounts_id"]})
                        
                    }    
                    
  
                }
                return res.status(200).json({ version:2, success: true, data: { message: "REFRESH_OK", details: finalResponse }})

               

            }
            else
            {
                return res.status(200).json({ success: false, data: { message: "NO_CALDAV_ACCOUNTS" }})

            }

        }else
        {
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }
    else {
        res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
}

