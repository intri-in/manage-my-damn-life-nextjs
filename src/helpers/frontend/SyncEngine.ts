// syncEngine.ts
import { liveQuery } from "dexie"; // note: dexie's own liveQuery, not the react hook
import { db } from "./dexie/dexieDB";
import { SyncManager } from "./SyncManager";
import { IS_SYNCING } from "./localstorage";

class SyncEngine {
  private running = false;
  private started = false;

  start() {
    if (this.started) return;
    this.started = true;

    db.sync_manager
      .where("status").equals("processing")
      .modify({ status: "pending" });

    liveQuery(() =>
      db.sync_manager.where("status").equals("pending").count()
    ).subscribe(() => this.drain());

    this.drain(); 
  }

  private async drain() {
    if (this.running) return;
    this.running = true;
    try {
      let task = await this.claimNext();
      while (task) {
        if(task.id) {
          localStorage.setItem(IS_SYNCING, "true")
          await SyncManager.executeTask(task.id?.toString());
          localStorage.setItem(IS_SYNCING, "false")
          task = await this.claimNext();
        }
      }
    } finally {
      this.running = false;
    }
  }

  private async claimNext() {
    return db.transaction("rw", db.sync_manager, async () => {
      const task = await db.sync_manager.where("status").equals("pending").first();
      if (task) await db.sync_manager.update(task.id, { status: "processing" });
      return task;
    });
  }
}

export const syncEngine = new SyncEngine();