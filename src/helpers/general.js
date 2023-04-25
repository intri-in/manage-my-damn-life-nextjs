import { dueDatetoUnixStamp } from "./frontend/general"

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
    var dateNew = new Date()
    var date = dateNew.getDate()+"/"+(dateNew.getMonth()+1)+"/"+dateNew.getFullYear()+" 23:59"
    return dueDatetoUnixStamp(date)

}

export function addTrailingSlashtoURL(url)
{
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
    if(haystack==null || haystack==undefined)
    {
        return false
    }
        const regex = new RegExp(needle+"*");

         var toSearch = haystack.toLowerCase()

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

export function isNumber(value) {
    if (typeof value === "string") {
        return !isNaN(value);
    }
}

export function logError(error, additionalDetails)
{
    if(process.env.NEXT_PUBLIC_DEBUG_MODE=="true" || process.env.NEXT_PUBLIC_DEBUG_MODE==true)
    {
        console.log("=====================")
        console.log(error)
        console.log(additionalDetails)
        console.log("=====================")
    
    }

}

export function logVar(variable,tag)
{
    if(process.env.NEXT_PUBLIC_DEBUG_MODE=="true" || process.env.NEXT_PUBLIC_DEBUG_MODE==true)
    {
        console.log("=====================")
        if(varNotEmpty(tag)) console.log(tag)
        if(varNotEmpty(variable)) console.log(variable)
        console.log("=====================")
    
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
    return addTrailingSlashtoURL(process.env.NEXT_PUBLIC_API_URL)
}
