import Cookies from "js-cookie";
import { isValidResultArray, logError, varNotEmpty } from "../general";
import SettingsHelper from "./classes/SettingsHelper";

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

export function getStandardDateFormat()
{
    return "DD/MM/YYYY HH:mm"
}

export async function getDefaultViewForCalendar()
{
    return new Promise((resolve, reject) => {
        
        var settingValue= Cookies.get("DEFAULT_VIEW_CALENDAR")
        if(varNotEmpty(settingValue) && settingValue!="")
        {
            return resolve(settingValue)
        }else{
            //Get from Server.
            SettingsHelper.getFromServer("DEFAULT_VIEW_CALENDAR").then((fromServer)=>{
                if(varNotEmpty(fromServer) && fromServer!="")
                {
                    return resolve(fromServer)
                }else{
                    return resolve(settingValue)
                }
    
            })
        }
    
    })
}


