import { getFiltersFromDB } from '@/helpers/api/filter';
import { middleWareForAuthorisation,  getUserIDFromLogin} from '@/helpers/api/user';
export default async function handler(req, res) {
   
    if (req.method !== 'GET') return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})

    if(!await middleWareForAuthorisation(req, res)) return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} }) 
            
    const userid = await getUserIDFromLogin(req, res)
    if(!userid) return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

    const allFilters= await getFiltersFromDB(userid)
    return  res.status(200).json({ success: true, data: { message: allFilters} })
    

}