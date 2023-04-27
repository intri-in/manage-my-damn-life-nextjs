import { middleWareForAuthorisation } from "@/helpers/api/user"
import ICAL from '@/../ical.js/build/ical'
import { isValidResultArray, logError, varNotEmpty } from "@/helpers/general";
export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            var type="vevent"
            var dataICS= req.body.ics
            var dataICS="BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:DAVx5/4.3.1-ose ical4j/3.2.7 (at.techbee.jtx)\nBEGIN:VTODO\nDTSTAMP:20230426T141018Z\nUID:e2a44cc4-de64-4f24-80d5-c7652eb2af22\nSEQUENCE:6\nCREATED:20230426T193533Z\nLAST-MODIFIED:20230426T141008Z\nSUMMARY:Test jtx board task \n DESCRIPTION:asdasd\nRESOURCES:Yhh\nATTENDEE;CN=Ghjj;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT:\nPERCENT-COMPLETE:0\nPRIORITY:0\nEND:VTODO\nEND:VCALENDAR"
            if(varNotEmpty(req.body.type) && req.body.type!="")
            {
                type=req.body.type.toLowerCase()
            }
            var json={}
            try{
                var jcalData= ICAL.parse(dataICS);
                var comp = new ICAL.Component(jcalData);
                var vevent = comp.getFirstSubcomponent(type);
                var veventJSON = vevent.toJSON()

                console.log(veventJSON)
                if(isValidResultArray(veventJSON) && veventJSON.length>=2)
                {
                    var data = veventJSON[1]
                    for( const i in data)
                    {
                        if(isValidResultArray(data[i]) && data[i].length>=4)
                        {
                            var arrayValue = []
                            var value = data[i][3]
                            var additional = data[i][1]
                            console.log(data[i].length, data[i][0])
                            if(data[i].length>4)
                            {
                                for (let j=3;j<data[i].length; j++)
                                {
                                    arrayValue.push(data[i][j])
                                }

                                value = ""
                                additional=arrayValue

                            }
                            json[data[i][0]]={value: value, additional: additional}
                        }
                    }
                }
            }catch(e)
            {
                logError(e, "parseics_ical.js API")
            }
        
            console.log(json)
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