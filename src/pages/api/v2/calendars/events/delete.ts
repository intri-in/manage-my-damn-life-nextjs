import { getCaldavAccountDetailsfromId } from '@/helpers/api/cal/caldav';
import { getTSDAVCalDAVClient, getTSDAVInputFromCalDAVAccount } from '@/helpers/api/tsdav';
import { middleWareForAuthorisation,  getUserIDFromLogin} from '@/helpers/api/user';
import { isValidResultArray } from '@/helpers/general';
const validator = require("validator")
export default async function handler(req, res) {
    if (req.method === 'POST') {
        if( await middleWareForAuthorisation(req,res))
        {
            if(req.body.etag!=null  && req.body.etag.trim()!="" && req.body.calendar_id!=null && req.body.calendar_id.toString().trim()!=""&&req.body.url!=null  && req.body.url.trim()!="" && req.body.caldav_accounts_id)
            {
                // var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)
                // var userid = await getUseridFromUserhash(userHash[0])
                const userid = await getUserIDFromLogin(req, res)
                if(userid==null){
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

                }

                var currentCaldavAccountID=validator.escape(req.body.caldav_accounts_id.toString())

              
                var caldav_account= await getCaldavAccountDetailsfromId(currentCaldavAccountID)
                if(!isValidResultArray(caldav_account)){
                    return res.status(500).json({ success: false, data: { message: "ERROR_GENERIC", detail: "caldav_account not found from db"}})

                }
                // Delete event from CalDAV first.
                const client = await getTSDAVCalDAVClient(getTSDAVInputFromCalDAVAccount(caldav_account, "updateEventinCalDAVAccount")).catch(e =>{
                    console.log("api/v2/calendars/events/delete getTSDAVCalDAVClient:", e)

                })
                if(client!=null && client!=undefined){
                    const response_caldav = await client.deleteCalendarObject({
                        calendarObject: {
                        url: decodeURIComponent(req.body.url),
                        etag: req.body.etag,
                        },
                    }).catch(e =>{
                        console.log(e)
                    })            

                    if(response_caldav!=null){
                        // Now we delete object from DB (which means, just set it as DELETED)

                        // const response = await deleteCalendarObjectsFromDB(req.body.url, req.body.calendar_id)

                        return res.status(200).json({ success: true, data: { message: "DELETE_OK", detail: response_caldav} })

                    }else{
                        res.status(500).json({ success: false, data: { message: "ERROR_GENERIC", detail: "Check logs."} })

                    }

                }else{
                    res.status(401).json({ success: false, data: { message: "CANT_REACH_CALDAV_ACCOUNT", detail: "No access to Caldav Account."} })

                }

                
    
            }else
            {
                res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })

            }

        }else
        {
            res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }else {
        res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
}