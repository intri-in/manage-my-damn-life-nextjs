import { getFiltersFromDB } from '@/helpers/api/filter';
import { middleWareForAuthorisation,  getUserIDFromLogin} from '@/helpers/api/user';
export default async function handler(req, res) {
    if (req.method === 'GET') {
        // console.log("req filters/get")
        if(await middleWareForAuthorisation(req, res))
        {
            
            // var userid=await User.idFromAuthorisation(req.headers.authorization)
            const userid = await getUserIDFromLogin(req, res)
            if(userid==null){
                return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

            }

            var allLabels= await getFiltersFromDB(userid)
            return  res.status(200).json({ success: true, data: { message: allLabels} })
    
           

        }
        else
        {
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }
    else {
        return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
}