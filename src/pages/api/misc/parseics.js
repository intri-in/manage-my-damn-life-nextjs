import { middleWareForAuthorisation } from "@/helpers/api/user"

export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(await middleWareForAuthorisation(req,res))
        {
            var icalToolkit = require('ical-toolkit');
            var json = icalToolkit.parseToJSON(req.body.ics);
        
            res.status(200).json({ success: true, data: { message: json} })

        }
        else
        {
            res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }else {
        res.status(403).json({ success: false ,data: {message: 'INVALID_METHOD'}})
    }
}