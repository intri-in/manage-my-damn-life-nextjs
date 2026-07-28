import { toast } from "react-toastify"
import { getRandomString } from "../crypto"
import {  getCalDAVAccountIDFromCalendarID_Dexie, getCalendarbyIDFromDexie } from "./dexie/calendars_dexie"
import { saveAPIEventReponseToDexie, saveEventToDexie } from "./dexie/events_dexie"
import { SyncManagerAddTaskInput, SyncManagerDeleteEventInput, SyncManagerSyncCalendarInput, SyncManagerSyncWebcalInput } from "./SyncManager"
import { getAuthenticationHeadersforUser } from "./user"
import { getAPIURL } from "../general"
import { changeSyncTaskStatusinDexie, deleteSyncTaskinDexie } from "./dexie/dexie_sync_manager"
import { updateEventsinWebcal_Dexie, updateWebCalLastFetched_Dexie } from "./dexie/webcal_dexie"
import { getMessageFromAPIResponse } from "./response"

    export async function syncManager_syncCalendar(id: string | number, input: SyncManagerSyncCalendarInput){
        
        const url_api=getAPIURL()+"v2/calendars/events/fetch?caldav_accounts_id="+input.caldav_accounts_id.toString()+"&&url="+input.url+"&&ctag="+input.ctag+"&&syncToken="+input.syncToken
        const authorisationData=await getAuthenticationHeadersforUser()

        const requestOptions = {
            method: 'GET',
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData}),
        }

        return new Promise( (resolve, reject) => {
        
            const response =  fetch(url_api, requestOptions as RequestInit)
            .then(response => response.json())
            .then((body) =>{
                if(body && body.success && body.data && body.data.message){
                    const events = body.data.message
                    if(events && Array.isArray(events)){
                        saveAPIEventReponseToDexie(input.calendars_id,events)
                        .then(response =>{
                            //Mark task as 'completed' in dexie.
                            // changeSyncTaskStatusinDexie(id, "done")    
                            //Delete completed task in dexie
                            deleteSyncTaskinDexie(id)
                            return resolve (true)                        
                        })
                    }else{
                        changeSyncTaskStatusinDexie(id, "error",JSON.stringify(body))
                        return resolve (false)                        

                    }  
                }else{
                    const message = (body && body.data && body.data.message) ? body.data.message: "ERROR_GENERIC"
                    changeSyncTaskStatusinDexie(id, "error", message)
                    return resolve (false)                        

                }
            }).catch(e =>{
                console.error("SyncManager.syncCalendar", e)
                changeSyncTaskStatusinDexie(id, "error",e.message)
                return resolve (false)                        
            })
        })

    }
    export async function syncManager_syncWebcal(id:string, input: SyncManagerSyncWebcalInput){
        const url_api = getAPIURL() + "webcal/sync?id=" + input.webcals_id
        const authorisationData = await getAuthenticationHeadersforUser()
        const requestOptions ={
            method: 'GET',
            mode: 'cors',
            headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        }
        const  response = await fetch(url_api, requestOptions as RequestInit)
        .then(response => response.json())
        .then(async (body) => {
            return body
        }).catch(e =>{
             console.error("SyncManager.syncWebcal, id: %s", id, e)
             changeSyncTaskStatusinDexie(id, "error",e.message)
        })
        // console.log("response", response)
        if (response && response.success == true) {
            //We also need to update the WebCal in dexie.
            if("data" in response && response.data){
                const data = response.data
                if("lastFetched" in data && "parsedCal" in data){
                    // console.log(data.parsedCal)
                    await updateWebCalLastFetched_Dexie(input.webcals_id, data.lastFetched)
                    await updateEventsinWebcal_Dexie(input.webcals_id, data.parsedCal)
                    deleteSyncTaskinDexie(id)
                    return true                        
                }else{
                    changeSyncTaskStatusinDexie(id, "error","ERROR_GENERIC")
                    return false
                }

            }
        }else{
            // const message = getMessageFromAPIResponse(response)
            changeSyncTaskStatusinDexie(id, "error",JSON.stringify(response))
            return true
        }

        
        
    }
    export async function syncManager_pushNewEventToCaldav(id: string, input: SyncManagerAddTaskInput){
        const url_api = getAPIURL() + "v2/calendars/events/add"
        
        const authorisationData = await getAuthenticationHeadersforUser()
        let updated = Math.floor(Date.now() / 1000)
        const calendarFromDexie = await getCalendarbyIDFromDexie(input.calendar_id)

        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({ "etag": input.etag, "data": input.newData, "type": input.type, "updated": updated, "calendar_id": input.calendar_id, "caldav_accounts_id":calendarFromDexie[0].caldav_accounts_id, ctag:calendarFromDexie[0].ctag, syncToken:calendarFromDexie[0].syncToken, url:calendarFromDexie[0].url, fileName: input.fileName}),
            mode: 'cors',
            headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        }
        if(!calendarFromDexie[0].caldav_accounts_id) return
        return new Promise( (resolve, reject) => {
            fetch(url_api, requestOptions as RequestInit)
            .then(response => response.json())
            .then((body) => {
                //console.log(body)
                // console.log("body", body)
                if (body){
                    if ((body.success) && body.success == true) {
                        // Save the event to Dexie Now.
                        
                        if(body.data && body.data.details){
                            const newEvent = body.data.details
                            console.log('syncManager_pushNewEventToCaldav body', body)
                            let dataToSave = newEvent["data"]?? input.newData
                            if(newEvent && newEvent.etag && newEvent.data && newEvent.url){

                                saveEventToDexie(input.calendar_id,newEvent["url"], newEvent["etag"],dataToSave,input.type).then((resultOfInsert) =>{
                                    deleteSyncTaskinDexie(id)
                                    return resolve (true)       
                                })
                            }else{
                                changeSyncTaskStatusinDexie(id, "error", "INVALID_NEW_EVENT")
                                return resolve (false) 
                            }
                        }else{
                             changeSyncTaskStatusinDexie(id, "error", JSON.stringify(body))
                             return resolve (false) 
                        }

                    } else {
                        changeSyncTaskStatusinDexie(id, "error", JSON.stringify(body))
                        return resolve (false) 

                    }
                }else{
                    changeSyncTaskStatusinDexie(id, "error","ERROR_GENERIC")
                    return resolve (false) 
                }
                
                
                
            }).catch (e =>{
                console.log("postNewEvent", e)
                changeSyncTaskStatusinDexie(id, "error","ERROR_GENERIC")
                return resolve (false) 
            }) 
        })


    }

