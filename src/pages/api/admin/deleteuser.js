import Settings from "@/helpers/api/classes/Settings"
import { User } from "@/helpers/api/classes/User"
import { getICS } from "@/helpers/api/ical"
import { middleWareForAuthorisation } from "@/helpers/api/user"
import { varNotEmpty } from "@/helpers/general"
import moment from "moment"

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            if(varNotEmpty(req.query.userid)&& req.query.userid!="")
            {
                var userid=await User.idFromAuthorisation(req.headers.authorization)
                var userObj = new User(userid)
                var isAdmin= await userObj.isAdmin()
                
                if(isAdmin)
                {
                    var userToDelete = new User(req.query.userid)
                    var isAdmintoDelete= await userToDelete.isAdmin()
                    if(isAdmintoDelete==false)
                    {
                        //Delete all of user sessions.
                        var deleteSessions = await userToDelete.deleteAllSessions()
                        //Now we delete the user.
                        var deleteUser = await userToDelete.delete()
                        res.status(200).json({ success: deleteUser, data: { message: null} })


                    }else{
                        //Can't delete admin.
                        res.status(405).json({ success: false, data: { message: 'CANT_DELETE_ADMIN'} })

                    }

                } 
                else{
                    res.status(401).json({ success: false, data: { message: 'ONLY_ADMIN_CAN_DELETE_USER'} })
    
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