import { toast } from "react-toastify"
import { getErrorResponse } from "../errros"
import { getAPIURL, isValidResultArray, logVar } from "../general"
import { caldavAccountsfromServer } from "./calendar"
import { getAuthenticationHeadersforUser } from "./user"
import { syncCalDAVSummary } from "./dexie/syncDexie"
import { getMessageFromAPIResponse } from "./response"
import { getCalDAVSummaryFromDexie } from "./dexie/caldav_dexie"
import { saveAPIEventReponseToDexie } from "./dexie/events_dexie"
import { Preference_CalendarsToShow } from "./classes/UserPreferences/Preference_CalendarsToShow"
import { getSyncTimeout } from "./settings"
import { IS_SYNCING, LASTSYNC, getValueFromLocalStorage } from "./localstorage"
import { getI18nObject } from "./general"

const i18next = getI18nObject()
export function isSyncing(){
    const isSyncingFromLocal = getValueFromLocalStorage(IS_SYNCING)

    return (isSyncingFromLocal==true ||  isSyncingFromLocal=="true")
}
export function shouldSync(){
    const userSetTimeout = getSyncTimeout()
    const isSyncing = getValueFromLocalStorage(IS_SYNCING)
    // if(isSyncing){
    //     return false
    // }
    
    let lastSync = getValueFromLocalStorage(LASTSYNC)
    if(!lastSync || isNaN(Number(lastSync))){
        lastSync = Date.now()
        localStorage.setItem(LASTSYNC, lastSync)
    }
    const timeFromLastSync = Date.now() - lastSync
    if(timeFromLastSync < userSetTimeout)
    {
        return false
    } 
    
    return true
    
}

    
export async function initAutoSync(){
    localStorage.setItem(LASTSYNC, Date.now())
    
    //Check if the user even has any CalDAV accounts.
    const calDAVSummary = await getCalDAVSummaryFromDexie()
    let continueSync = false
    if(isValidResultArray(calDAVSummary)){
        for (const i in calDAVSummary){
            if(isValidResultArray(calDAVSummary[i].calendars)){
                // User probably has valid calendars. We continue sync.
                continueSync=true
            }
        }
    }
    if(continueSync){
        
        console.log(new Date(Date.now()), i18next.t("AUTO_SYNC_START"))
        // localStorage.setItem(IS_SYNCING, true)
        //fetchLatestEventsV2()
    }
}
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
/**
 * @deprecated v0.4.0
 * @param {*} refreshCalList 
 */
export async function fetchLatestEvents(refreshCalList)
{
    console.error("fetchLatestEvents DEPRECATED: v0.4.0")

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

export async function fetchLatestEventsV2(refreshCalList)
{
    if(isSyncing()){
        toast.warn(i18next.t("ALREADY_SYNCING"))
    }
    localStorage.setItem(IS_SYNCING, true)
    await refreshCalendarListV2()
    const arrayFromDexie = await getCalDAVSummaryFromDexie()
    if(isValidResultArray(arrayFromDexie)){
        for(const i in arrayFromDexie){
            if(isValidResultArray(arrayFromDexie[i]["calendars"])){
                for(const j in arrayFromDexie[i]["calendars"]){
                    const cal = arrayFromDexie[i]["calendars"][j]
                    console.log("Syncing Calendar: "+cal["displayName"])
                    const events= await fetchFreshEventsFromCalDAV_ForDexie(arrayFromDexie[i]["caldav_accounts_id"], cal["url"], cal["ctag"], cal["syncToken"])
                    //Now we save these events in dexie.
                    saveAPIEventReponseToDexie(cal["calendars_id"],events)

                }
            }
            //saveEventsIntoDexie(caldav_account)

        }
    }
    localStorage.setItem(IS_SYNCING, false)
    localStorage.setItem(LASTSYNC, Date.now())

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

export async function fetchFreshEventsFromCalDAV_ForDexie(caldav_accounts_id,url,ctag, syncToken){
    const url_api=getAPIURL()+"v2/calendars/events/fetch?caldav_accounts_id="+caldav_accounts_id+"&&url="+url+"&&ctag="+ctag+"&&syncToken="+syncToken
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
            if(body && body.success && body.data && body.data.message){
            
                return resolve(body.data.message)     
            }else{
                return resolve(null)
            }
        }).catch(e =>{
            console.error("refreshEventsinDB", e)
            return resolve(getErrorResponse(e))

        })

       
    })

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
export async function refreshCalendarListV2()
{
    const url_api=getAPIURL()+"v2/calendars/refresh"

    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }
    Preference_CalendarsToShow.remove()
    return new Promise( (resolve, reject) => {

        
            const response =  fetch(url_api, requestOptions)
            .then(response => response.json())
            .then((body) =>{
                if(body && body.success && body.data && isValidResultArray(body.data.details)){
                    const calDAVSummaryFromServer = body.data.details
                    syncCalDAVSummary(calDAVSummaryFromServer)

                }else{
                    if(body && getMessageFromAPIResponse(body) =="NO_CALDAV_ACCOUNTS"){
                        syncCalDAVSummary([])
                    }
                }
                return resolve(body)     
            }).catch(e =>{
                console.error(e, "refreshCalendarListV2")
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
                return resolve(body)     
            }).catch(e =>{
                logVar(e, "refreshCalendarList")
                return resolve(getErrorResponse(e))
            })
    
      

    })

}