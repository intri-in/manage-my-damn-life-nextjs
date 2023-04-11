import { getCaldavAccountfromUserID } from '@/helpers/api/cal/calendars';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation} from '@/helpers/api/user';
export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)
            var userid=await getUseridFromUserhash(userHash[0])
            const caldavAccounts =await  getCaldavAccountfromUserID(userid)
            res.status(200).json({ success: true, data: { message: caldavAccounts} })

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