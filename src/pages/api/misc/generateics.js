import { User } from "@/helpers/api/classes/User"
import { getICS } from "@/helpers/api/ical"
import { middleWareForAuthorisation } from "@/helpers/api/user"
import { varNotEmpty } from "@/helpers/general"
import moment from "moment"

export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            if(varNotEmpty(req.body.obj))
            {
                    
                try{
                    var obj = new Object()
                    for(const i in req.body.obj["obj"])
                    {
                        if(i!="start" || i!="end" )
                        {
                            obj[i]=req.body.obj["obj"][i]

                        }
                    }
                   
                    obj["start"] = new Date(req.body.obj["obj"]["start"])                   

                    
                    obj["end"] = new Date(req.body.obj["obj"]["end"]) 
                    if(varNotEmpty(req.body.obj["obj"].repeating) && varNotEmpty(req.body.obj["obj"].repeating.until))
                    {
                        obj.repeating.until = new Date(moment(req.body.obj["obj"]["repeating"]["until"]))

                    }
                    if(varNotEmpty(obj.stamp))
                    {
                        obj.stamp = new Date(obj.stamp)
                    }
                    console.log(obj)

                    var ics=getICS(obj)

                    res.status(200).json({ success: true, data: {message: ics} })


                }catch(e)
                {
                    console.log(e)
                    res.status(200).json({ success: false, data: {message: e.message} })

                }

            } else{
                res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })
            }

        }
        else
        {
            res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }else {
        res.status(403).json({ success: false ,data: {message: 'INVALID_METHOD'}})
    }
}