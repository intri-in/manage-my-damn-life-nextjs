import { getCaldavClient, saveCalendarEventsintoDB } from '@/helpers/api/cal/caldav';
import { getCaldavAccountsfromUserid, getCalendarsfromCaldavAccountsID } from '@/helpers/api/cal/calendars';
import { updateLabels } from '@/helpers/api/cal/labels';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation} from '@/helpers/api/user';
export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            if(req.query.caldav_accounts_id!=null)
            {
                var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)

                var userid = await getUseridFromUserhash(userHash[0])
                var calendarObjectsArray = []

                var caldav_accounts= await getCaldavAccountsfromUserid(userid)
                if(caldav_accounts!=null&&Array.isArray(caldav_accounts)&&caldav_accounts.length>0)
                {
                    for(let i=0; i<caldav_accounts.length; i++ )
                    {
                        var calendarObjects = null

                        if(caldav_accounts[i].caldav_accounts_id==req.query.caldav_accounts_id)
                        {
                            var client = await getCaldavClient(caldav_accounts[i].caldav_accounts_id)
                            const allCalendarsinCaldavAccount= await getCalendarsfromCaldavAccountsID(caldav_accounts[i].caldav_accounts_id)
    
                            if(allCalendarsinCaldavAccount!=null && Array.isArray(allCalendarsinCaldavAccount) && allCalendarsinCaldavAccount.length>0)
                            {
                                //Pull all calendar objects from Remote CALDAV.
                                for(let j=0; j<allCalendarsinCaldavAccount.length;j++)
                                {
                                    if(req.query.calendars_id!=null)
                                    {
                                        if(allCalendarsinCaldavAccount[j].calendars_id==req.query.calendars_id)
                                        {
                                            calendarObjects = await client.fetchCalendarObjects({
                                                calendar: allCalendarsinCaldavAccount[j],
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
                                    }
                                    else
                                    {
                                        calendarObjects = await client.fetchCalendarObjects({
                                            calendar: allCalendarsinCaldavAccount[j],
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

                                    calendarObjectsArray.push(calendarObjects)
                                    saveCalendarEventsintoDB(calendarObjects, caldav_accounts[i].caldav_accounts_id, allCalendarsinCaldavAccount[j].calendars_id)
                                    updateLabels(userid)
    
                                }
                            }
    
                        }
                            
                    }


                }
                res.status(200).json({ success: true, data: { message: calendarObjectsArray} })

            }
            else
            {
                res.status(422).json({ success: false, data: { message: 'NO_CALDAV_ACCOUNTS_ID'} })

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