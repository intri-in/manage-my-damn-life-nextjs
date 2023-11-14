import { getCaldavAccountDetailsfromId } from "@/helpers/api/cal/caldav"
import { checkifUserHasAccesstoRequestedCalendar, getCaldavAccountsfromUserid } from "@/helpers/api/cal/calendars"
import { getUserHashSSIDfromAuthorisation, getUserIDFromLogin, getUseridFromUserhash, middleWareForAuthorisation } from "@/helpers/api/user"

export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(await middleWareForAuthorisation(req,res))
        {
            if(req.query.caldav_accounts_id!=null && req.query.calendars_id!=null && req.query.calendars_id!="" && req.query.caldav_accounts_id!="")
            {
                // var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)

                // var userid = await getUseridFromUserhash(userHash[0])
                const userid = await getUserIDFromLogin(req, res)
                if(userid==null){
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })
    
                }
    
                var allCalendarEvents =null 
                var calendar=await checkifUserHasAccesstoRequestedCalendar(userid, req.query.caldav_accounts_id, req.query.calendars_id)
                var caldavDetails= await getCaldavAccountDetailsfromId(req.query.caldav_accounts_id)
                var finalOutput ={}
                if(calendar!=null&&calendar.calendars_id!=null && caldavDetails[0]!=null && caldavDetails[0].name!=null)
                {
                    finalOutput= {calendars_id: calendar.calendars_id, caldav_accounts_id:calendar.caldav_accounts_id, calendar_name: calendar.displayName, caldav_name:caldavDetails[0].name, color: calendar.calendarColor}

                }
                res.status(200).json({ success: true, data: { message: finalOutput}})

            }else
            {
                res.status(422).json({ success: false, data: { message: 'NO_CALENDAR_ID'} })

            }
        }else
        {
            res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }else {
        res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
}