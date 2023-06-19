import Cookies from "js-cookie";
import { varNotEmpty } from "../general";

export function getCalendarsToShow(){
    return Cookies.get("USER_PREFERENCE_CALENDARS_TO_SHOW")
}

export function setCalendarstoShow(preferenceObject: {account:{caldav_accounts_id: number, show: boolean}, calendars: {calendars_id: number, caldav_accounts_id: number, show: boolean,}[] }[]){
    Cookies.set("USER_PREFERENCE_CALENDARS_TO_SHOW", JSON.stringify(preferenceObject), { expires: 10000 })

}

 export function isValid_UserPreference_CalendarsToShow(preferenceObject: any): boolean{


    if(varNotEmpty(preferenceObject) && Array.isArray(preferenceObject) && preferenceObject.length>0)
    {
        for(const i in preferenceObject)
        {
            if(!varNotEmpty(preferenceObject[i].account) || varNotEmpty( preferenceObject[i].account.caldav_accounts_id) || !varNotEmpty(preferenceObject[i].account.show) || typeof(preferenceObject[i].account.show)!="boolean" || !varNotEmpty(preferenceObject[i].calendars) || Array.isArray(preferenceObject[i].calendars) ==false ) {
                    return false
            }
        }

    }else{
        return false
    }


    return true
} 