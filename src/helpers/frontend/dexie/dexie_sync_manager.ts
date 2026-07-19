import { SyncManager, SyncManagerStatus, SyncManagerSyncCalendarInput, SyncManagerSyncWebcalInput } from "@/helpers/frontend/SyncManager";
import { SyncManagerDexie, db } from "./dexieDB";
import { getUserIDForCurrentUser_Dexie } from "./users_dexie";

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
export async function changeSyncTaskStatusinDexie(id: string | number, status: SyncManagerStatus, message?: string, retryAfter?:string){
    if(!id) return
    if(isNaN(Number(id))) return
    await db.sync_manager.update(Number(id), {
        status: status, 
        message: message, 
        updated: Date.now().toString(), 
        retryAfter: retryAfter
    });


}