import { middleWareForAuthorisation } from "@/helpers/api/user"
import ICAL from '@/../ical.js/build/ical'
import { isValidResultArray, logError, varNotEmpty } from "@/helpers/general";
export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(await middleWareForAuthorisation(req,res))
        {
            var type="vevent"
            var dataICS= req.body.ics
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

                // console.log(veventJSON)
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
                            // console.log(data[i].length, data[i][0])
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
        
            // console.log(json)
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