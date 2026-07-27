import { SyncManager, SyncManagerAddTaskInput, SyncManagerStatus, SyncManagerSyncCalendarInput, SyncManagerSyncWebcalInput } from "@/helpers/frontend/SyncManager";
import { SyncManagerDexie, db } from "./dexieDB";
import { getUserIDForCurrentUser_Dexie } from "./users_dexie";
interface RetryInput{
    retryAfter?:string,
    retryNumber?:string
}
export async function insertNewSyncTaskCalendarIntoSyncManagerDexie(summary: string, input: SyncManagerSyncCalendarInput){
    
    const userid = await getUserIDForCurrentUser_Dexie()    
    if(!userid) return
    //First we need to check if the exact same task is already pending in the SyncManager.
    const isAlreadyPresent = await checkifSyncTasksCalendarPresentInDexie(userid.toString(),  input )
    if(isAlreadyPresent) return
    const id = await db.sync_manager.add({
        created: Date.now().toString(),
        updated: Date.now().toString(),
        type: SyncManager.SYNC_CALENDER,
        summary:summary,
        input: input,
        status: "pending",
        userid: userid?.toString(),
        message:""
    }).catch(e =>{
      console.error("insertNewSyncTaskCalendarIntoSyncManagerDexie", e)
    })



  }

  export async function insertNewSyncTaskWebcalIntoSyncManagerDexie(summary: string, input: SyncManagerSyncWebcalInput){
    
    const userid = await getUserIDForCurrentUser_Dexie()    
    if(!userid) return
    //First we need to check if the exact same task is already pending in the SyncManager.
    const isAlreadyPresent = await checkifSyncTasksWebcalPresentInDexie(userid.toString(), input )
    if(isAlreadyPresent) return
    const id = await db.sync_manager.add({
        created: Date.now().toString(),
        updated: Date.now().toString(),
        type: SyncManager.SYNC_WEBCAL,
        summary:summary,
        input: input,
        status: "pending",
        userid: userid?.toString(),
        message:""
    }).catch(e =>{
      console.error("insertNewSyncTaskCalendarIntoSyncManagerDexie", e)
    })



  }



export async function insertEventTaskIntoSyncManagerDexie(type: typeof SyncManager.SYNC_ADD_TASK | typeof SyncManager.SYNC_EDIT_TASK, summary: string, input: SyncManagerAddTaskInput, eventIdInDexie: string){
    const userid = await getUserIDForCurrentUser_Dexie()    
    if(!userid) return
    const isAlreadyPresent = await checkifAddEventTaskPresentInDexie(userid.toString(), input )
    if(isAlreadyPresent) return
    await db.sync_manager.add({
            created: Date.now().toString(),
            updated: Date.now().toString(),
            type: type,
            summary:summary,
            input: input,
            status: "pending",
            userid: userid?.toString(),
            eventIdInDexie: eventIdInDexie,
            retryAfter: "60000",
            retryNumber: "0",
            message:""
        }).catch(e =>{
        console.error("insertNewEventTaskIntoSyncManagerDexie", e)
        })

}
async function checkifSyncTasksCalendarPresentInDexie(userid:string, input: SyncManagerSyncCalendarInput){
    const task = await db.sync_manager
    .where("userid")
    .equals(userid)
    .and(task => task.type?.toLowerCase() == SyncManager.SYNC_CALENDER.toLowerCase())
    .and(task => task.status.toString() == "pending")
    .and(task => "caldav_accounts_id" in task.input && (task.input.caldav_accounts_id.toString() == input.caldav_accounts_id.toString()))
    .and(task => "url" in task.input && (task.input.url.toString() == input.url.toString()))
    .toArray()
    .catch(e=>{
        console.error("checkifSyncTasksCalendarPresentInDexie", e)
    })
    if(task && Array.isArray(task) && task.length>0){
        return true
    }
    return false
}
async function checkifSyncTasksWebcalPresentInDexie(userid:string,  input: SyncManagerSyncWebcalInput){
    const task = await db.sync_manager
    .where("userid")
    .equals(userid)
    .and(task => task.type?.toLowerCase() == SyncManager.SYNC_WEBCAL.toLowerCase())
    .and(task => task.status.toString() == "pending")
    .and(task => "webcals_id" in task.input && (task.input.webcals_id.toString() == input.webcals_id.toString()))
    .toArray()
    .catch(e=>{
        console.error("checkifSyncTasksCalendarPresentInDexie", e)
    })
    if(task && Array.isArray(task) && task.length>0){
        return true
    }
    return false
}
async function checkifAddEventTaskPresentInDexie(userid:string,  input: SyncManagerAddTaskInput){
    const task = await db.sync_manager
    .where("userid")
    .equals(userid)
    .and(task => task.type?.toLowerCase() == SyncManager.SYNC_ADD_TASK.toLowerCase())
    .and(task => task.status.toString() == "pending")
    .and(task => "calendar_id" in task.input && (task.input.calendar_id.toString() == input.calendar_id.toString()))
    .toArray()
    .catch(e=>{
        console.error("checkifAddEventTaskPresentInDexie", e)
    })
    if(task && Array.isArray(task) && task.length>0){
        return true
    }
    return false
}

export async function getSyncTaskByIdFromDexie(id: number | string): Promise<SyncManagerDexie[] | null | void>{
    const userid = await getUserIDForCurrentUser_Dexie()    
    if(!userid) return []
    const task = await db.sync_manager
    .where("userid")
    .equals(userid.toString())
    .and(task => task.id == Number(id))
    .toArray()
    .catch(e=>{
        console.error("getSyncTaskByIdFromDexie", e)
    })
    return task


}
export async function deleteSyncTaskinDexie(id: string | number){
    if(!id) return
    if(isNaN(Number(id))) return
    await db.sync_manager.delete(Number(id))
    
}
export async function changeSyncTaskStatusinDexie(id: string | number, status: SyncManagerStatus, message?: string, retryOptions?:RetryInput){
    if(!id) return
    if(isNaN(Number(id))) return
    const updatePayload: any = { status, message, updated: Date.now().toString() };
    if (retryOptions?.retryAfter !== undefined) updatePayload.retryAfter = retryOptions.retryAfter;
    if (retryOptions?.retryNumber !== undefined) updatePayload.retryNumber = retryOptions.retryNumber;
    return await db.sync_manager.update(Number(id), updatePayload);
    
}

