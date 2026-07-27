import { getSyncTaskByIdFromDexie, insertEventTaskIntoSyncManagerDexie, insertNewSyncTaskCalendarIntoSyncManagerDexie, insertNewSyncTaskWebcalIntoSyncManagerDexie, insertTaskDeleteIntoSyncManagerDexie } from "./dexie/dexie_sync_manager"
import { Calendar_Events } from "./dexie/dexieDB"
import { deleteEventByURLFromDexie, saveEventToDexie } from "./dexie/events_dexie"
import { syncManager_deleteEventFromCaldav, syncManager_postNewEventIntoDexie, syncManager_pushNewEventToCaldav, syncManager_syncCalendar, syncManager_syncWebcal, syncManager_updateEventinCaldav } from "./syncManagerHelpers"

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
export type SyncManagerAddTaskInput = {
    calendar_id: string | number,
    oldData?: string,
    newData:string,
    etag:string,
    fileName?:string,
    type:string,
    eventURL?:string
}
export type SyncManagerDeleteEventInput ={
    calendar_id: string | number,
    caldav_accounts_id: string | number,
    url:string
    etag: string
    data: Calendar_Events
}
export type SyncManagerStatus = "pending" | "done" | "error" | "processing"
export type SyncManagerType_Type = typeof SyncManager.SYNC_CALENDER | typeof SyncManager.SYNC_WEBCAL | typeof SyncManager.SYNC_ADD_TASK | typeof SyncManager.SYNC_EDIT_TASK | typeof SyncManager.SYNC_DELETE_TASK
export class SyncManager{

    static SYNC_CALENDER = "SYNCMANAGER_SYNC_CALENDER" as const
    static SYNC_WEBCAL = "SYNCMANAGER_SYNC_WEBCAL" as const
    static SYNC_ADD_TASK = "SYNCMANAGER_SYNC_ADD_TASK" as const
    static SYNC_EDIT_TASK = "SYNCMANAGER_SYNC_EDIT_TASK" as const
    static SYNC_DELETE_TASK = "SYNCMANAGER_SYNC_DELETE_TASK" as const
    static async addTask(type:SyncManagerType_Type, summary, input: SyncManagerSyncCalendarInput | SyncManagerSyncWebcalInput | SyncManagerAddTaskInput | SyncManagerDeleteEventInput){

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
            case SyncManager.SYNC_ADD_TASK:
                if("calendar_id" in input && input.etag && ("newData" in input && input.newData) && input.fileName){
                    //First we faux add the event in dexie
                    const id = await syncManager_postNewEventIntoDexie(input.calendar_id, input.etag, input.newData, input.fileName) 
                    if(id && id!=0){
                        // we now have the id of the newly created event.
                        //We add the task to the Sync Manager
                        await insertEventTaskIntoSyncManagerDexie(SyncManager.SYNC_ADD_TASK, summary, input, id.toString())
                        return true
                    }
                }
                break;
            case SyncManager.SYNC_EDIT_TASK:
                if("calendar_id" in input && ("eventURL" in input && input.eventURL)  && ("newData" in input && input.newData) && input.oldData){
                    //First we faux add the event in dexie
                    const id = await saveEventToDexie(input.calendar_id, input.eventURL, input.etag, input.newData, "VTODO")
                    if(id && id!=0){
                        // we now have the id of the newly created event.
                        //We add the task to the Sync Manager
                        await insertEventTaskIntoSyncManagerDexie(SyncManager.SYNC_EDIT_TASK, summary, input, id.toString())
                        return true
                    }
                }
                break;
            case SyncManager.SYNC_DELETE_TASK:
                // First we preemptively delete the event.
                if(("url" in input) && ("etag" in input)){

                    await deleteEventByURLFromDexie(input.url)
                    await insertTaskDeleteIntoSyncManagerDexie(summary, input)
                    return true
                }
                break;
            default:
                return false

        }


    }

    static async executeTask(id:number | string){
        const id_toSearch =  Number(id)
        if(isNaN(id_toSearch)) return
        const task =  await getSyncTaskByIdFromDexie(id_toSearch)
        // console.log("task", task)
        if(task && Array.isArray(task) && task.length>0){
            const currentTask = task[0]
            switch(currentTask.type){
                case SyncManager.SYNC_CALENDER:
                    console.log(`Executing task: ${currentTask.summary}`)
                    if(("calendars_id" in currentTask.input) && ("url" in currentTask.input)) {
                        syncManager_syncCalendar(id, currentTask.input)
                    }
                    break;
                case SyncManager.SYNC_WEBCAL:
                    console.log(`Executing task: ${currentTask.summary}`)
                    if("webcals_id" in currentTask.input && currentTask.id){
                        syncManager_syncWebcal(id.toString(), currentTask.input)
                    }
                    break;
                case SyncManager.SYNC_ADD_TASK:
                    console.log(`Executing task: ${currentTask.summary}`)
                    if("calendar_id" in currentTask.input && ("newData" in currentTask.input)){
                        syncManager_pushNewEventToCaldav(id.toString(), currentTask.input)
                    }
                    break;
                case SyncManager.SYNC_EDIT_TASK:
                    console.log(`Executing task: ${currentTask.summary}`)
                    if("calendar_id" in currentTask.input && ("newData" in currentTask.input)){
                        syncManager_updateEventinCaldav(id.toString(), currentTask.input)
                    }
                    break;

                case SyncManager.SYNC_DELETE_TASK:
                    console.log(`Executing task: ${currentTask.summary}`)
                    if("calendar_id" in currentTask.input && ("caldav_accounts_id" in currentTask.input)){
                        syncManager_deleteEventFromCaldav(id.toString(), currentTask.input)
                    }
                    break;
                default:
                    break;
            }
        }
        
    }
} 