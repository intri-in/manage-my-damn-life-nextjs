import { getUserIDFromLogin, middleWareForAuthorisation } from "@/helpers/api/user"
import { insertWebcalIntoDB, parseandAddICSToDB } from "@/helpers/api/webcal"

export default async function handler(req, res) {
    if (req.method === 'POST') {
        if( await middleWareForAuthorisation(req,res))
        {
            if(req.body.name&&req.body.link&&req.body.updateInterval)
            {
                // var userid=await User.idFromAuthorisation(req.headers.authorization)
                const userid = await getUserIDFromLogin(req, res)
                if(userid==null){
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })
    
                }
                const result = await parseandAddICSToDB(userid.toString(), req.body.name, req.body.link, req.body.updateInterval)
                if(!result){
                    
                    return res.status(200).json({ success: true, data: { message: "INSERT_OK"} })
                }else{
                    return res.status(422).json({ success: false, data: { message: result} })
                }
    
            }
            else
            {
                return res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })
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