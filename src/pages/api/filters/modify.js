import { User } from '@/helpers/api/classes/User';
import { insertNewFiltertoDB,  updateFilterinDB } from '@/helpers/api/filter';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation} from '@/helpers/api/user';
import validator from 'validator';
export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            console.log(req.body)
            if(req.body.custom_filters_id!=undefined && req.body.custom_filters_id!=null && req.body.custom_filters_id!="" && req.body.name!=undefined && req.body.name!=null && req.body.name!="" && req.body.filtervalue!=null&&req.body.filtervalue!="")
            {
                var userid=await User.idFromAuthorisation(req.headers.authorization)
                var jsonToInsert =  JSON.stringify(req.body.filtervalue) 
                var dbInsertResponse = await updateFilterinDB(req.body.custom_filters_id, req.body.name, jsonToInsert, userid)
                var response = "FILTER_UPDATE_OK"
                if(dbInsertResponse!=null)
                {
                    response=dbInsertResponse
                }
                res.status(200).json({ success: true, data: { message: response} })
    
            }
            else
            {
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