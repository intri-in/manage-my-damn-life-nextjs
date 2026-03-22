import { getParsedTaskParent } from "../TaskUI/taskUIHelpers"
import { getIdFromEvent_ParentsDexie } from "./events_dexie"
import { db } from "./dexieDB";

/**
 * Saves parent of a task in dexie database.
 * @param parsed parsed Event or Task
 */
export async function saveEventParenttoDexie(parsed){
    const parent = getParsedTaskParent(parsed)
    if(parent){
        const id_ofChild = await getIdFromEvent_ParentsDexie(parsed["uid"])
        if(id_ofChild){
            // Data already exists. Update
            const updated = await db.event_parents.update(id_ofChild, {parent_id:parent}).catch( e=>{
                console.error("saveEventParenttoDexie", e)
            })
        
        }else{
            // New entry. Create.
            const id = await db.event_parents.add({
                uid:parsed["uid"],
                parent_id:parent

            }).catch(e => {
                console.log(e)
            })
    
        }

    }
    

}

export async function deleteParentEntryinDexieById(id_ofChild){
        if(id_ofChild){
            const deleted = await db.event_parents.delete(id_ofChild)
        }

}