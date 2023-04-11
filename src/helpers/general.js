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

