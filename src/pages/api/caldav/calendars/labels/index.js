import { getCaldavAccountfromUserID } from '@/helpers/api/cal/calendars';
import { getAllLablesFromDB } from '@/helpers/api/cal/labels';
import { User } from '@/helpers/api/classes/User';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation} from '@/helpers/api/user';
export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            var userid=await User.idFromAuthorisation(req.headers.authorization)
            

            const labels = await getAllLablesFromDB(userid)
            res.status(200).json({ success: true, data: { message: labels} })

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