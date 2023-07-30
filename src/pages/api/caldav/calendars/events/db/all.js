import { checkifUserHasAccesstoRequestedCalendar, getCaldavAccountsfromUserid, getCalendarsfromCaldavAccountsID } from "@/helpers/api/cal/calendars"
import { getCalendarObjectsFromCalendar, getCalendarObjectsFromCalendarbyType } from "@/helpers/api/cal/object"
import { getUserHashSSIDfromAuthorisation, getUserIDFromLogin, getUseridFromUserhash, middleWareForAuthorisation } from "@/helpers/api/user"


export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(await middleWareForAuthorisation(req,res))
        {
           
                // var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)

                // var userid = await getUseridFromUserhash(userHash[0])

                var userid = await getUserIDFromLogin(req, res)
                if(userid==null){
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })
    
                }

                var allCalendarEvents =[]
                var caldav_accounts = await getCaldavAccountsfromUserid(userid)
                if(caldav_accounts!=null && Array.isArray(caldav_accounts) && caldav_accounts.length>0)
                {
                    for(const i in caldav_accounts)
                    {
                       var calendars = await getCalendarsfromCaldavAccountsID(caldav_accounts[i].caldav_accounts_id)
                       
                       if(calendars!=null && Array.isArray(calendars) && calendars.length>0)
                       {
                            for(const k in calendars)
                            {
                                var allObjectsfromCalendar= null
                                if(req.query.filter !=null && req.query.filter!="" && req.query.filter !=undefined)
                                {
                                     allObjectsfromCalendar = await getCalendarObjectsFromCalendarbyType(calendars[k].calendars_id, req.query.filter)   
    
                                }
                                else
                                {
                                    allObjectsfromCalendar = await getCalendarObjectsFromCalendar(calendars[k].calendars_id)   

                                    
                                }
                                allCalendarEvents.push({info: {caldav_account: caldav_accounts[i].name,caldav_accounts_id:caldav_accounts[i].caldav_accounts_id, calendar:calendars[k].displayName, color: calendars[k].calendarColor}, events: allObjectsfromCalendar})

                            }
                       }
                    }
    
                }
                res.status(200).json({ success: true, data: { message: allCalendarEvents}})
          

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