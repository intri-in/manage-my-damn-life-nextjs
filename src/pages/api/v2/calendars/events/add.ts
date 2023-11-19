import { createEventinCalDAVAccount } from '@/helpers/api/cal/caldav';
import { checkifUserHasAccesstoRequestedCalendar, getCaldavAccountfromUserID, getCaldavAccountIDFromCalendarID, getCalendarfromCalendarID } from '@/helpers/api/cal/calendars';
import { getAllLablesFromDB } from '@/helpers/api/cal/labels';
import { getObjectFromDB, insertObjectIntoDB, updateObjectinDB } from '@/helpers/api/cal/object';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation, getUserIDFromLogin} from '@/helpers/api/user';
import { getRandomString } from '@/helpers/crypto';
import { isValidResultArray, logVar } from '@/helpers/general';
import validator from 'validator';
export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(await middleWareForAuthorisation(req,res))
        {
            console.log(req.body)
            //console.log(req.body)
            if(req.body.etag!=null && req.body.etag.trim()!="" && req.body.data!=null && req.body.data.trim()!="" && req.body.updated!=null && req.body.updated.toString().trim()!="" && req.body.type!=null && req.body.type.trim()!="" && req.body.caldav_accounts_id!=null && req.body.ctag && req.body.syncToken && req.body.url && req.body.fileName )
            {
                // logVar(req.body.data, '/api/caldav/calendars/add/event')
                // var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)

                // var userid = await getUseridFromUserhash(userHash[0])
                var userid = await getUserIDFromLogin(req, res)
                if(userid==null){
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

                }
  
                    //Insert info into database;
               // var filename=getRandomString(64)+".ics"
                let filename = validator.escape(req.body.fileName)
                var url = req.body.url
                var lastChar = url.substr(-1); 
                if (lastChar != '/') {       
                url = url + '/';          
                }
                url += filename

                var response = await createEventinCalDAVAccount(url, req.body.caldav_accounts_id, req.body.calendar_id, req.body.data)
                if(response.result.status>=200 && response.result.status<300 && ( response.result.error==null || response.result.error=="" ))
                {

                    //Event has been inserted into the database.
                    // Let's fetch it again to get etag, and add to database.
                    if(response.client!=null)
                    {
                        const objects = await response.client.fetchCalendarObjects({
                            calendar: {url: req.body.url, syncToken: req.body.syncToken, ctag: req.body.ctag},
                            objectUrls:[url]
                            });
                        
                        if(isValidResultArray(objects)){

                            res.status(200).json({ success: true, data: {message: response.result, details: objects[0]} })
                        }else{
                            res.status(200).json({ success: true, data: {message: response.result, details: null, forceSync: true} })

                        }
                    }else{
                        res.status(500).json({ success: false, data: {message: 'ERROR_ADDING_EVENT', details: response.result.statusText}})

                    }

                }
                else
                {
                    console.log(response)
                    res.status(500).json({ success: false, data: {message: 'ERROR_ADDING_EVENT', details: response.result.statusText}})

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