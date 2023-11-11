import { checkifUserHasAccesstoRequestedCalendar } from '@/helpers/api/cal/calendars';
import { checkSSIDValidity, getUserHashSSIDfromAuthorisation, getUserIDFromLogin, getUseridFromUserhash, middleWareForAuthorisation } from '@/helpers/api/user';
import { getCaldavClient, saveCalendarEventsintoDB } from '@/helpers/api/cal/caldav';
import { DAVNamespace } from 'tsdav';
export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(req.query.caldav_account_id!=null && req.query.calendar_id!=null)
        {
            if( await middleWareForAuthorisation(req,res))
            {
                
                var calendarObjects = null
                // var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)

                // var userid = await getUseridFromUserhash(userHash[0])
                const userid = await getUserIDFromLogin(req, res)
                if(userid==null){
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

                }

                    var calendar=await checkifUserHasAccesstoRequestedCalendar(userid, req.query.caldav_account_id, req.query.calendar_id)
                if(calendar!=null)
                {
                    var client = await getCaldavClient(req.query.caldav_account_id)
                    //Pull all calendar objects from Remote CALDAV.
                   calendarObjects = await client.fetchCalendarObjects({
                        calendar: calendar,
                        filters: [
                        {
                            'comp-filter': {
                            _attributes: {
                                name: 'VTODO',
                            },
                            },
                        },
                    ],
                      });

                      


                }


                res.status(200).json({ success: true, data: { message:calendarObjects} })

            } 
            else
            {
                res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

            }
        }
        else {
            res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })
        }


    }
    else {
        res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
}
