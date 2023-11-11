import { checkifObjectisVTODO, getCaldavClient } from "@/helpers/api/cal/caldav";
import { User } from "@/helpers/api/classes/User";
import { getUserIDFromLogin, middleWareForAuthorisation } from "@/helpers/api/user";
import { isValidResultArray } from "@/helpers/general";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(await middleWareForAuthorisation(req,res))
        {
            if(!req.query.caldav_accounts_id || !req.query.ctag || !req.query.syncToken || !req.query.url)
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
                var client = await getCaldavClient(req.query.caldav_accounts_id).catch(e =>{
                    console.error(e)

                })
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