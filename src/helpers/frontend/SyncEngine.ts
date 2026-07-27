// syncEngine.ts
import { liveQuery } from "dexie"; // note: dexie's own liveQuery, not the react hook
import { db, SyncManagerDexie } from "./dexie/dexieDB";
import { SyncManager } from "./SyncManager";
import { IS_SYNCING } from "./localstorage";
import { SYNCMANAGER_DEFAULT_MAX_RETRIES, SYNCMANAGER_DEFAULT_RETRY_TIMER_SECONDS } from "@/config/constants";
import * as constants from "@/config/constants";
import { changeSyncTaskStatusinDexie } from "./dexie/dexie_sync_manager";
import { useSetAtom } from "jotai";
class SyncEngine {
  private running = false;
  private started = false;
  private postRunFunction = () =>{}
  
  start(postRunFunction) {
    if (this.started) return;
    this.started = true;
    this.postRunFunction = postRunFunction
    db.sync_manager
      .where("status").equals("processing")
      .modify({ status: "pending" });

    liveQuery(() =>
      db.sync_manager.where("status").anyOf(["pending", "error"]).count()
    ).subscribe(() => this.drain());
    setInterval(() => this.drain(), 10*1000); // backstop for time-based retry eligibility
    this.drain(); 
  }
  private isEligibleForRetry(task: SyncManagerDexie): boolean {
    // You define this — e.g.:
    if(task.type==SyncManager.SYNC_ADD_TASK || task.type==SyncManager.SYNC_EDIT_TASK ){
      const updated =  Number(task.updated)
      const retryNumber = !isNaN(Number(task.retryNumber)) ? Number(task.retryNumber) : 0
      if(retryNumber <= SYNCMANAGER_DEFAULT_MAX_RETRIES){      
        if (((Date.now()-updated)/1000)>SYNCMANAGER_DEFAULT_RETRY_TIMER_SECONDS) return true;
      }
    }
    return false
  }
  private async drain() {
    if (this.running) return;
    this.running = true;
    try {
      let task = await this.claimNext();
      while (task) {
        if(task.id) {
          localStorage.setItem(IS_SYNCING, "true")
          await SyncManager.executeTask(task.id?.toString()).catch(e=>{
            console.error("SyncEngine.drain",e, task?.summary)
          });
          this.postRunFunction()
          localStorage.setItem(IS_SYNCING, "false")
          task = await this.claimNext();
        }
      }
    } finally {
      this.running = false;
    }
  }

  private async claimNext() {
    // return db.transaction("rw", db.sync_manager, async () => {
    //   const task = await db.sync_manager.where("status").equals("pending").first();
    //   if (task) await db.sync_manager.update(task.id, { status: "processing" });
    //   return task;
    // });

    return db.transaction("rw", db.sync_manager, async () => {
    let isErrorTask =  false
    let task = await db.sync_manager.where("status").equals("pending").first();
    console.log("task", task)
    if (!task) {
      const errorTasks = await db.sync_manager.where("status").equals("error").toArray();
      task = errorTasks.find(this.isEligibleForRetry);
      if(task) isErrorTask = true
    }


    if (task && task.id) {
      const newRetryNumber = (task.retryNumber && !isNaN(Number(task.retryNumber))) ? (Number(task.retryNumber)+1).toString(): "1"
      // await db.sync_manager.update(task.id, { status: "processing", retryNumber: newRetryNumber });
      const result = await changeSyncTaskStatusinDexie(task.id, "processing", "",{retryNumber: newRetryNumber})
    }
    return task;
  });
  }
}

export const syncEngine = new SyncEngine();