import { createEventinCalDAVAccount } from '@/helpers/api/cal/caldav';
import { checkifUserHasAccesstoRequestedCalendar, getCaldavAccountfromUserID, getCaldavAccountIDFromCalendarID, getCalendarfromCalendarID } from '@/helpers/api/cal/calendars';
import { getAllLablesFromDB } from '@/helpers/api/cal/labels';
import { getObjectFromDB, insertObjectIntoDB, updateObjectinDB } from '@/helpers/api/cal/object';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation, getUserIDFromLogin} from '@/helpers/api/user';
import { getRandomString } from '@/helpers/crypto';
import { logVar } from '@/helpers/general';
export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(await middleWareForAuthorisation(req,res))
        {
            //console.log(req.body)
            if(req.body.etag!=null && req.body.etag.trim()!="" && req.body.data!=null && req.body.data.trim()!="" && req.body.updated!=null && req.body.updated.toString().trim()!="" && req.body.type!=null && req.body.type.trim()!="" && req.body.calendar_id!=null && req.body.calendar_id.toString().trim()!="")
            {
                // logVar(req.body.data, '/api/caldav/calendars/add/event')
                // var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)

                // var userid = await getUseridFromUserhash(userHash[0])
                var userid = await getUserIDFromLogin(req, res)
                if(userid==null){
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

                }

                //First we check if user has access to calendar.
                var currentCaldavAccountID=await getCaldavAccountIDFromCalendarID(req.body.calendar_id)

                var currentCalendar= await checkifUserHasAccesstoRequestedCalendar(userid, currentCaldavAccountID, req.body.calendar_id)
                if(currentCalendar!=null)
                {
                    
                    //Insert info into database;
                    var filename=getRandomString(64)+".ics"

                    var url = currentCalendar.url
                    var lastChar = currentCalendar.url.substr(-1); 
                    if (lastChar != '/') {       
                    url = url + '/';          
                    }
                    url += filename

                    var response = await createEventinCalDAVAccount(url, currentCaldavAccountID, req.body.calendar_id, req.body.data)
                    if(response.result.status>=200 && response.result.status<300 && ( response.result.error==null || response.result.error=="" ))
                    {

                        //Event has been inserted into the database.
                        // Let's fetch it again to get etag, and add to database.
                        if(response.client!=null)
                        {
                            const objects = await response.client.fetchCalendarObjects({
                                calendar: currentCalendar,
                                objectUrls:[url]
                              });
                            
                            if(objects!=null && objects.length>0)
                            {

                                var resultofInsert= insertObjectIntoDB(url, objects[0].etag, objects[0].data, req.body.calendar_id, req.body.type)

                            }
                        }
                        res.status(200).json({ success: true, data: {message: response.result} })

                    }
                    else
                    {
                        console.log(response)
                        res.status(500).json({ success: false, data: {message: 'ERROR_ADDING_EVENT', details: response.result.statusText}})

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