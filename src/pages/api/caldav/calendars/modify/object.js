import { getObjectFromDB, insertObjectIntoDB, updateObjectinDB } from '@/helpers/api/cal/object';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation} from '@/helpers/api/user';
import { checkifUserHasAccesstoRequestedCalendar, getCaldavAccountIDFromCalendarID } from '@/helpers/api/cal/calendars';
import { getRandomString } from '@/helpers/crypto';
import { updateEventinCalDAVAccount } from '@/helpers/api/cal/caldav';
import { fetchCalendarObjects } from 'tsdav';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            if(req.body.url!=null && req.body.url.trim()!="" && req.body.etag!=null && req.body.etag.trim()!="" && req.body.data!=null && req.body.data.trim()!="" && req.body.updated!=null && req.body.updated.toString().trim()!="" && req.body.type!=null && req.body.type.trim()!="" && req.body.deleted!=null && req.body.calendar_id!=null && req.body.calendar_id.trim()!="")
            {

                var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)

                var userid = await getUseridFromUserhash(userHash[0])
                var caldav_accounts_id= await getCaldavAccountIDFromCalendarID(req.body.calendar_id)
                //First we check if user has access to calendar.
                var calendarFromDB= await checkifUserHasAccesstoRequestedCalendar(userid, caldav_accounts_id,req.body.calendar_id)
                if(calendarFromDB!=null && Object.keys(calendarFromDB).length>0)
                {
                    var responseFromDB=await getObjectFromDB(req.body.url, req.body.calendar_id)
                    if(responseFromDB!=null)
                    {
                        //Event exists in database. Update.
                      
                       // const responseFromDB_Update = await updateObjectinDB(req.body.url,req.body.etag, req.body.data, req.body.updated, req.body.type, req.body.calendar_id, req.body.deleted)
                       var objectToUpdate={
                        url: req.body.url,
                        data: req.body.data,
                        etag: req.body.etag
                     }

                    var response = await updateEventinCalDAVAccount(caldav_accounts_id, objectToUpdate)
                     if(response.result.status>=200 && response.result.status<300 && ( response.result.error==null || response.result.error==""))
                     {
                        //Looks like event has been updated successfully.
                        // Now we fetch it again, to get the new etag.

                        if(response.client!=null)
                        {
                            const objects = await response.client.fetchCalendarObjects({
                                calendar: calendarFromDB,
                                objectUrls:[req.body.url]
                              });
                            
                              var  responseFromDB_Update=null
                            if(objects!=null && objects.length>0)
                            {

                                responseFromDB_Update = await updateObjectinDB(objects[0].url,objects[0].etag, objects[0].data, req.body.updated, req.body.type, req.body.calendar_id, req.body.deleted)

                            }

                        }
                        res.status(200).json({ success: true, data: {message: "UPDATE_OK", details: response.statusText, refresh:{url: req.body.url,calendar_id: req.body.calendar_id, caldav_accounts_id: caldav_accounts_id} }})

                     }else
                     {
                        res.status(200).json({ success: false, data: {message: response.result.statusText, details: response.statusText} })

                     }


                        
                    }
                    else
                    {
                        //Do nothing. Call only updates. Doesn't create event.                        
                    }
    
                }
                else{
                    res.status(401).json({ success: false, data: { message: 'CALENDAR_NOT_ACCESSIBLE'} })

                }

             

            }else
            {
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