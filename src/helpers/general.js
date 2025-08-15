import moment from "moment"
import { dueDatetoUnixStamp } from "./frontend/general"

export const DAY_ARRAY = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
/**
 * Checks if a variable is an array of length >0
 * @param {*} array 
 * @returns Boolean
 */
export function isValidResultArray(array)
{
    if(array!=null && Array.isArray(array) && array.length>0)
    {
        return true
    }
    else
    {
        return false
    }
}


export function isValidObject(object)
{
    if(object!=null && Object.keys(object).length>0)
    {
        return true
    }
    else
    {
        return false
    }
}

export function getRandomColourCode()
{
    var colour_code="#"+Math.floor(Math.random()*16777215).toString(16)
    return colour_code.toUpperCase()
}

export function getTodaysDateUnixTimeStamp()
{
    // var dateNew = new Date()
    // var date = dateNew.getDate()+"/"+(dateNew.getMonth()+1)+"/"+dateNew.getFullYear()+" 23:59"
    // return dueDatetoUnixStamp(date)

    return moment().unix()

}
export function getTodaysDayEnd_ISOString(){
    const now = moment()
    return now.endOf('day').toISOString()
}

export function getTimeNow_ISOString(){
    const now = moment().toISOString()
    return now
}

export function getSevenDaysEnd_ISOString(){
    const now = moment().add(7, "days")
    return now.endOf('day').toISOString()

}
export function isValidDateString(dateString){
    let date = new Date(dateString);
    return date instanceof Date && !isNaN(date.valueOf())
}

export function addTrailingSlashtoURL(url)
{
    if(varNotEmpty(url)==false){
        return ""
    }
    var lastChar = url.substr(-1); 
    if (lastChar != '/') {       
    url = url + '/';          
    }

    return url

}

export function replaceNewLineCharacters(string)
{
    return string.replace(/(?:\r\n|\r|\n)/g, '\\n');
}

export function replaceSpacewithHyphen(str)
{
    var replaced = str.replace(/ /g, '-');
    return replaced
}

export function dateTimeReviver(key, value) {
    var a;
    if (typeof value === 'string') {
        a = /\/Date\((\d*)\)\//.exec(value);
        if (a) {
            return new Date(+a[1]);
        }
    }
    return value;
}

export function haystackHasNeedle(needle, haystack)
{
    // console.log(haystack)
    if(haystack==null || haystack==undefined)
    {
        return false
    }
        const regex = new RegExp(needle+"*");

         var toSearch = haystack.toString().toLowerCase()

            if(toSearch.includes(needle.toLowerCase()))
            {
                return haystack
            }


        
    

    return ""

}

export function varNotEmpty(variable)
{

    if(variable!=null && variable!=undefined)
    {
        return true
    }else
    {
        return false
    }
}
export function isStringEmpty(val){
    if(!varNotEmpty(val)){
        return true
    }
    if(val.trim()==""){
        return true
    }

    return false
}
export function isNumber(value) {
    if (typeof value === "string") {
        return !isNaN(value);
    }
}

export function varIsANumber(value){
    if(value){
        if(!isNaN(Number(value))){
            return true
        }
    }

    return false
}


export function appendLangParamtoURL(url, lng, langArray)
{
    const urlNew= new URL(url)
    const paramlng = urlNew.searchParams.get("lng")
    if(paramlng){
        if(langArray.includes(paramlng)){
            return urlNew
        }else{
            urlNew.searchParams.delete("lng")
            urlNew.searchParams.append("lng", lng)
        }
    }else{
        if(urlNew.searchParams.has("lng")){
            urlNew.searchParams.delete("lng")
            urlNew.searchParams.append("lng", lng)
            return urlNew
        }
        urlNew.searchParams.append("lng", lng)
    }

    return urlNew

}

export function logError(error, additionalDetails)
{
    if(process.env.NEXT_PUBLIC_DEBUG_MODE=="true" || process.env.NEXT_PUBLIC_DEBUG_MODE==true)
    {
        console.error("=====================")
        console.error(error)
        console.error(additionalDetails)
        console.error("=====================")
    
    }

}

export function logVar(variable,tag)
{
    if(process.env.NEXT_PUBLIC_DEBUG_MODE=="true" || process.env.NEXT_PUBLIC_DEBUG_MODE==true)
    {
        console.log("=====================")
        if(varNotEmpty(tag)) console.log(tag)
        if(varNotEmpty(variable)) console.log(variable)
    
    }
}
export function debugging()
{
    if(process.env.NEXT_PUBLIC_DEBUG_MODE=="true" || process.env.NEXT_PUBLIC_DEBUG_MODE==true)
    {
        return true
    }else{
        return false
    }
}

export function getAPIURL()
{
    // console.log("process.env.NEXT_PUBLIC_BASE_URL", process.env.NEXT_PUBLIC_BASE_URL)
    // return addTrailingSlashtoURL(process.env.NEXT_PUBLIC_BASE_URL)+"/api/"

    return "/api/"
    /*
    try{
        if(window!=undefined)
        {
            return window.location.href
        }
    
    }
    catch(e)
    {
        logError(e, "getAPIURL")
    }
    return "/api/"
    */
}
export function fixDueDate(inputDate) {
    let dueDate = ""
    let dueDateUnix = moment(inputDate, 'D/M/YYYY H:mm').unix() * 1000;
    dueDate = moment(dueDateUnix).format('YYYYMMDD');
    dueDate += "T" + moment(dueDateUnix).format('HHmmss');

    return dueDate
}
export function fixDueDateWithFormat(inputDate, dateFormat) {
    let dueDate = ""
    let dueDateUnix = moment(inputDate, dateFormat).unix() * 1000;
    dueDate = moment(dueDateUnix).format('YYYYMMDD');
    dueDate += "T" + moment(dueDateUnix).format('HHmmss');

    return dueDate
}

export function getISO8601Date(date, skipTime)
{
    var toReturn = ""
    if(date!=null)
    {
        var dueDateUnix= moment(date).unix()*1000;
        toReturn =  moment(dueDateUnix).format('YYYYMMDD');
        if(skipTime==null || skipTime!="null" && skipTime==false)
        {
            toReturn +=  "T"+moment(dueDateUnix).format('HHmmss');

        }
    }
    else{
        return null
    }
    return toReturn
}

export function dayNameFromNumber(dayNumber){

    const dayArray = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
    if(dayNumber>0 && dayNumber<dayArray.length-1){
        return dayArray[dayNumber]
    }

    return ""

}

export function isEmptyObj(obj) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }
  
    return true;
  }

export function stringInStringArray(toSearch, haystackArray){
    for (const i in haystackArray)
    {
        if(haystackArray[i]==toSearch)
        {
            return true
        }
    }
    return false

}

export function isValidJSON(stringTocheck){
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}