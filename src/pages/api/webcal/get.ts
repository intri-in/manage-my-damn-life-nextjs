import { getTemplatesFromDB } from '@/helpers/api/template';
import { middleWareForAuthorisation,  getUserIDFromLogin} from '@/helpers/api/user';
import { getWebCalsFromDB, parseWebCalFromAddress } from '@/helpers/api/webcal';
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
                console.log(await parseWebCalFromAddress("http://127.0.0.1/ics/export.ics"))
                const allwebcals= await getWebCalsFromDB(userid)
                return  res.status(200).json({ success: true, data: { message: allwebcals} })

            }catch(e){
                return res.status(422).json({ success: false, data: { message: e.message} })

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