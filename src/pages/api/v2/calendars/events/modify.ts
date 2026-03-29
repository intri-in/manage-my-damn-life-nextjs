import { getObjectFromDB, insertObjectIntoDB, updateObjectinDB } from '@/helpers/api/cal/object';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation, getUserIDFromLogin} from '@/helpers/api/user';
import { checkifUserHasAccesstoRequestedCalendar, getCaldavAccountIDFromCalendarID } from '@/helpers/api/cal/calendars';
import { getRandomString } from '@/helpers/crypto';
import { getCalendarFromEventURL, updateEventinCalDAVAccount } from '@/helpers/api/cal/caldav';
import { fetchCalendarObjects } from 'tsdav';
import { isValidResultArray, logVar } from '@/helpers/general';
import { shouldLogforAPI } from '@/helpers/logs';
const validator = require('validator')
const LOG_TAG = "api/v2/calendars/events/modify"
export default async function handler(req, res) {
    // logVar(req.body, "modify object API CALL")
    if (req.method === 'POST') {
        if(await middleWareForAuthorisation(req,res))
        {
            if(req.body.url!=null && req.body.url.trim()!="" && req.body.etag!=null && req.body.etag.trim()!="" && req.body.data!=null && req.body.data.trim()!="" && req.body.updated!=null && req.body.updated.toString().trim()!="" && req.body.type.trim()!="" && req.body.caldav_accounts_id)
            {

                // let userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)

                // let userid = await getUseridFromUserhash(userHash[0])
                const userid = await getUserIDFromLogin(req, res)
                if(userid==null){
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

                }

                let caldav_accounts_id= validator.escape(req.body.caldav_accounts_id.toString())

              
                //Event exists in database. Update.
                
                // const responseFromDB_Update = await updateObjectinDB(req.body.url,req.body.etag, req.body.data, req.body.updated, req.body.type, req.body.calendar_id, req.body.deleted)
                const decodedURL = decodeURIComponent(req.body.url)
                console.log("req.body.url", decodedURL, req.body.url)
                let objectToUpdate={
                url: decodedURL,
                data: req.body.data,
                etag: req.body.etag
                }

                let response = await updateEventinCalDAVAccount(caldav_accounts_id, objectToUpdate)
                // console.log("response for Edit", response.result.status)
                let newEvent
                    if(response.result.status>=200 && response.result.status<300 && ( response.result.error==null || response.result.error==""))
                    {
                        //Looks like event has been updated successfully.
                        // Now we fetch it again, to get the new etag.
                        if(response.client!=null)
                        {
                            const calendar =  await getCalendarFromEventURL(decodedURL)
                            // console.log("decodedURL", calendar, decodedURL)
                            if(calendar){
                                const objects = await response.client.fetchCalendarObjects({
                                calendar: calendar[0],
                                objectUrls:[decodeURIComponent(req.body.url)],
                              });
                            if(shouldLogforAPI()) console.log(`${LOG_TAG} objects`, objects)
                            if(isValidResultArray(objects))
                            {
                                newEvent = objects[0]
                                if(!newEvent)
                                {
                                    if(!newEvent["data"]){
                                        newEvent["data"] = req.body.data
                                    }
                                }
                                    if(!newEvent["data"]){
                                        newEvent["data"] = req.body.data
                                    }
                            }
                            }
                           

                        }
                        return res.status(200).json({ success: true, data: {message: "UPDATE_OK", details: newEvent, refresh:{url: decodedURL,calendar_id: req.body.calendar_id, caldav_accounts_id: caldav_accounts_id} }})

                    }else
                    {
                        const  statusCode = (response.result.status) ?? 500
                        return  res.status(statusCode).json({ success: false, data: {message: response.result.statusText, details: "ERROR_GENERIC"} })

                    }


                    
               
    
               

             

            }else
            {
                return  res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })

            }
        }
        else
        {
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }
    else {
        return  res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
}