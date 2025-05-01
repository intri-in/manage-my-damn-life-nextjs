import Settings from "@/helpers/api/classes/Settings"
import { User } from "@/helpers/api/classes/User"
import { getICS } from "@/helpers/api/ical"
import { getUserIDFromLogin, middleWareForAuthorisation } from "@/helpers/api/user"
import { varNotEmpty } from "@/helpers/general"
import moment from "moment"

export default async function getusers_handler(req, res) {
    if (req.method === 'GET') {
        if(await middleWareForAuthorisation(req,res))
        {
          
            // var userid=await User.idFromAuthorisation(req.headers.authorization)
            const userid = await getUserIDFromLogin(req, res)
            if(userid==null){
                return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

            }

            var userObj = new User(userid)
            var isAdmin= await userObj.isAdmin()
            
            if(isAdmin)
            {
                var allUsers= await User.getAll()

                var finalOutput: Object[] = []
                if(varNotEmpty(allUsers) && Array.isArray(allUsers))
                {
                    console.log(allUsers)
                    for (const i in allUsers)
                    {
                        
                        let toPush = {}

                        for (const key in allUsers[i])
                        {
                            if(key!="created" && key!="level" && key!="users_id" && allUsers[i][key])
                            {
                                toPush[key]=allUsers[i][key].toString().replace(/(.)./g, "$1*");

                            }else{
                                toPush[key]=allUsers[i][key]
                            }
                        }
                        finalOutput.push(toPush)
                    }
                }
                res.status(200).json({ success: true, data: { message: finalOutput} })

            } 
            else{
                res.status(401).json({ success: false, data: { message: 'ONLY_ADMIN_CAN_REQUEST_GLOBAL'} })

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