import Cookies from 'js-cookie'
import { getAuthenticationHeadersforUser } from './user'
import { getAPIURL, varNotEmpty } from '../general'
import { getMessageFromAPIResponse } from './response'

export function setCookie(cname, cvalue, exdays)
{

    Cookies.set(cname, cvalue, { expires: exdays })

}

export async function getDefaultCalendarID()
{
    //Cookies.get("DEFAULT_CALENDAR_ID")
    const url_api=getAPIURL+"settings/getone?name=DEFAULT_CALENDAR"
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
                resolve(message)
            }else{
                resolve('')
            }
        })

    })

}

export function setDefaultCalendarID(calendars_id)
{
    Cookies.set("DEFAULT_CALENDAR_ID", calendars_id, { expires: 3650 })
}
