import { Filters } from '@/helpers/api/classes/Filters';
import { User } from '@/helpers/api/classes/User';
import { getFiltersFromDB } from '@/helpers/api/filter';
import { deleteTemplatefromDB } from '@/helpers/api/template';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation, getUserIDFromLogin} from '@/helpers/api/user';
export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        if(await middleWareForAuthorisation(req,res))
        {
            if(req.query.id)
            {
                // var userid=await User.idFromAuthorisation(req.headers.authorization)
                const userid = await getUserIDFromLogin(req, res)
                if(userid==null){
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })
    
                }

                
                await deleteTemplatefromDB(req.query.id, userid)

                return res.status(200).json({ success: true, data: { message: "DELETE_OK"} })
                    // if(response==null)
                    // {

                    // }
                    // else
                    // {
                    //     console.log(response)
                    //     res.status(200).json({ success: false, data: { message:"DELETE_ERROR",details: response} })

                    // }

                
    
            }else{
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