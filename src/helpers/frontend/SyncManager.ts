import { getErrorResponse } from "../errros"
import { changeSyncTaskStatusinDexie, deleteSyncTaskinDexie, getSyncTaskByIdFromDexie, insertNewSyncTaskCalendarIntoSyncManagerDexie, insertNewSyncTaskWebcalIntoSyncManagerDexie } from "./dexie/dexie_sync_manager"
import { saveAPIEventReponseToDexie } from "./dexie/events_dexie"
import { getAuthenticationHeadersforUser } from "./user"
import { getAPIURL } from "../general"
import { IS_SYNCING } from "./localstorage"
import { updateEventsinWebcal_Dexie, updateWebCalLastFetched_Dexie } from "./dexie/webcal_dexie"
import { getMessageFromAPIResponse } from "./response"

export type SyncManagerSyncCalendarInput = {
caldav_accounts_id: string | number, 
url: string,
ctag: string,
syncToken: string,
calendars_id: string | number
}

export type SyncManagerSyncWebcalInput = {
    webcals_id: string | number
}

export type SyncManagerStatus = "pending" | "done" | "error" | "processing"
export type SyncManagerType_Type = typeof SyncManager.SYNC_CALENDER | typeof SyncManager.SYNC_WEBCAL
export class SyncManager{

    static SYNC_CALENDER = "SYNCMANAGER_SYNC_CALENDER" as const
    static SYNC_WEBCAL = "SYNCMANAGER_SYNC_WEBCAL" as const
    static async syncCalendar(id: string | number, input: SyncManagerSyncCalendarInput){
        
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
                        })
                    }else{
                        changeSyncTaskStatusinDexie(id, "error","ERROR_GENERIC")
                    }  
                }else{
                    const message = (body && body.data && body.data.message) ? body.data.message: "ERROR_GENERIC"
                    changeSyncTaskStatusinDexie(id, "error", message)

                }
            }).catch(e =>{
                console.error("SyncManager.syncCalendar", e)
                changeSyncTaskStatusinDexie(id, "error",e.message)

            })
        })

    }
    static async syncWebcal(id:string, input: SyncManagerSyncWebcalInput){
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
            console.error(`SyncManager.syncWebcal, ${id}`, e)
            changeSyncTaskStatusinDexie(id, "error",e.message)
        })
        // console.log("response", response)
        if (response && response.success == true) {
            //We also need to update the WebCal in dexie.
            if("data" in response && response.data){
                const data = response.data
                if("lastFetched" in data && "parsedCal" in data){
                    console.log(data.parsedCal)
                    await updateWebCalLastFetched_Dexie(input.webcals_id, data.lastFetched)
                    await updateEventsinWebcal_Dexie(input.webcals_id, data.parsedCal)
                    deleteSyncTaskinDexie(id)                        
                }else{
                    changeSyncTaskStatusinDexie(id, "error","ERROR_GENERIC")
                }

            }
        }else{
            const message = getMessageFromAPIResponse(response)
            changeSyncTaskStatusinDexie(id, "error",message ??"ERROR_GENERIC")
        }

        
        
    }
    static async addTask(type:SyncManagerType_Type, summary, input: SyncManagerSyncCalendarInput | SyncManagerSyncWebcalInput){

        // console.log("type",type, type==SyncManager.SYNC_CALENDER.toString())
        switch(type){
            case SyncManager.SYNC_CALENDER:
                if(("calendars_id" in input) && ("url" in input)){
                    await insertNewSyncTaskCalendarIntoSyncManagerDexie(summary, {calendars_id: input.calendars_id,caldav_accounts_id:input.caldav_accounts_id, ctag: input.ctag,syncToken:input.syncToken,url:input.url})
                }
                break;
            case SyncManager.SYNC_WEBCAL:
                if("webcals_id" in input) {
                    await insertNewSyncTaskWebcalIntoSyncManagerDexie(summary, {webcals_id: input.webcals_id})
                }
                break;

        }


    }

    static async executeTask(id:number | string){
        const task =  await getSyncTaskByIdFromDexie(id)
        // console.log("task", task)
        if(task && Array.isArray(task) && task.length>0){
            const currentTask = task[0]
            switch(currentTask.type){
                case SyncManager.SYNC_CALENDER:
                    console.log(`Executing task: ${currentTask.summary}`)
                    if(("calendars_id" in currentTask.input) && ("url" in currentTask.input)) {
                        this.syncCalendar(id, currentTask.input)
                    }
                    break;
                case SyncManager.SYNC_WEBCAL:
                    console.log(`Executing task: ${currentTask.summary}`)
                    if("webcals_id" in currentTask.input && currentTask.id){
                        this.syncWebcal(id.toString(), currentTask.input)
                    }
                    break;
                default:
                    break;
            }
        }
        
    }
} 