import { Filters } from '@/helpers/api/classes/Filters';
import { User } from '@/helpers/api/classes/User';
import { getFiltersFromDB } from '@/helpers/api/filter';
import { middleWareForAuthorisation, getUserIDFromLogin} from '@/helpers/api/user';
import validator from 'validator'
export default async function handler(req, res) {
    if (req.method !== 'DELETE')         return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})

    if(!await middleWareForAuthorisation(req,res)) return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

    if(!req.query.filterid) return res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })

    const userid = await getUserIDFromLogin(req, res)
    if(!userid) return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })
    
    const filterId = validator.escape(req.query.filterid)
    let filterObject= new Filters(filterId)
                
    if(!await Filters.userHasAccess(userid,filterId)) return res.status(401).json({ success: false, data: { message: 'NO_ACCESS_TO_FILTER'} })

    await filterObject.delete(userid)

                    
    return res.status(200).json({ success: true, data: { message: "DELETE_OK"} })
            
    
           

      
   
}