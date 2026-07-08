import { Filters } from '@/helpers/api/classes/Filters';
import { updateFilterinDB } from '@/helpers/api/filter';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation, getUserIDFromLogin} from '@/helpers/api/user';
import { checkIfFilterValid } from '@/helpers/frontend/filtersTS';
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})

    if(!await middleWareForAuthorisation(req,res)) return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })
    const filtervalue = req.body.filtervalue
    const filterId = req.body.custom_filters_id
    if(!filterId || !req.body.name || !filtervalue || (filtervalue && !checkIfFilterValid(req.body.filtervalue).status)) return res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })
    
    const userid = await getUserIDFromLogin(req, res)
    if(!userid) return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })
                
    if(!await Filters.userHasAccess(userid,filterId)) return res.status(401).json({ success: false, data: { message: 'NO_ACCESS_TO_FILTER'} })
    
    
    let jsonToInsert =  JSON.stringify(req.body.filtervalue) 


    await updateFilterinDB(req.body.custom_filters_id, req.body.name, jsonToInsert)
    return res.status(200).json({ success: true, data: { message: "FILTER_UPDATE_OK"} })
    
     

}