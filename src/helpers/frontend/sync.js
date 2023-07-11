import { toast } from "react-toastify"
import { getErrorResponse } from "../errros"
import { getAPIURL, isValidResultArray, logVar } from "../general"
import { caldavAccountsfromServer } from "./calendar"
import { getAuthenticationHeadersforUser } from "./user"

export async function makeSyncRequest()
{
    const url_api=getAPIURL()+"caldav/calendars/sync/all"
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }

    return new Promise( (resolve, reject) => {
       
            const response =  fetch(url_api, requestOptions)
            .then(response => response.json())
            .then((body) =>{
                return resolve(body)     
            }).catch(e =>{
                console.error("makeSyncRequest", e)
                return resolve(getErrorResponse(e))
    
            })
      
    })
}

export async function fetchLatestEvents(refreshCalList)
{
    await refreshCalendarList()
    var caldav_accounts= await caldavAccountsfromServer()
    if(isValidResultArray(caldav_accounts))
    {
        for (const i in caldav_accounts)
        {
            if(caldav_accounts[i].account.caldav_accounts_id)
            {
                var response = await refreshEventsinDB(caldav_accounts[i].account.caldav_accounts_id)
            }
        }
    }
}
export async function fetchLatestEventsWithoutCalendarRefresh()
{
    var caldav_accounts= await caldavAccountsfromServer()
    if(isValidResultArray(caldav_accounts))
    {
        for (const i in caldav_accounts)
        {
            if(caldav_accounts[i].account.caldav_accounts_id)
            {
                var response = await refreshEventsinDB(caldav_accounts[i].account.caldav_accounts_id)
            }
        }
    }
}

export async function refreshEventsinDB(caldav_accounts_id)
{
    const url_api=getAPIURL()+"caldav/calendars/events/all?caldav_accounts_id="+caldav_accounts_id
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }

    return new Promise( (resolve, reject) => {
       
        const response =  fetch(url_api, requestOptions)
        .then(response => response.json())
        .then((body) =>{
            return resolve(body)     
        }).catch(e =>{
            logVar(e, "refreshEventsinDB")
            return resolve(getErrorResponse(e))

        })

       
    })
    
}

export async function refreshCalendarList()
{
    const url_api=getAPIURL()+"calendars/refresh"

    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }

    return new Promise( (resolve, reject) => {

        
            const response =  fetch(url_api, requestOptions)
            .then(response => response.json())
            .then((body) =>{
                console.log("refreshCalendarList", body)
                return resolve(body)     
            }).catch(e =>{
                logVar(e, "refreshCalendarList")
                return resolve(getErrorResponse(e))
            })
    
      

    })

}