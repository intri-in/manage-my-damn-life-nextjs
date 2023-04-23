import Settings from "@/helpers/api/classes/Settings"
import { User } from "@/helpers/api/classes/User"
import { getICS } from "@/helpers/api/ical"
import { middleWareForAuthorisation } from "@/helpers/api/user"
import { varNotEmpty } from "@/helpers/general"
import moment from "moment"

export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            if(varNotEmpty(req.query.name)&& req.query.name!="")
            {
                var userid=await User.idFromAuthorisation(req.headers.authorization)
                var userObj = new User(userid)
                var isGlobal =false
                if(req.query.name.startsWith("GLOBAL_"))
                {
                    isGlobal = true
                }
                
                var isAdmin= await userObj.isAdmin()
                if(isGlobal )
                {
                    if(isAdmin)
                    {
                        var response= await Settings.getGlobal( req.query.name)
                        res.status(200).json( {success: true, data: {message: response}})

                    } 
                    else{
                        res.status(401).json({ success: false, data: { message: 'ONLY_ADMIN_CAN_REQUEST_GLOBAL'} })

                    }
                }else{
                    var response= await Settings.getForUser(userid, req.query.name)
                    res.status(200).json( {success: true, data: {message: response}})

                }


            }else
            {
                res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })

            }     

        }
        else
        {
            res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }
    else
    {
        res.status(422).json({ success: false ,data: {message: "INVALID_METHOD"}})

    }
}