export async function syncManager_updateEventinCaldav(id:string, input: SyncManagerAddTaskInput){
    const url_api = getAPIURL() + "v2/calendars/events/modify"
    
    const typetoSend = input.type ?? "VEVENT"
    const calendarFromDexie = await getCalendarbyIDFromDexie(input.calendar_id)


    const authorisationData = await getAuthenticationHeadersforUser()
    const updated = Math.floor(Date.now() / 1000)
    const requestOptions =
    {
        method: 'POST',
        body: JSON.stringify({ "etag": input.etag, "data": input.newData, "type": typetoSend, "updated": updated, "calendar_id": input.calendar_id, url: input.eventURL, deleted: "", caldav_accounts_id: calendarFromDexie[0].caldav_accounts_id}),
        mode: 'cors',
        headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
    }
    return new Promise( (resolve, reject) => {
            fetch(url_api, requestOptions as RequestInit)
                .then(response => response.json())
                .then((body) => {
                    if(body && body.success){
                        // console.log("update Event", body)
                        if(body.data && body.data.details){
                            const newEvent= body.data.details
                            let dataToSave = newEvent["data"]?? input
                            if(newEvent && newEvent.url){

                                saveEventToDexie(input.calendar_id, newEvent["url"], newEvent["etag"],dataToSave,typetoSend).then((resultOfInsert) =>{
                                
                                    deleteSyncTaskinDexie(id)      
                                    return resolve (true) 
                                })
                            }else{
                                changeSyncTaskStatusinDexie(id, "error",JSON.stringify(body))
                                return resolve (false) 

                            }
    
                        }else{
                            changeSyncTaskStatusinDexie(id, "error",JSON.stringify(body))
                            return resolve (false) 
                        }
                    }else{

                        changeSyncTaskStatusinDexie(id, "error",JSON.stringify(body))
                        return resolve (false) 

                    }
    
                }).catch (e =>{
                    console.error(e)
                    changeSyncTaskStatusinDexie(id, "error","ERROR_GENERIC")
                    return resolve (false) 
                })
    
    
    })
}

export async function syncManager_postNewEventIntoDexie (calendar_id: string | number,  etag:string, data:string, fileName: string) {
        
            const calendarFromDexie = await getCalendarbyIDFromDexie(calendar_id)
            if (calendarFromDexie && calendarFromDexie.length > 0) {
                let url = calendarFromDexie[0].url
                if (url) {
                    const lastChar = url.substr(-1);
                    if (lastChar != '/') {
                        url = url + '/';
                    }
                    url += fileName
                    const id = await saveEventToDexie(calendar_id, url, etag, data, "VTODO")
                    return id
                } else {
                    console.error("SyncManager.postNewEventIntoDexie: url is empty.")
                }
    
            }else {
                console.error("SyncManager.postNewEventIntoDexie: calendarFromDexie from dexie was empty.")
            }

            return 0
}

export async function syncManager_deleteEventFromCaldav(id:string | number, input: SyncManagerDeleteEventInput){
        const url_api = getAPIURL() + "v2/calendars/events/delete"
    
        const authorisationData = await getAuthenticationHeadersforUser()
        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({ "etag": input.etag, "url": input.url, "calendar_id": input.calendar_id, caldav_accounts_id: input.caldav_accounts_id}),
            mode: 'cors',
            headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        }
        return new Promise( (resolve, reject) => {
            fetch(url_api, requestOptions as RequestInit)
            .then(response => response.json())
            .then((body) => {
                if (body && body.success == true) {
                    deleteSyncTaskinDexie(id)
                } else {
                    if(body){
                        
                        changeSyncTaskStatusinDexie(id, "error",JSON.stringify(body))
                        return resolve (true) 
                    }else{
                        changeSyncTaskStatusinDexie(id, "error","ERROR_GENERIC")
                        return resolve (false) 
                    }                 
                }   
            }).catch (e =>{
                 changeSyncTaskStatusinDexie(id, "error",e.message)
                 return resolve (false) 
            }) 
    
        })
    

}