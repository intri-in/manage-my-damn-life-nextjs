import Cookies from "js-cookie";
import { isValidResultArray, logError, varNotEmpty } from "../general";
import SettingsHelper from "./classes/SettingsHelper";
import { getValueFromLocalStorage } from "./localstorage";
import { isValidFullCalendarView } from "@/components/fullcalendar/FullCalendarHelper";

export const SETTING_NAME_CALENDAR_START_DAY="MMDL_CALENDAR_START_DAY"
export const SETTING_NAME_DEFAULT_VIEW_CALENDAR="DEFAULT_VIEW_CALENDAR"
export const SETTING_NAME_DEFAULT_CALENDAR = "DEFAULT_CALENDAR"

export function getSyncTimeout()
{
    var timeout = localStorage.getItem("USER_SETTING_SYNCTIMEOUT")
    return 1000*60*5
}

export function setSyncTimeout(timeinMinutes)
{
    if(!timeinMinutes && isNaN(timeinMinutes)){
        return
    }
    localStorage.setItem("USER_SETTING_SYNCTIMEOUT", timeinMinutes*60*1000)
}

export function saveLabelArrayToCookie(labels)
{
    Cookies.remove("USER_DATA_LABELS")
    if(isValidResultArray(labels))
    {
        Cookies.set("USER_DATA_LABELS", JSON.stringify(labels), { expires: 10000 })
        
    }
}
export function getCalendarStartDay(){
    const startDay= localStorage.getItem(SETTING_NAME_CALENDAR_START_DAY)
    
    if(isNaN(startDay)){
        return "1"
    }

    try{
        const startDayInt = parseInt(startDay)
        return startDayInt
    }catch(e){
        console.warn("getCalendarStartDay",e)
    }
  
    return "1"


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
export function setDefaultViewForCalendar(viewName){
    
    if(isValidFullCalendarView(viewName)){

        localStorage.setItem(SETTING_NAME_DEFAULT_VIEW_CALENDAR, viewName)
    }
}
export function getDefaultViewForCalendar()
{
    var settingValue= getValueFromLocalStorage(SETTING_NAME_DEFAULT_VIEW_CALENDAR)
    // console.log("settingValue", settingValue)
    if(isValidFullCalendarView(settingValue)){
        return settingValue
    }
    return null
    // return new Promise((resolve, reject) => {
        
    //     if(varNotEmpty(settingValue) && settingValue!="")
    //     {
    //         return resolve(settingValue)
    //     }else{
    //         //Get from Server.
    //         SettingsHelper.getFromServer("DEFAULT_VIEW_CALENDAR").then((fromServer)=>{
    //             if(varNotEmpty(fromServer) && fromServer!="")
    //             {
    //                 return resolve(fromServer)
    //             }else{
    //                 return resolve(settingValue)
    //             }
    
    //         })
    //     }
    
    // })
}


