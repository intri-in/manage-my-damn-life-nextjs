import { createEventinCalDAVAccount, getCalendarFromURL } from '@/helpers/api/cal/caldav';
import { checkifUserHasAccesstoRequestedCalendar, getCaldavAccountfromUserID, getCaldavAccountIDFromCalendarID, getCalendarfromCalendarID } from '@/helpers/api/cal/calendars';
import { getAllLablesFromDB } from '@/helpers/api/cal/labels';
import { getObjectFromDB, insertObjectIntoDB, updateObjectinDB } from '@/helpers/api/cal/object';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation, getUserIDFromLogin} from '@/helpers/api/user';
import { getRandomString } from '@/helpers/crypto';
import { addTrailingSlashtoURL, isValidResultArray, logVar } from '@/helpers/general';
import validator from 'validator';
const LOG_TAG="api/v2/calendars/events/add"
import ical from '@/../ical/ical'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
    if(await middleWareForAuthorisation(req,res)==false){
        return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

    }
            
            // console.log(req.body)
    //console.log(req.body)
    if(req.body.etag!=null && req.body.etag.trim()!="" && req.body.data!=null && req.body.data.trim()!="" && req.body.updated!=null && req.body.updated.toString().trim()!="" && req.body.type!=null && req.body.type.trim()!="" && req.body.caldav_accounts_id!=null && req.body.ctag && req.body.syncToken && req.body.url && req.body.fileName ){
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
        const url = decodeURIComponent(req.body.url)
        // console.log("url from req", url)

        let eventURL = addTrailingSlashtoURL(url)

        eventURL += filename
        // console.log("full URL", url, eventURL)

        const response = await createEventinCalDAVAccount(eventURL, req.body.caldav_accounts_id, req.body.calendar_id, req.body.data)
        if(!("result" in response) || response.result.status<200 || response.result.status>300 ){
            console.log(response)
            return res.status(500).json({ success: false, data: {message: 'ERROR_ADDING_EVENT', details: response.result.statusText}})

        }
        console.log(LOG_TAG, "response", response)
        if(!response.client){
            res.status(500).json({ success: false, data: {message: 'ERROR_ADDING_EVENT', details: response.result.statusText}})
        }
        const calendar = await getCalendarFromURL(url)
        if(!calendar || (calendar &&calendar.length==0)){
            return res.status(500).json({ success: true, data: {message: "INVALID_CALENDAR_OBJECT"} })

            
        }
        const objects = await response.client.fetchCalendarObjects({
        calendar: calendar[0],
        objectUrls: [eventURL]
        });
        let objectToReturn
        // console.log("objects", objects)
        if(objects && Array.isArray(objects) && objects.length>0){
            if(objects[0]["url"] && objects[0]["data"]){
                objectToReturn = objects[0]
            }
            
        }
        
        if(objectToReturn && objectToReturn.data && objectToReturn.etag && objectToReturn.url) {
            return res.status(200).json({ success: true, data: {message: response.result, details: objectToReturn} })

        }
        // Now we try the bandaid fix for Google CalDAV.
        // Google doesn't respect the url supplied for the event. It adds the event with a newly generated url. We need to find it manually.

        const objects_SecondTry = await response.client.fetchCalendarObjects({
        calendar: calendar[0],
        });
        // console.log("objects_SecondTry",objects_SecondTry)
        const parsedEvent = ical.parseICS(req.body.data)
        const uidOld= getUIDFromParsedEvent(parsedEvent)
        // console.log("uid_Old", uidOld)
        if(uidOld){

            for (const i in objects_SecondTry){
                // console.log("eventURL", eventURL, objects_SecondTry)
                const parsedObjectFromCaldav = ical.parseICS(objects_SecondTry[i].data)
                const uidToCheck =  getUIDFromParsedEvent(parsedObjectFromCaldav)
                // console.log("uidToCheck", uidToCheck)
                if(uidToCheck && uidToCheck==uidOld){
                    objectToReturn = objects_SecondTry[i]

                }

            }
        }

        // console.log("objectToReturn", objectToReturn)
        if(!objectToReturn || (objectToReturn && !objectToReturn.url) || (objectToReturn && !objectToReturn.etag) || (objectToReturn && !objectToReturn.data)){
            console.error(LOG_TAG, "objectToReturn empty!")
            return res.status(500).json({ success: false, data: {message: 'ERROR_ADDING_EVENT', details: null}})

        }
        
        return res.status(200).json({ success: true, data: {message: response.result, details: objectToReturn} })

        
        

    }else
    {
        return res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })

    }
        

}

const getUIDFromParsedEvent = (parsedICS: any) =>{
    for(const key in parsedICS){
        if(parsedICS[key].type=="VEVENT")
        {
            return parsedICS[key]["uid"]
        }

    }
}