import { Calendars } from "@/helpers/api/classes/Calendars"
import { User } from "@/helpers/api/classes/User"
import { middleWareForAuthorisation } from "@/helpers/api/user"

export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            if(req.query.calendar_id!=null && req.query.calendar_id!=""&&req.query.url!=null&&req.query.url!=""&&req.query.caldav_accounts_id!=null && req.query.caldav_accounts_id!="")
            {
                var userid=await User.idFromAuthorisation(req.headers.authorization)
                var user = new User(userid)
                var calendar=await Calendars.getFromID(req.query.calendar_id)
                if(calendar!=null && calendar.calendars_id!=null)
                {
                    // Valid calendar Object.
                    //Now we fetch event from CalDAV.


                }
                res.status(200).json({ success: true, data: { message: ''} })

            }else
            {
                res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })

            }

        }
        else
        {
            res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }else {
        res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
        }
}