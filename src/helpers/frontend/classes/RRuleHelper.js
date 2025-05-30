import { getAPIURL, varNotEmpty } from "@/helpers/general";
import { getI18nObject } from "../general";
import moment from "moment";


export class RRuleHelper{

    constructor()
    {
        
    }
    static isValidObject(rruleObject)
    {
        if(varNotEmpty(rruleObject) && varNotEmpty(rruleObject.FREQ) && varNotEmpty(rruleObject.INTERVAL) && rruleObject.FREQ!="" && rruleObject.INTERVAL!="")
        {
            return true
        }

        return false

    }

    static getEmptyObject()
    {
        var toReturn =  {"FREQ": "", "UNTIL": "", "INTERVAL": "", "COUNT":""}
    
        return toReturn
    }

    static rruleToObject(rrule)
    {
        var objectToReturn = {"FREQ": "", "INTERVAL":"", "UNTIL":""}
        if(varNotEmpty(rrule) && rrule!="" &&typeof(rrule)=="string")
        {
            var burst = rrule.split(';')
    
            if(varNotEmpty(burst) && Array.isArray(burst))
            {
                for(const i in burst)
                {
                    if(burst[i].startsWith("FREQ="))
                    {
                        var freq = burst[i].split('=')[1]
                        objectToReturn["FREQ"]=freq
                    }
    
                    if(burst[i].startsWith("INTERVAL="))
                    {
                        var interval = burst[i].split('=')[1]
                        objectToReturn["INTERVAL"]=interval
    
                    }
                    if(burst[i].startsWith("UNTIL="))
                    {
                        var interval = burst[i].split('=')[1]
                        objectToReturn["UNTIL"]=interval
    
                    }
    
                }
            }
        }
    
        if(objectToReturn["INTERVAL"]=="" && objectToReturn["FREQ"]!="" )
        {
            objectToReturn["INTERVAL"]=1
        }
        return objectToReturn
    
    }
    
    static stringToObject(rrule)
    {
        var objectToReturn = this.getEmptyObject()
        if(varNotEmpty(rrule) && rrule!="" &&typeof(rrule)=="string")
        {
            var burst = rrule.split(';')
    
            if(varNotEmpty(burst) && Array.isArray(burst))
            {
                for(const i in burst)
                {
                    if(burst[i].startsWith("FREQ="))
                    {
                        var freq = burst[i].split('=')[1]
                        objectToReturn["FREQ"]=freq
                    }
    
                    if(burst[i].startsWith("INTERVAL="))
                    {
                        var interval = burst[i].split('=')[1]
                        objectToReturn["INTERVAL"]=interval
    
                    }
                    if(burst[i].startsWith("UNTIL="))
                    {
                        var interval = burst[i].split('=')[1]
                        objectToReturn["UNTIL"]=interval
    
                    }
    
                }
            }
        }
    
        if(objectToReturn["INTERVAL"]=="" && objectToReturn["FREQ"]!="" )
        {
            objectToReturn["INTERVAL"]=1
        }
        return objectToReturn
    
    }
    
    static parseObject(formDataRRule)
    {
        var toReturn = this.getEmptyObject()
        toReturn["UNTIL"] = formDataRRule["UNTIL"]
    
        if(formDataRRule["FREQ"]=="DAYS"){
            toReturn["FREQ"] = "DAILY"
    
        }
    
        if(formDataRRule["FREQ"]=="WEEKS"){
            toReturn["FREQ"] = "WEEKLY"
    
        }
        if(formDataRRule["FREQ"]=="MONTHS"){
            toReturn["FREQ"] = "MONTHLY"
        }
        toReturn["INTERVAL"] = formDataRRule["INTERVAL"]
        toReturn["COUNT"] = formDataRRule["COUNT"]
        return toReturn
    }

    static objectToStringObject(formDataRRule)
    {
        var toReturn = this.getEmptyObject()
        toReturn["UNTIL"] = formDataRRule["UNTIL"]

        if(formDataRRule["FREQ"]=="DAYS"){
            toReturn["FREQ"] = "DAILY"

        }

        if(formDataRRule["FREQ"]=="WEEKS"){
            toReturn["FREQ"] = "WEEKLY"

        }
        if(formDataRRule["FREQ"]=="MONTHS"){
            toReturn["FREQ"] = "MONTHLY"
        }
        toReturn["INTERVAL"] = formDataRRule["INTERVAL"]
        toReturn["COUNT"] = formDataRRule["COUNT"]

        return toReturn
    }


    static stringObjectToWords(rrule, i18next)
    {
        var words = ""
        if(varNotEmpty(rrule))
        {
            if(rrule["FREQ"]!="")
            {
                if(rrule["INTERVAL"]=="1" || rrule["INTERVAL"]=="" || rrule["INTERVAL"]==1 )
                {
                    if(rrule["FREQ"]=="DAILY")
                    {
                        words+=i18next("EVERY")+" "+i18next("DAY").toLowerCase()
                    }
    
                    if(rrule["FREQ"]=="WEEKLY")
                    {
                        words+=i18next("EVERY")+" "+i18next("WEEK").toLowerCase()
    
                    }
    
                    if(rrule["FREQ"]=="MONTHLY")
                    {
                        words+=i18next("EVERY")+" "+i18next("MONTH").toLowerCase()
    
                    }
    
                }else{
                    if(rrule["FREQ"]=="DAILY")
                    {
                        words+=i18next("EVERY")+" "+rrule["INTERVAL"]+" "+i18next("DAYS").toLowerCase()
                    }
    
                    if(rrule["FREQ"]=="WEEKLY")
                    {
                        words+=i18next("EVERY")+" "+rrule["INTERVAL"]+" "+i18next("WEEKS").toLowerCase()
    
                    }
    
                    if(rrule["FREQ"]=="MONTHLY")
                    {
                        words+=i18next("EVERY")+" "+rrule["INTERVAL"]+" "+i18next("MONTHS").toLowerCase()
    
                    }
                }
                if(rrule["UNTIL"]!="")
                {
                    words+=" "+i18next("UNTIL").toLowerCase()+" "+ new Date(moment(rrule["UNTIL"]))
                }
            }
    
           
    
        }
        return words
    }


}