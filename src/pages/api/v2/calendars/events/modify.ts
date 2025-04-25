import { getObjectFromDB, insertObjectIntoDB, updateObjectinDB } from '@/helpers/api/cal/object';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation, getUserIDFromLogin} from '@/helpers/api/user';
import { checkifUserHasAccesstoRequestedCalendar, getCaldavAccountIDFromCalendarID } from '@/helpers/api/cal/calendars';
import { getRandomString } from '@/helpers/crypto';
import { updateEventinCalDAVAccount } from '@/helpers/api/cal/caldav';
import { fetchCalendarObjects } from 'tsdav';
import { isValidResultArray, logVar } from '@/helpers/general';
const validator = require('validator')
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
                let objectToUpdate={
                url: req.body.url,
                data: req.body.data,
                etag: req.body.etag
                }

                let response = await updateEventinCalDAVAccount(caldav_accounts_id, objectToUpdate)
                // console.log(response)
                // console.log("response for Edit", response)
                    if(response.result.status>=200 && response.result.status<300 && ( response.result.error==null || response.result.error==""))
                    {
                        //Looks like event has been updated successfully.
                        // Now we fetch it again, to get the new etag.
                        let newEvent =null
                        if(response.client!=null)
                        {
                            const objects = await response.client.fetchCalendarObjects({
                                calendar: {url: req.body.url, syncToken: req.body.syncToken, ctag: req.body.ctag},
                                objectUrls:[req.body.url]
                                });
                            
                            if(isValidResultArray(objects))
                            {
                                newEvent = objects[0]
                               
                            }

                        }
                        return res.status(200).json({ success: true, data: {message: "UPDATE_OK", details: newEvent, refresh:{url: req.body.url,calendar_id: req.body.calendar_id, caldav_accounts_id: caldav_accounts_id} }})

                    }else
                    {
                        return  res.status(500).json({ success: false, data: {message: response.result.statusText, details: response.statusText} })

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