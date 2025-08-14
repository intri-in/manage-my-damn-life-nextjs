import { getTemplatesFromDB } from '@/helpers/api/template';
import { middleWareForAuthorisation,  getUserIDFromLogin} from '@/helpers/api/user';
import { getWebCalsFromDB, parseWebCalFromAddress, syncWebcal, userHasAccessToWebcal } from '@/helpers/api/webcal';
export default async function handler(req, res) {
        if (req.method !== 'GET') {
            return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})

        }
        if(await middleWareForAuthorisation(req, res)==false){
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
            
        // var userid=await User.idFromAuthorisation(req.headers.authorization)
        const userid = await getUserIDFromLogin(req, res)
        if(userid==null){
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }

        try{
            if(! await userHasAccessToWebcal(userid, req.query.id)){

                return  res.status(401).json({ success: false, data: { message: "USER_DOESNT_HAVE_ACCESS_TO_WEBCAL"} })
            }

            const syncStatus = await syncWebcal(req.query.id)

            const message = syncStatus.status ? "" : "ERROR_GENERIC"
            const statusToSend = (syncStatus.status) ? 200: 422
            return res.status(statusToSend).json({ success: syncStatus.status, data: { message: message, parsedCal: syncStatus.parsedCal, lastFetched: syncStatus.lastFetched} })

        }catch(e){
            return res.status(422).json({ success: false, data: { message: e.message} })

        }
    
           

}
   