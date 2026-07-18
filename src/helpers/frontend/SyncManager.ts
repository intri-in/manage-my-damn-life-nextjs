import { getErrorResponse } from "../errros"
import { changeSyncTaskStatusinDexie, deleteSyncTaskinDexie, getSyncTaskByIdFromDexie, insertNewSyncTaskCalendarIntoSyncManagerDexie } from "./dexie/dexie_sync_manager"
import { saveAPIEventReponseToDexie } from "./dexie/events_dexie"
import { getAuthenticationHeadersforUser } from "./user"
import { getAPIURL } from "../general"
import { IS_SYNCING } from "./localstorage"

export type SyncManagerSyncCalendarInput = {
caldav_accounts_id: string | number, 
url: string,
ctag: string,
syncToken: string,
calendars_id: string | number
}

export type SyncManagerStatus = "pending" | "done" | "error" | "processing"
export type SyncManagerType = typeof SyncManager.SYNC_CALENDER
export class SyncManager{

    static SYNC_CALENDER = "SYNCMANAGER_SYNC_CALENDER" as const
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

    static async addTask(type:SyncManagerType, summary, input: SyncManagerSyncCalendarInput){

        console.log("type",type, type==SyncManager.SYNC_CALENDER.toString())
        switch(type){
            case SyncManager.SYNC_CALENDER:
                await insertNewSyncTaskCalendarIntoSyncManagerDexie(type, summary, {calendars_id: input.calendars_id,caldav_accounts_id:input.caldav_accounts_id, ctag: input.ctag,syncToken:input.syncToken,url:input.url})
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
                    this.syncCalendar(id, currentTask.input)
                    break;
                default:
                    break;
            }
        }
        
    }
} 