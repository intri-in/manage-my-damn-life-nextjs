import { Filters } from '@/helpers/api/classes/Filters';
import { User } from '@/helpers/api/classes/User';
import { getFiltersFromDB } from '@/helpers/api/filter';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation, getUserIDFromLogin} from '@/helpers/api/user';
export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        if(await middleWareForAuthorisation(req,res))
        {
            if(req.query.filterid!=null &&req.query.filterid!=""&&req.query.filterid!=undefined)
            {
                // var userid=await User.idFromAuthorisation(req.headers.authorization)
                var userid = await getUserIDFromLogin(req, res)
                if(userid==null){
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })
    
                }

                var filterObject= new Filters(req.query.filterid)
                
                if(Filters.userHasAccess(userid))
                {
                    var response = await filterObject.delete()

                    if(response==null)
                    {
                        res.status(200).json({ success: true, data: { message: "DELETE_OK"} })

                    }
                    else
                    {
                        console.log(response)
                        res.status(200).json({ success: false, data: { message:"DELETE_ERROR",details: response} })

                    }

                }else
                {
                    res.status(401).json({ success: false, data: { message: 'NO_ACCESS_TO_FILTER'} })

                }
    
            }else{
                res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })

            }
            
    
           

        }
        else
        {
            res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }
    else {
        res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
}