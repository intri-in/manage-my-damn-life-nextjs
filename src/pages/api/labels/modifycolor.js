import {  modifyLabelColour, updateLabels } from '@/helpers/api/cal/labels';
import { User } from '@/helpers/api/classes/User';
import { middleWareForAuthorisation, } from '@/helpers/api/user';
export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            var userid=await User.idFromAuthorisation(req.headers.authorization)

            if(req.body.labelname!=null &&req.body.labelname!=""&&req.body.labelname!=undefined && req.body.colour!=null &&req.body.colour!=""&&req.body.colour!=undefined)
            {
                var modifyReponse = await modifyLabelColour(req.body.labelname, req.body.colour, userid)

                if(modifyReponse == null)
                {
                    res.status(200).json({ success: true, data: { message: "LABEL_UPDATED"} })

                }else{
                    res.status(200).json({ success: false, data: { message: modifyReponse} })
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
        res.status(403).json({ success: false ,data: {message: 'INVALID_METHOD'}})
    }
}