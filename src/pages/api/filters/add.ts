import { User } from '@/helpers/api/classes/User';
import { insertNewFiltertoDB } from '@/helpers/api/filter';
import { middleWareForAuthorisation, getUserIDFromLogin} from '@/helpers/api/user';
import { checkIfFilterValid } from '@/helpers/frontend/filtersTS';
import validator from 'validator';
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    if( !await middleWareForAuthorisation(req,res))  return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

    if(!req.body.name || !req.body.filtervalue) return res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })

    const filter = req.body.filtervalue
    const isFilterValid =  checkIfFilterValid(filter)
    if(!isFilterValid.status) return res.status(422).json({ success: false, data: {message: 'INVALID_INPUT', data:isFilterValid.message } })

    const userid = await getUserIDFromLogin(req, res)
    if(userid==null){
        return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

    }
    const jsonToInsert =  JSON.stringify(filter) 
    const dbInsertResponse = insertNewFiltertoDB(req.body.name, jsonToInsert, userid)
    return res.status(200).json({ success: true, data: { message: "FILTER_INSERT_OK"} })

   
   
}