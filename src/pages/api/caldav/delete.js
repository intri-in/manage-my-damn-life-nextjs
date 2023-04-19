import { middleWareForAuthorisation } from "@/helpers/api/user"
import { User } from '@/helpers/api/classes/User';
import { CaldavAccount } from "@/helpers/api/classes/CaldavAccount";
import { Calendars } from "@/helpers/api/classes/Calendars";

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            if(req.query.caldav_account_id!=null &&req.query.caldav_account_id!=""&&req.query.caldav_account_id!=undefined)
            {
                var userid=await User.idFromAuthorisation(req.headers.authorization)
                var user = new User(userid)
                var userHasAcess= await user.hasAccesstoCaldavAccountID(req.query.caldav_account_id)
                if (userHasAcess)
                {
                    // First we delete all the calendars and events stored in database.
                    var caldavAccount = new CaldavAccount({caldav_accounts_id: req.query.caldav_account_id})
                    var allCalendars = await caldavAccount.getAllCalendars()
                    for(const i in allCalendars)
                    {
                        //Delete all events.
                        await Calendars.deleteAllEvents(allCalendars[i])
                        await Calendars.deleteCalendar(allCalendars[i])

                    }
                    // Now we delete the CalDAV Account.
                    var deleteResponse = await caldavAccount.delete()

                    if(deleteResponse==null)
                    {
                        res.status(200).json({ success: true, data: {message: 'CALDAV_ACCOUNT_DELETED'} })

                    }
                    else{
                        res.status(200).json({ success: false, data: {message: deleteResponse} })

                    }

                }else{
                    res.status(401).json({ success: false, data: { message: 'ERROR_NO_ACCESS_TO_CALDAV_ACCOUNT'} })

                }

            }else{
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