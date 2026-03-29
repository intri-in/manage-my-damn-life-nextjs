import { CALDAV_OAUTH_PROVIDERS } from "@/config/constants"
import { middleWareForAuthorisation } from "@/helpers/api/user"
import { UsersClass } from "@/helpers/api/v2/classes/UsersClass"

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})

    }
    if(await middleWareForAuthorisation(req,res)==false)
    {
        return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

    }
    // console.log(req.body.url)
    const userid =  await  UsersClass.getUserIDFromLogin(req, res)
    // console.log(userid)
    if(userid==null){
        return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })
    }

    if(!req.body.provider || !req.body.client_id){
        return res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })
    }
    if(!CALDAV_OAUTH_PROVIDERS.includes(req.body.provider)){
        return res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })
    }

    //We insert the data into the db temporarily.
}
