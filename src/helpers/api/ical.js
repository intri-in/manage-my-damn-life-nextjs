import ICAL from 'ical.js'
import { isValidResultArray, logError, varNotEmpty } from "@/helpers/general";


export function getICS(obj)
{
    var icalToolkit = require('ical-toolkit');
    var builder = icalToolkit.createIcsFileBuilder();
    builder.spacers = false; //Add space in ICS file, better human reading. Default: true
    builder.NEWLINE_CHAR = '\n'; //Newline char to use.
    builder.throwError = true; //If true throws errors, else returns error when you do .toString() to generate the file contents.
    builder.ignoreTZIDMismatch = true; //If TZID is invalid, ignore or not to ignore!

    builder.method = '';
    builder.events.push(obj)
    var icsFileContent = builder.toString();

    return icsFileContent
}

export function parseICSWithICALJS(dataICS, type)
{
    var json={}
    try{
        var jcalData= ICAL.parse(dataICS);
        console.log("comp", jcalData)
        var comp = new ICAL.Component(jcalData);
        var vevent = comp.getFirstSubcomponent(type);
        var veventJSON = vevent.toJSON()

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

        }catch(e){
            // console.log("parse Error 2", e, dataICS)
        }

        return json
}