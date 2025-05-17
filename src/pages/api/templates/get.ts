import { getTemplatesFromDB } from '@/helpers/api/template';
import { middleWareForAuthorisation,  getUserIDFromLogin} from '@/helpers/api/user';
export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(await middleWareForAuthorisation(req, res))
        {
            
            // var userid=await User.idFromAuthorisation(req.headers.authorization)
            const userid = await getUserIDFromLogin(req, res)
            if(userid==null){
                return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

            }

            try{
                const allTemplates= await getTemplatesFromDB(userid)
                return  res.status(200).json({ success: true, data: { message: allTemplates} })

            }catch(e){
                return res.status(401).json({ success: false, data: { message: e.message} })

            }
    
           

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