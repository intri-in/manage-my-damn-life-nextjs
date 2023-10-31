import { isValidResultArray } from "@/helpers/general";
import { db } from "./dexieDB";
import { returnGetParsedVTODO } from "../calendar";
import { saveLabelToDexie } from "./dexie_labels";

export async function saveAPIEventReponseToDexie(calendars_id, eventArray){
    if(isValidResultArray(eventArray)){
        for(const i in eventArray){
            const labelArray = returnGetParsedVTODO(eventArray[i]["data"]).category
            saveLabelToDexie(labelArray)
            saveEventToDexie(calendars_id, eventArray[i]["url"], eventArray[i]["etag"], eventArray[i]["data"], eventArray[i]["type"])
        }
    }

}

export async function saveEventToDexie(calendars_id, url, etag, data, type){
    const id = await db.calendar_events.add({
        url:url,
        etag:etag,
        data:data,
        calendar_id:calendars_id,
        type: type,
        updated: Date.now().toString()
    })
}


export async function fetchAllEventsFromDexie(type?){
    try{
        
        if(type){
            const events =  await db.calendar_events
            .where('type')
            .equals(type)
            .toArray();   
            
            return events
        }else{
            const events =  await db.calendar_events
            .toArray();   

            return events

        }
      
    }catch(e){
        console.warn("fetchEventsForCalendarsFromDexie",e)
        return null
    }

}
export async function fetchEventsForCalendarsFromDexie(calendars_id,type?){

    try{
        const events =  await db.calendar_events
        .where('calendar_id')
        .equals(calendars_id)
        .toArray();   
        
        return events
      
    }catch(e){
        console.warn("fetchEventsForCalendarsFromDexie",e)
        return null
    }
}


