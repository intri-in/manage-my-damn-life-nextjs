import { checkifUserHasAccesstoRequestedCalendar, getCaldavAccountsfromUserid } from "@/helpers/api/cal/calendars"
import { getCalendarObjectsFromCalendar, getCalendarObjectsFromCalendarbyType } from "@/helpers/api/cal/object"
import { getUserHashSSIDfromAuthorisation, getUseridFromUserhash, middleWareForAuthorisation } from "@/helpers/api/user"


export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            if(req.query.caldav_accounts_id!=null && req.query.calendars_id!=null)
            {
                var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)

                var userid = await getUseridFromUserhash(userHash[0])
                var allCalendarEvents =null 
                var calendar=await checkifUserHasAccesstoRequestedCalendar(userid, req.query.caldav_accounts_id, req.query.calendars_id)

                if(calendar!=null&&calendar.calendars_id!=null)
                {
                    if(req.query.filter==null)
                    {
                        allCalendarEvents=await getCalendarObjectsFromCalendar(calendar.calendars_id)

                    }
                    else
                    {
                        allCalendarEvents=await getCalendarObjectsFromCalendarbyType(calendar.calendars_id, req.query.filter)

                    }
                }
                res.status(200).json({ success: true, data: { message: allCalendarEvents}})
            }
            else
            {
                res.status(422).json({ success: false, data: { message: 'NO_CALENDAR_ID'} })

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