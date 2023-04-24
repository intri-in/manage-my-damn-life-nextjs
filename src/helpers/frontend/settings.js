import Cookies from "js-cookie";
import { isValidResultArray, logError } from "../general";

export function getSyncTimeout()
{
    var timeout = Cookies.get("USER_SETTING_SYNCTIMEOUT")
    return 1000*60*5
}

export function setSyncTimeout(timeinMinutes)
{
    Cookies.set("USER_SETTING_SYNCTIMEOUT", timeinMinutes*60*1000, { expires: 10000 })
}

export function saveLabelArrayToCookie(labels)
{
    Cookies.remove("USER_DATA_LABELS")
    if(isValidResultArray(labels))
    {
        Cookies.set("USER_DATA_LABELS", JSON.stringify(labels), { expires: 10000 })
        
    }
}

export function getLabelArrayFromCookie()
{
    var array =[]
    try{
        array = JSON.parse(Cookies.get("USER_DATA_LABELS"))
    }catch(e)
    {
        logError(e, "getLabelArrayFromCookie")
    }

    return array

}