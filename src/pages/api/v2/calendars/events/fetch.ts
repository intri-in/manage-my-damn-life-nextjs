import { checkifObjectisVTODO, decryptCalDAVPassword, getCaldavAccountDetailsfromId, getCalDAVAuthObjectFromCalDavAccount, getCaldavClient, saveCalendarEventsintoDB } from "@/helpers/api/cal/caldav";
import { User } from "@/helpers/api/classes/User";
import { accessTokenNeedsRefresh, getTSDAVCalDAVClient, getTSDAVInputFromCalDAVAccount, refreshTokenAndSaveinDB } from "@/helpers/api/tsdav";
import { getUserIDFromLogin, middleWareForAuthorisation } from "@/helpers/api/user";
import { isValidResultArray } from "@/helpers/general";

export default async function handler(req, res) {
        if (req.method !== 'GET') {
            return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
        }
        if(await middleWareForAuthorisation(req,res)==false){
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })
            
        }
        if(!req.query.caldav_accounts_id || !req.query.ctag || !req.query.syncToken || !req.query.url)
        {
            return res.status(422).json({ version:2, success: false, data: { message: 'INVALID_INPUT'} })
        }
        const userid = await getUserIDFromLogin(req, res)
        if(userid==null){
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }

        var userObj = new User(userid)
        const calendars_id = await userObj.getCalendarID_FromURLandCaldavAccountID(req.query.caldav_accounts_id, decodeURIComponent(req.query.url))
            // console.log("calendars_id", calendars_id,req.query.url)
        if(!calendars_id){
            return  res.status(401).json({ success: false, data: { message: 'USER_DOESNT_HAVE_ACCESS'} })

        }
        const caldavClientDetails=await getCaldavAccountDetailsfromId(req.query.caldav_accounts_id)

        if(!caldavClientDetails || (caldavClientDetails && caldavClientDetails.length==0)){
            console.error("api/v2/calendars/events/fetch","empty caldavClientDetails")
            return res.status(500).json({ success: false, data: { message: 'ERROR_GENERIC'} })
        }

        // First we need to check whether the accessToken needs to be refreshed.
        if(caldavClientDetails[0].authMethod?.toUpperCase()=="OAUTH" && accessTokenNeedsRefresh(caldavClientDetails[0])){
            await refreshTokenAndSaveinDB(caldavClientDetails[0])

        }

            // console.log("decryptCalDAVPassword(caldavClientDetails[0].password!)", decryptCalDAVPassword(caldavClientDetails[0].password!))
        const client = await getTSDAVCalDAVClient(getTSDAVInputFromCalDAVAccount(caldavClientDetails,"api/v2/calendars/events/")).catch(e =>{
            console.error("api/v2/calendars/events/fetch",e)

        })
            // console.log("req.query.ctag", req.query.ctag, req.query.syncToken)
        if(!client){
            return res.status(401).json({ success: false, data: { message: 'ERROR_GENERIC'} })

        }
        const calendarObjects = await client.fetchCalendarObjects({
            calendar: {url: req.query.url, ctag: req.query.ctag, syncToken: req.query.syncToken, },
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
        if(calendarObjects && isValidResultArray(calendarObjects)){
            for(const i in calendarObjects){
                const type = checkifObjectisVTODO(calendarObjects[i].data)
                calendarObjects[i]["type"]=type
            }

            //save events to server database
            saveCalendarEventsintoDB(calendarObjects, req.query.caldav_accounts_id, calendars_id)
        }
        // console.log("calendarObjects", calendarObjects)
        return res.status(200).json({ version:2, success: true, data: { message: calendarObjects} })
}