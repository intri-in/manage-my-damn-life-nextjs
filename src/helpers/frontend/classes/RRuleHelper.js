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


    static stringObjectToWords(rrule)
    {
        var words = ""
        var i18next = getI18nObject()
        if(varNotEmpty(rrule))
        {
            if(rrule["FREQ"]!="")
            {
                if(rrule["INTERVAL"]=="1" || rrule["INTERVAL"]=="" || rrule["INTERVAL"]==1 )
                {
                    if(rrule["FREQ"]=="DAILY")
                    {
                        words+=i18next.t("EVERY")+" "+i18next.t("DAY").toLowerCase()
                    }
    
                    if(rrule["FREQ"]=="WEEKLY")
                    {
                        words+=i18next.t("EVERY")+" "+i18next.t("WEEK").toLowerCase()
    
                    }
    
                    if(rrule["FREQ"]=="MONTHLY")
                    {
                        words+=i18next.t("EVERY")+" "+i18next.t("MONTH").toLowerCase()
    
                    }
    
                }else{
                    if(rrule["FREQ"]=="DAILY")
                    {
                        words+=i18next.t("EVERY")+" "+rrule["INTERVAL"]+" "+i18next.t("DAYS").toLowerCase()
                    }
    
                    if(rrule["FREQ"]=="WEEKLY")
                    {
                        words+=i18next.t("EVERY")+" "+rrule["INTERVAL"]+" "+i18next.t("WEEKS").toLowerCase()
    
                    }
    
                    if(rrule["FREQ"]=="MONTHLY")
                    {
                        words+=i18next.t("EVERY")+" "+rrule["INTERVAL"]+" "+i18next.t("MONTHS").toLowerCase()
    
                    }
                }
                if(rrule["UNTIL"]!="")
                {
                    words+=" "+i18next.t("UNTIL").toLowerCase()+" "+ new Date(moment(rrule["UNTIL"]))
                }
            }
    
           
    
        }
        return words
    }


}