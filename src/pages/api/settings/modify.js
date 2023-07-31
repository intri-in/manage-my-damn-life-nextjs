import Settings from "@/helpers/api/classes/Settings"
import { User } from "@/helpers/api/classes/User"
import { getICS } from "@/helpers/api/ical"
import { getUserIDFromLogin, middleWareForAuthorisation } from "@/helpers/api/user"
import { varNotEmpty } from "@/helpers/general"
import moment from "moment"

export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(await middleWareForAuthorisation(req,res))
        {
            //console.log(req.body)
            if(varNotEmpty(req.body.name) && req.body.name.toString().trim()!="" && varNotEmpty(req.body.value) && req.body.value.toString().trim()!=""){
                // var userid=await User.idFromAuthorisation(req.headers.authorization)
                var userid = await getUserIDFromLogin(req, res)
                if(userid==null){
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })
    
                }
                var userObj = new User(userid)

                var isGlobal =false
                if(req.body.name.startsWith("GLOBAL_"))
                {
                    isGlobal = true
                }
                
                var isAdmin= await userObj.isAdmin()
                if(isGlobal )
                {
                    if(isAdmin)
                    {
                        var response = await userObj.modifySetting(req.body.name, req.body.value, 1)
                        res.status(200).json( {success: response, data: {message: ""}})
    
                    }else{
                        res.status(401).json({ success: false, data: { message: 'ONLY_ADMIN_CAN_SET_GLOBAL'} })

                    }
                }else
                {
                    //Make a modify request
                    var response = await userObj.modifySetting(req.body.name, req.body.value, isGlobal)
                    res.status(200).json( {success: response, data: {message: ""}})
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