import { checkifObjectisVTODO, getCaldavAccountDetailsfromId, getCaldavClient } from "@/helpers/api/cal/caldav";
import { isValidCaldavAccount } from "@/helpers/api/cal/calendars";
import { User } from "@/helpers/api/classes/User";
import { getTSDAVCalDAVClient, getTSDAVInputFromCalDAVAccount } from "@/helpers/api/tsdav";
import { getUserIDFromLogin, middleWareForAuthorisation } from "@/helpers/api/user";
import { isValidResultArray } from "@/helpers/general";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(await middleWareForAuthorisation(req,res))
        {
            if(!req.query.caldav_accounts_id || !req.query.ctag || !req.query.syncToken || !req.query.url || !req.query.url)
            {
                return res.status(422).json({ version:2, success: false, data: { message: 'INVALID_INPUT'} })

            }
            var userid = await getUserIDFromLogin(req, res)
            if(userid==null){
                return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

            }

            var userObj = new User(userid)
            if(await userObj.hasAccesstoCaldavAccountID(req.query.caldav_accounts_id))
            {
                var caldav_account=await getCaldavAccountDetailsfromId(req.query.caldav_accounts_id)

                
                if(!isValidCaldavAccount(caldav_account)){
                    
                    return res.status(500).json({ success: 'false' ,data: {message: 'INVALID_CALDAV_ACCOUNT'}})

                }
                 const client = await getTSDAVCalDAVClient(getTSDAVInputFromCalDAVAccount(caldav_account, "api/v2/calendars/events/fetchOne"))
                if(client){
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
                            var type = checkifObjectisVTODO(calendarObjects[i])
                            // console.log("type", type)
                            calendarObjects[i]["type"]=type
                        }
                    }
                    res.status(200).json({ version:2, success: true, data: { message: calendarObjects} })

                }else{
                    return res.status(401).json({ success: false, data: { message: 'ERROR_GENERIC'} })

                }

            }else{
                res.status(401).json({ success: false, data: { message: 'USER_DOESNT_HAVE_ACCESS'} })

            } 

            
        }else{
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }else{
        return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})

    }
}