import { getUserIDFromLogin, middleWareForAuthorisation } from "@/helpers/api/user"
import { insertWebcalIntoDB, isURLPresentinDBFortheUser, parseandAddICSToDB } from "@/helpers/api/webcal"
import { shouldLogforAPI } from "@/helpers/logs"

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
                try{
                    //First we check if this is a duplicate entry.
                    const linkExists  = await isURLPresentinDBFortheUser(req.body.link, userid)
                    if(linkExists){
                        return res.status(400).json({ success: false, data: { message: "DUPLICATE_WEBCAL"} })

                    }
                    const result = await parseandAddICSToDB(userid.toString(), req.body.name, req.body.link, req.body.updateInterval)
                    if(!result){
                        
                        return res.status(200).json({ success: true, data: { message: "INSERT_OK"} })
                    }else{
                        return res.status(422).json({ success: false, data: { message: result} })
                    }
                }catch(e){
                    if(shouldLogforAPI()) console.error(e)
                    return res.status(422).json({ success: false, data: { message: e.message} })
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