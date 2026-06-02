import { checkifObjectisVTODO, getCaldavAccountDetailsfromId, getCaldavClient, getCalendarFromEventURL } from "@/helpers/api/cal/caldav";
import { isValidCaldavAccount } from "@/helpers/api/cal/calendars";
import { User } from "@/helpers/api/classes/User";
import { getTSDAVCalDAVClient, getTSDAVInputFromCalDAVAccount } from "@/helpers/api/tsdav";
import { getUserIDFromLogin, middleWareForAuthorisation } from "@/helpers/api/user";
import { isValidResultArray } from "@/helpers/general";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(await middleWareForAuthorisation(req,res))
        {
            if(!req.query.caldav_accounts_id || !req.query.calendar_url ||!req.query.ctag || !req.query.syncToken || !req.query.event_url)
            {
                return res.status(422).json({ version:2, success: false, data: { message: 'INVALID_INPUT'} })

            }
            const userid = await getUserIDFromLogin(req, res)
            if(userid==null){
                return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

            }

            var userObj = new User(userid)
            if(await userObj.hasAccesstoCaldavAccountID(req.query.caldav_accounts_id))
            {
                const caldav_account=await getCaldavAccountDetailsfromId(req.query.caldav_accounts_id)

                
                if(!isValidCaldavAccount(caldav_account)){
                    
                    return res.status(500).json({ success: 'false' ,data: {message: 'INVALID_CALDAV_ACCOUNT'}})

                }
                const decodedCalendarURL = decodeURIComponent(req.query.calendar_url)
                const decodedEventURL = decodeURIComponent(req.query.event_url)
                 const client = await getTSDAVCalDAVClient(getTSDAVInputFromCalDAVAccount(caldav_account, "api/v2/calendars/events/fetchOne"))
                if(client){
                    const calendar =  await getCalendarFromEventURL(decodedEventURL)
                    if(!calendar){
                        return res.status(500).json({ version:2, success: true, data: { message: "EMPTY_CALENDAR_OBJECT"} })

                    }
                    const calendarObjects = await client.fetchCalendarObjects({
                        calendar: calendar[0],
                        objectUrls: [decodedEventURL]
                    });
                    console.log("calendarObjects", calendarObjects)
                   
                    return res.status(200).json({ version:2, success: true, data: { message: calendarObjects} })

                }else{
                    return res.status(401).json({ success: false, data: { message: 'ERROR_GENERIC'} })

                }

            }else{
                res.status(401).json({ success: false, data: { message: 'USER_DOESNT_HAVE_ACCESS'} })

            } 

            
        }else{
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }else{
        return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})

    }
}