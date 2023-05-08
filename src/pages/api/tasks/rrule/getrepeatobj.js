import EventMeta from '@/helpers/api/classes/EventMeta';
import { Events } from '@/helpers/api/classes/Events';
import { Filters } from '@/helpers/api/classes/Filters';
import { User } from '@/helpers/api/classes/User';
import { getFiltersFromDB } from '@/helpers/api/filter';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation} from '@/helpers/api/user';
export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            if(req.query.calendar_event_id!=null &&req.query.calendar_event_id!=""&&req.query.calendar_event_id!=undefined)
            {

                var userid=await User.idFromAuthorisation(req.headers.authorization)
                var metaObject = new EventMeta({calendar_events_id: req.query.calendar_event_id, userid: userid, property: "REPEAT_META"})
                const userHasAccess = await metaObject.userHasAccess(userid)

                if(userHasAccess==true)
                {
                    var metaValue = await metaObject.get()
                    res.status(200).json({ success: true, data: {message : metaValue} })
    
                }else{

                    res.status(401).json({ success: false, data: { message: 'ACCESS_DENIED'} })

                }

            }
            else{
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