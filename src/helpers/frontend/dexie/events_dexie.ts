import { haystackHasNeedle, isValidResultArray } from "@/helpers/general";
import { Calendar_Events, db } from "./dexieDB";
import { returnEventType, returnGetParsedVTODO } from "../calendar";
import { saveLabelToDexie } from "./dexie_labels";
import { basicTaskFilterForDexie } from "./dexie_helper";
import { majorTaskFilter } from "../events";
import { getCalendarColorFromDexie } from "./calendars_dexie";

export async function getEventColourbyID(calendar_events_id): Promise<string> {

    const getEvent = await getEventFromDexieByID(calendar_events_id)
    if ( getEvent && Array.isArray(getEvent) && getEvent.length > 0) {
        const calendar_id = getEvent[0].calendar_id
        if(calendar_id){

            const colour = await getCalendarColorFromDexie(parseInt(calendar_id))
            return colour ? colour : "black"
        }
    }
    return "black"
}
export async function getEventURLFromDexie(calendar_events_id){
    const event = await getEventFromDexieByID(calendar_events_id)
    if(event && Array.isArray(event) && event.length>0)
    {
        return event[0].url
    }
}
export async function getEventFromDexieByID(calendar_events_id: number): Promise<Calendar_Events[]> {
    try {
        const events = await db.calendar_events
            .where('calendar_events_id')
            .equals(calendar_events_id)
            .toArray();

        return events

    } catch (e) {
        console.warn("getEventFromDexieByID", e)
        return []
    }

}
export async function saveAPIEventReponseToDexie(calendars_id, eventArray) {
    if (isValidResultArray(eventArray)) {

        for (const i in eventArray) {
            const labelArray = returnGetParsedVTODO(eventArray[i]["data"])!.category
            const parsed = returnGetParsedVTODO(eventArray[i]["data"])

            // console.log("parsed",parsed.summary, parsed, calendars_id)
            const type = returnEventType(eventArray[i]["data"])
            if (type == "VTODO" && basicTaskFilterForDexie(parsed)) {

                await saveLabelToDexie(labelArray)
            }
            await saveEventToDexie(calendars_id, eventArray[i]["url"], eventArray[i]["etag"], eventArray[i]["data"], eventArray[i]["type"])
            await deleteExtraEventsFromDexie(calendars_id, eventArray)
        }
    }

    //Delete extra events not located on CalDAV server.


}
export async function getEtagFromEventID_Dexie(calendar_events_id: number | string){
    let id_toSearch = calendar_events_id
    if(typeof(calendar_events_id)!=="number")
    {
        id_toSearch=parseInt(calendar_events_id)
    }
    try {
        const events = await db.calendar_events
            .where('calendar_events_id')
            .equals(id_toSearch)
            .toArray();

        if (isValidResultArray(events)) {
            return events[0]["etag"]
        } else {
            return null
        }

    } catch (e) {
        console.warn("getEtagFromEventID_Dexie", e)
        return null
    }
}
export async function getEtagFromURL_Dexie(url) {
    try {
        const events = await db.calendar_events
            .where('url')
            .equals(url)
            .toArray();

        if (isValidResultArray(events)) {
            return events[0]["etag"]
        } else {
            return null
        }

    } catch (e) {
        console.warn("getEtagFromURL_Dexie", e)
        return null
    }

}

