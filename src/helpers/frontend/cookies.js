import Cookies from 'js-cookie'
import { getAuthenticationHeadersforUser } from './user'
import { getAPIURL, logVar, varNotEmpty } from '../general'
import { getMessageFromAPIResponse } from './response'

export function setCookie(cname, cvalue, exdays=10000)
{

    Cookies.set(cname, cvalue, { expires: exdays })

}

export async function getDefaultCalendarID()
{
    //Cookies.get("DEFAULT_CALENDAR_ID")
    const url_api=getAPIURL()+"settings/getone?name=DEFAULT_CALENDAR"
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }

    return new Promise( (resolve, reject) => {

        try{
            fetch(url_api, requestOptions)
            .then(response =>{
                return response.json()
            } )
            .then((body) =>{
                if(varNotEmpty(body) && varNotEmpty(body.success))
                {
                    var message= getMessageFromAPIResponse(body)
                    return resolve(message)
                }else{
                    return resolve('')
                }
            })
    
        }
        catch(e)
        {
            logVar(e, "getDefaultCalendarID")
            return resolve('')
        }

    })

}

export function setDefaultCalendarID(calendars_id)
{
    Cookies.set("DEFAULT_CALENDAR_ID", calendars_id, { expires: 3650 })
}
