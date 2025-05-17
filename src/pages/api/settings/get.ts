import Settings from "@/helpers/api/classes/Settings"
import { User } from "@/helpers/api/classes/User"
import { getUserIDFromLogin, middleWareForAuthorisation } from "@/helpers/api/user"
import { varNotEmpty } from "@/helpers/general"
import moment from "moment"

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // console.log("await middleWareForAuthorisation(req,res)", await middleWareForAuthorisation(req,res))
        if(await middleWareForAuthorisation(req,res))
        {
            
                // var userid=await User.idFromAuthorisation(req.headers.authorization)
                const userid = await getUserIDFromLogin(req, res)
                if(userid==null){
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })
    
                }

                const userObj = new User(userid)
                const isAdmin= await userObj.isAdmin()
                const settingKeys = await Settings.getAllforUserid(userid)
                let output = {user:settingKeys}
                
                if(isAdmin==true)
                {
                    output["admin"]=await Settings.getAllGlobal()
                }
                return res.status(200).json( {success: true, data: {message: output}})


           
    
           

        }
        else
        {
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }
    else
    {
        return res.status(422).json({ success: false ,data: {message: "INVALID_METHOD"}})

    }
}