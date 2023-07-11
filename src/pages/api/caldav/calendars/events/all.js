import { getCaldavClient, saveCalendarEventsintoDB } from '@/helpers/api/cal/caldav';
import { getCaldavAccountsfromUserid, getCalendarsfromCaldavAccountsID } from '@/helpers/api/cal/calendars';
import { updateLabels } from '@/helpers/api/cal/labels';
import { User } from '@/helpers/api/classes/User';
import { process_calendarQueryResults } from '@/helpers/api/tsdav';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation} from '@/helpers/api/user';
import { logVar } from '@/helpers/general';
const LOGTAG= "Source: /api/caldav/calendars/events/all"
export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            logVar(req.query, LOGTAG)
            if(req.query.caldav_accounts_id!=null)
            {
                var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)

                var userid = await getUseridFromUserhash(userHash[0])
                var userObj = new User(userid)
                //console.log("hasAccesstoCaldavAccountID", )
                if(await userObj.hasAccesstoCaldavAccountID(req.query.caldav_accounts_id))
                {
                    var calendarObjectsArray = []

                    var caldav_accounts= await getCaldavAccountsfromUserid(userid)
                    if(caldav_accounts!=null&&Array.isArray(caldav_accounts)&&caldav_accounts.length>0 )
                    {
                        for(let i=0; i<caldav_accounts.length; i++ )
                        {
                            var calendarObjects = null
    
                            if(caldav_accounts[i].caldav_accounts_id==req.query.caldav_accounts_id)
                            {
                                var client = await getCaldavClient(caldav_accounts[i].caldav_accounts_id).catch(e =>{
                                    console.error(e)

                                })
                                const allCalendarsinCaldavAccount= await getCalendarsfromCaldavAccountsID(caldav_accounts[i].caldav_accounts_id)
        
                                logVar(allCalendarsinCaldavAccount, LOGTAG+": allCalendarsinCaldavAccount")
                                if(allCalendarsinCaldavAccount!=null && Array.isArray(allCalendarsinCaldavAccount) && allCalendarsinCaldavAccount.length>0 && client!=null)
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
                                                            name: 'VCALENDAR',
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
                                                        name: 'VCALENDAR',
                                                    },
                                                    },
                                                },
                                                ],
                                            });
                                            
                                        }
    
                                        calendarObjectsArray.push(calendarObjects)
                                        logVar(calendarObjects.length, LOGTAG+": "+allCalendarsinCaldavAccount[j].displayName+" var:calendarObjects length")
                                        saveCalendarEventsintoDB(calendarObjects, caldav_accounts[i].caldav_accounts_id, allCalendarsinCaldavAccount[j].calendars_id)
                                        updateLabels(userid)
        
                                    }
                                }
        
                            }
                                
                        }
    
                        res.status(200).json({ success: true, data: { message: calendarObjectsArray} })

                    }else{
                        res.status(200).json({ success: true, data: { message: calendarObjectsArray} })

                    }


                }else{
                    res.status(401).json({ success: false, data: { message: 'USER_DOESNT_HAVE_ACCESS'} })

                }   

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