export async function saveEventToDexie(calendars_id, url, etag, data, type) {
    //Check if event exists in Dexie already, if so, we update it.
    const eventID = await getEventbyURLFromDexie(url)
    const parsedType = returnEventType(data)
    let typeToInsert = type
    if (parsedType) {
        typeToInsert = parsedType
    }

    if (eventID) {
        // Update if new etag is different.
        //console.log("events etag",eventID["etag"], etag,  eventID["etag"]==etag )
        // console.log("typeToInsert", typeToInsert, type, parsedType)

        const updated = await db.calendar_events.update(eventID, { etag: etag, data: data, type: typeToInsert })
        // console.log("updated", updated)
    } else {


        // console.log("typeToInsert", typeToInsert, type, parsedType)
        const id = await db.calendar_events.add({
            url: url,
            etag: etag,
            data: data,
            calendar_id: calendars_id.toString(),
            type: typeToInsert,
            updated: Date.now().toString()
        }).catch(e => {
            console.log(e)
        })
        // console.log("id", id)

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

        if (isValidResultArray(events)) {
            return events[0]
        } else {
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
                .equalsIgnoreCase(type)
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
        let events: Calendar_Events[] | null = null
        if (type) {
            events = await db.calendar_events
                .where('calendar_id')
                .equals(calendars_id.toString())
                .and(item => item.type == type)
                .toArray();

        } else {
            events = await db.calendar_events
                .where('calendar_id')
                .equals(calendars_id.toString())
                .toArray();
        }

        return events

    } catch (e) {
        console.warn("fetchEventsForCalendarsFromDexie", e)
        return null
    }
}


export async function deleteExtraEventsFromDexie(calendars_id, eventArray) {

    //First get all events From Dexie for the calendar.
    const allEventsFromDexie = await fetchEventsForCalendarsFromDexie(calendars_id)
    for (const i in allEventsFromDexie) {
        var found = false;

        for (const j in eventArray) {
            if (eventArray[j]["url"] == allEventsFromDexie[i]["url"]) {
                //Event found.
                found = true
            }
        }
        if (!found) {
            //Event not found on server. Delete from Dexie.
            deleteEventFromDexie(allEventsFromDexie[i]["calendar_events_id"])
        }

    }
}

export async function deleteEventFromDexie(calendar_events_id) {
    if (!calendar_events_id) return

    try {
        const eventKey = parseInt(calendar_events_id)
        db.calendar_events.delete(eventKey)

    } catch (e) {
        console.error("deleteEventFromDexie", e)
    }
}

export async function deleteEventByURLFromDexie(url) {
    const event = await getEventbyURLFromDexie(url)
    if (event && event["calendar_events_id"]) {
        await deleteEventFromDexie(event["calendar_events_id"])
    }
}

export async function searchEventInDexie(calendars_id, type, searchTerm) {
    const allEvents = await fetchEventsForCalendarsFromDexie(calendars_id, type)
    const result: any = []
    for (const i in allEvents) {
        var parsedTodo = returnGetParsedVTODO(allEvents[i].data)
        if (majorTaskFilter(parsedTodo) == true && parsedTodo!.summary != null && parsedTodo!.summary != undefined && (haystackHasNeedle(searchTerm.trim(), parsedTodo!.summary) || haystackHasNeedle(searchTerm.trim(), parsedTodo!.description))) {
            result.push(allEvents[i])
        }
    }

    return result
}

export async function deleteAllEventsFromDexie() {

    try {

        db.calendar_events.clear()
        return true
    } catch (e) {
        console.warn("deleteAllEventsFromDexie", e)
        return false
    }
}

export async function restoreEventtoDexie(oldEvent: Calendar_Events) {
    await saveEventToDexie(oldEvent["calendar_id"], oldEvent["url"], oldEvent["etag"], oldEvent["data"], oldEvent["type"])
} 


/**
 * Gets the summary of a task by UID and the id of calendar it is in.
 * @param uid UID of task.
 * @param calendars_id Calendar ID for the task.
 * @returns String containing summary of parent. If task has no parent, empty string is returned
 */
export async function getSummaryforEventUID_fromDexie(uid, calendars_id?) {

    let eventsFromCalendar: Calendar_Events[] | [] | null = []
    if (calendars_id) {

        eventsFromCalendar = await fetchEventsForCalendarsFromDexie(calendars_id)
    } else {
        eventsFromCalendar = await fetchAllEventsFromDexie()
    }
    if (eventsFromCalendar && isValidResultArray(eventsFromCalendar)) {

        for (const i in eventsFromCalendar) {

            const parsed = returnGetParsedVTODO(eventsFromCalendar[i].data)
            if (parsed && ("uid" in parsed) && ("summary" in parsed) && (parsed.uid == uid)) {
                return parsed.summary

            }
        }

    }

    return ""
}