import { User } from '@/helpers/api/classes/User';
import { insertNewFiltertoDB } from '@/helpers/api/filter';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation} from '@/helpers/api/user';
import validator from 'validator';
export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            if(req.body.name!=null && req.body.name!=""&&req.body.filtervalue!=null&&req.body.filtervalue!="")
            {
                var userid=await User.idFromAuthorisation(req.headers.authorization)
                var jsonToInsert =  JSON.stringify(req.body.filtervalue) 
                var dbInsertResponse = insertNewFiltertoDB(req.body.name, jsonToInsert, userid)
                res.status(200).json({ success: true, data: { message: "FILTER_INSERT_OK"} })
    
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