import { User } from "@/helpers/api/classes/User"
import { getICS } from "@/helpers/api/ical"
import { middleWareForAuthorisation } from "@/helpers/api/user"
import { varNotEmpty } from "@/helpers/general"
import { shouldLogforAPI } from "@/helpers/logs"
import moment from "moment"

export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(await middleWareForAuthorisation(req,res))
        {
            // console.log("input obj", req.body.obj)
            if(varNotEmpty(req.body.obj))
            {
                    
                try{
                    let obj = new Object()
                    for(const i in req.body.obj["obj"])
                    {
                        if(i!="start" || i!="end" )
                        {
                            obj[i]=req.body.obj["obj"][i]

                        }
                    }
                   
                    obj["start"] = new Date(req.body.obj["obj"]["start"])                   

                    if(req.body.obj["obj"]["uid"]){
                        obj["uid"]=req.body.obj["obj"]["uid"]
                    }
                    obj["end"] = new Date(req.body.obj["obj"]["end"]) 
                    if(req.body.obj["obj"]["sequence"]) obj["sequence"]=req.body.obj["obj"]["sequence"]
                    
                    if(varNotEmpty(req.body.obj["obj"].repeating) && varNotEmpty(req.body.obj["obj"].repeating.until))
                    {
                        if(req.body.obj["obj"].repeating.until.toString().trim()=="")
                        {
                            //Enter until date as 1year from now. Just a random default value.
                            let timetoRepeat = Date.now()+(86400*365*1)*1000
                            obj.repeating.until = new Date(moment(timetoRepeat))

                        }else{
                            obj.repeating.until = new Date(moment(req.body.obj["obj"]["repeating"]["until"]))

                        }

                    }
                    if(varNotEmpty(obj.stamp))
                    {
                        obj.stamp = new Date(obj.stamp)
                    }
                    if(shouldLogforAPI()) console.log(obj)

                    let ics=getICS(obj)

                    return res.status(200).json({ success: true, data: {message: ics} })


                }catch(e)
                {
                    console.log(e)
                    return  res.status(200).json({ success: false, data: {message: e.message} })

                }

            } else{
                return  res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })
            }

        }
        else
        {
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }else {
        return res.status(403).json({ success: false ,data: {message: 'INVALID_METHOD'}})
    }
}