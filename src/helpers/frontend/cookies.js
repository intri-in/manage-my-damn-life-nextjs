import Cookies from 'js-cookie'
import { getAuthenticationHeadersforUser } from './user'
import { getAPIURL, logVar, varNotEmpty } from '../general'
import { getMessageFromAPIResponse } from './response'
import { clearLocalStorage } from './localstorage'

export function deleteAllCookies(){
    Cookies.remove("DEFAULT_CALENDAR_ID")
    Cookies.remove("MMDL_USERNAME")
    Cookies.remove("USER_SETTING_SYNCTIMEOUT")
    Cookies.remove("USER_DATA_LABELS")
    Cookies.remove("DEFAULT_VIEW_CALENDAR")
    Cookies.remove("USERHASH")
    Cookies.remove("USER_PREFERENCE_CALENDARS_TO_SHOW")
    Cookies.remove("SSID")
    Cookies.remove("MMDL_CALENDAR_START_DAY")
    Cookies.remove("MMDL_USER_CALENDARS")
    Cookies.remove("MMDL_INSTALL_CHECK")
    clearLocalStorage()
    
}

export function setCookie(cname, cvalue, exdays=10000)
{

    Cookies.set(cname, cvalue, { expires: exdays })

}

export async function getDefaultCalendarID()
{
    var fromCookie=Cookies.get("DEFAULT_CALENDAR_ID")
    if(varNotEmpty(fromCookie) && fromCookie!=""){
        return fromCookie
    }
    const url_api=getAPIURL()+"settings/getone?name=DEFAULT_CALENDAR"
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }

    return new Promise( (resolve, reject) => {

            fetch(url_api, requestOptions)
            .then(response =>{
                return response.json()
            } )
            .then((body) =>{
                if(varNotEmpty(body) && varNotEmpty(body.success))
                {
                    var message= getMessageFromAPIResponse(body)
                    if(varNotEmpty(message) && message!="")
                    {
                        setDefaultCalendarID(message)

                    }
                    return resolve(message)
                }else{
                    return resolve('')
                }
            }).catch(e =>{
                console.error(e, "getDefaultCalendarID")
                return resolve('')
            })

    })

}
export function setDefaultCalendarID(calendars_id)
{
    Cookies.set("DEFAULT_CALENDAR_ID", calendars_id, { expires: 3650 })
}

export function setUserNameCookie(username){
    Cookies.set("MMDL_USERNAME", username, { expires: 3650 })

}

export function getUserNameFromCookie(){
    return Cookies.get("MMDL_USERNAME")
}

export function setInstallOKCookie(time){
    Cookies.set("MMDL_INSTALL_CHECK", time, { expires: 3650 } )
}

export function getInstallCheckCookie(){
    return Cookies.get("MMDL_INSTALL_CHECK")

}