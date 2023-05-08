import EventMeta from '@/helpers/api/classes/EventMeta';
import { Events } from '@/helpers/api/classes/Events';
import { User } from '@/helpers/api/classes/User';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation} from '@/helpers/api/user';
import { logVar, varNotEmpty } from '@/helpers/general';
export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            if(req.body.calendar_event_id!=null &&req.body.calendar_event_id!=""&&req.body.calendar_event_id!=undefined && varNotEmpty(req.body.value) && req.body.value!="")
            {

                var userid=await User.idFromAuthorisation(req.headers.authorization)
                var metaObject = new EventMeta({calendar_events_id: req.body.calendar_event_id, userid: userid, property: "REPEAT_META", value:req.body.value})

                const userHasAccess = await metaObject.userHasAccess(userid)

                if(userHasAccess==true)
                {
                    
                    await metaObject.insert()
                    res.status(202).json({ success: true, data: {message : "INSERT_OK"} })
    
                }else{

                    res.status(401).json({ success: false, data: { message: 'ACCESS_DENIED'} })

                }

            }
            else{
                logVar(req.body, "/api/tasks/rrule/postrepeatobj")
                res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })

            }
        }else
        {
            res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }  else {
        res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
}