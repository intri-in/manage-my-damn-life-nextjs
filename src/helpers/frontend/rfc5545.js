import { varNotEmpty } from "../general"

export function parseVALARMTIME(VALARM)
{
    var toReturn ={RELATED: "", VALUE:""}
    for (const key in VALARM)
    {
         if(key.startsWith("TRIGGER"))
         {
            toReturn.VALUE=(parseTime(VALARM[key]))
            var indexofEqual = key.indexOf("=")
            var related = key.substring(indexofEqual+1, key.length)
            toReturn.RELATED=related
         }
    }

    return toReturn

}

/**
 * Parses RFC time, and converts to seconds.
 */
export function parseTime(time)
{
    var toReturn = 0
    var multiplier =1
    if(varNotEmpty(time)&&time!="")
    {
        if(time.startsWith("-"))
        {
            multiplier = -1
        }

        var timeMeasure = time.charAt(time.length-1);

        if(timeMeasure=="M")
        {
            // Minutes
            multiplier=multiplier*60

        }else if(timeMeasure=="H")
        {
            //Hours
            multiplier=multiplier*3600
        }

        var indexOfPT=time.indexOf("PT")
        var indexOfMeasure=time.indexOf(timeMeasure)

        var timeValue = time.substring(indexOfPT+2, indexOfMeasure)

        toReturn = timeValue

    }

    return toReturn*multiplier
}