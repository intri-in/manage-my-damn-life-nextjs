import { isValidResultArray } from "@/helpers/general";
import { db } from "./dexieDB";
import { returnGetParsedVTODO } from "../calendar";
import { saveLabelToDexie } from "./dexie_labels";

export async function saveAPIEventReponseToDexie(calendars_id, eventArray) {
    if (isValidResultArray(eventArray)) {
        for (const i in eventArray) {
            const labelArray = returnGetParsedVTODO(eventArray[i]["data"]).category
            saveLabelToDexie(labelArray)
            saveEventToDexie(calendars_id, eventArray[i]["url"], eventArray[i]["etag"], eventArray[i]["data"], eventArray[i]["type"])
            deleteExtraEventsFromDexie(calendars_id, eventArray)
        }
    }

    //Delete extra events not located on CalDAV server.


}

export async function saveEventToDexie(calendars_id, url, etag, data, type) {
    //Check if event exists in Dexie already, if so, we update it.
    const eventID = await getEventbyURLFromDexie(url)

    if (eventID) {
        // Update if new etag is different.
        //console.log("events etag",eventID["etag"], etag,  eventID["etag"]==etag )
        if(eventID["etag"]!=etag){
            const updated = await db.calendar_events.update(eventID, {etag,data, type})
        }
        
    } else {

        const id = await db.calendar_events.add({
            url: url,
            etag: etag,
            data: data,
            calendar_id: calendars_id,
            type: type,
            updated: Date.now().toString()
        })
    }
}

/**
 * Checks if the target event already exists in dexie. Return the event, null otherwise.
 * @param calendars_id 
 * @param url 
 * @param etag 
 * @param data 
 * @param type 
 * @returns Returns matching event if it already exists in Dexie. Null otherwise.
 */
export async function getEventbyURLFromDexie(url) {
    try {
        const events = await db.calendar_events
            .where('url')
            .equals(url)
            .toArray();

        if(isValidResultArray(events)){
            return events[0]
        }else{
            return null
        }

    } catch (e) {
        console.warn("fetchEventsForCalendarsFromDexie", e)
        return null
    }

}

export async function fetchAllEventsFromDexie(type?) {
    try {

        if (type) {
            const events = await db.calendar_events
                .where('type')
                .equals(type)
                .toArray();

            return events
        } else {
            const events = await db.calendar_events
                .toArray();

            return events

        }

    } catch (e) {
        console.warn("fetchEventsForCalendarsFromDexie", e)
        return null
    }

}
export async function fetchEventsForCalendarsFromDexie(calendars_id, type?) {

    try {
        const events = await db.calendar_events
            .where('calendar_id')
            .equals(calendars_id)
            .toArray();

        return events

    } catch (e) {
        console.warn("fetchEventsForCalendarsFromDexie", e)
        return null
    }
}


export async function deleteExtraEventsFromDexie(calendars_id, eventArray){

    //First get all events From Dexie for the calendar.
    const allEventsFromDexie = await fetchEventsForCalendarsFromDexie(calendars_id)
    for (const i in allEventsFromDexie){
        var found=false;

        for(const j in eventArray){
            if(eventArray[j]["url"]==allEventsFromDexie[i]["url"]){
                //Event found.
                found=true
            }
        }
        if(!found){
            //Event not found on server. Delete from Dexie.
            deleteEventFromDexie(allEventsFromDexie[i]["calendar_events_id"])
        }

    }
}

export async function deleteEventFromDexie(calendar_events_id){
    if(!calendar_events_id) return
    
    try{
        const eventKey= parseInt(calendar_events_id)
        db.calendar_events.delete(eventKey)
        
    }catch(e){
        console.error("deleteEventFromDexie", e)
    }
}