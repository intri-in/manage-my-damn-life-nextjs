import { getTemplatesFromDB } from '@/helpers/api/template';
import { middleWareForAuthorisation,  getUserIDFromLogin} from '@/helpers/api/user';
import { getWebCalsFromDB, parseWebCalFromAddress, syncWebcal, updateColourofWebcal, userHasAccessToWebcal } from '@/helpers/api/webcal';
import { shouldLogforAPI } from '@/helpers/logs';
export default async function handler(req, res) {
        if (req.method !== 'POST') {
            return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})

        }
        if(await middleWareForAuthorisation(req, res)==false){
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
        if(!req.body.id || !req.body.colour){
            return res.status(422).json({ success: 'false' ,data: {message: "INVALID_INPUT"} })

        }
            
        // var userid=await User.idFromAuthorisation(req.headers.authorization)
        const userid = await getUserIDFromLogin(req, res)
        if(userid==null){
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }

        try{
            if(! await userHasAccessToWebcal(userid, req.body.id)){

                return  res.status(401).json({ success: false, data: { message: "USER_DOESNT_HAVE_ACCESS_TO_WEBCAL"} })
            }

            await updateColourofWebcal(req.body.id, req.body.colour)
            return res.status(200).json({ success: true, data: {message: "UPDATE_OK"}})

        }catch(e){
            if(shouldLogforAPI()) console.error("api/webcal/updateColour", e)
            return res.status(422).json({ success: false, data: { message: e.message} })

        }
    
           

}
   