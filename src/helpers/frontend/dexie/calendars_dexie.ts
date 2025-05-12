import { addTrailingSlashtoURL, isValidResultArray } from "@/helpers/general";
import { db } from "./dexieDB";
import { getRandomColourCode } from "../general";
import { deleteEventsFromCalendar_Dexie } from "./events_dexie";

export async function getCalendarbyIDFromDexie(calendars_id){
    try{
        const calendars_id_int = parseInt(calendars_id)
        //console.log("calendars_id", calendars_id)
        const calendars =  await db.calendars
        .where('calendars_id')
        .equals(calendars_id_int)
        .toArray();
        return calendars
    }catch(e){
        console.error("getCalendarbyIDFromDexie", e)
        return []
    }
 

}

export async function getCalendarIDFromUrl_Dexie(url){
    try{
        
        
        const calendars =  await db.calendars
        .where('url')
        .equals(url)
        .toArray();
        
        if(calendars && Array.isArray(calendars) && calendars.length>0){
            return calendars[0].calendars_id
        }
    }
    catch(e){
        console.error("getCalendarbyUrlFromDexie", e)
        return null
    }

    return null
  

}

export async function getCalendarURLByID_Dexie(calendars_id: string | number){
    const calendar = await getCalendarbyIDFromDexie(calendars_id)
    if(calendar && calendar.length>0){
        return calendar[0].url
    }
    return ""
}
export async function isValidCalendarsID(calendars_id){
    const calendars = await getCalendarbyIDFromDexie(calendars_id)
    if(isValidResultArray(calendars)){
        return true
    }
    return false
}
export async function getCalendarNameByIDFromDexie(calendar_id){
    const calendar = await getCalendarbyIDFromDexie(calendar_id)
    if(isValidResultArray(calendar))
    {
        return calendar![0].displayName
    }
}
/**
 * 
 * @param calendars_id Calendars ID from 
 */
export async function deleteAllCalendarsFromCaldavAccountID_Dexie(caldav_accounts_id){
    const allCalendars = await getAllCalendarsFromCalDavAccountIDFromDexie(caldav_accounts_id)
    if(isValidResultArray(allCalendars)){
        for (const i in allCalendars){
            //First we delete all events in this calendar.
            deleteEventsFromCalendar_Dexie(allCalendars[i]!.calendars_id!)
            db.calendars.delete(allCalendars[i]!.calendars_id!)
        }
    }
}
export async function getCalDAVAccountIDFromCalendarID_Dexie(calendars_id){
    try{
        const calendars_id_int = parseInt(calendars_id)

        const calendars =  await db.calendars
        .where('calendars_id')
        .equals(calendars_id_int)
        .toArray();
    
        if(isValidResultArray(calendars)){

            return calendars[0]["caldav_accounts_id"]
        }
    
    }catch(e){
        console.error("getCalDAVAccountIDFromCalendarID_Dexie", e)
    }
}
export async function deleteOneCalendarFromDexie(calendars_id){
    try{
        db.calendars.delete(calendars_id)
    }
    catch(e){
        console.warn("deleteOneCalendarFromDexie",e )
    }
}
export async function checkIfCalendarExistsinDexie(caldav_accounts_id, url){
    const calendars =  await db.calendars
    .where('caldav_accounts_id')
    .equals(caldav_accounts_id)
    .and( item => item.url==addTrailingSlashtoURL(url))
    .toArray();

  // Return result
  return calendars;

}
export async function getAllCalendarsFromCalDavAccountIDFromDexie(caldav_accounts_id){
    const calendars =  await db.calendars
    .where('caldav_accounts_id')
    .equals(caldav_accounts_id)
    .toArray();

    return calendars
}
export async function getCalendarColorFromDexie(calendars_id){
  
    const calendars =  await db.calendars
    .where('calendars_id')
    .equals(calendars_id)
    .toArray();

    if(isValidResultArray(calendars)){
        return calendars[0]["calendarColor"]
    }
    return "black"
}
export async function insertCalendarsIntoDexie(calendarsFromDB){
    //console.log("calendarsFromDB insertCalendarIntoDexie", calendarsFromDB)
    if(calendarsFromDB && calendarsFromDB["caldav_accounts_id"] && calendarsFromDB["calendars"] && Array.isArray(calendarsFromDB["calendars"]) && calendarsFromDB["calendars"].length>0){
        //console.log("here")
        for(const i in calendarsFromDB["calendars"]){
            const cal_fromDexie =  await checkIfCalendarExistsinDexie(calendarsFromDB["caldav_accounts_id"], calendarsFromDB["calendars"][i]["url"])
            //console.log("checkIfCalendarExistsinDexie",cal_fromDexie)
            if(!cal_fromDexie || (cal_fromDexie && Array.isArray(cal_fromDexie) && cal_fromDexie.length==0)){
                insertOneCalendarIntoDexie(calendarsFromDB["calendars"][i], calendarsFromDB["caldav_accounts_id"] )
            }
        }        
    }
}

export async function insertOneCalendarIntoDexie(calendar, caldav_accounts_id){
    try{
        // console.log("calendar" , calendar)
        const id = await db.calendars.add({
            caldav_accounts_id:  caldav_accounts_id,
            displayName: calendar["displayName"],
            url: calendar["url"],
            ctag: calendar["ctag"],
            description: calendar["description"],
            calendarColor: calendar["calendarColor"] ?  calendar["calendarColor"] : getRandomColourCode(),
            syncToken: calendar["syncToken"],
            timezone: calendar["timezone"],
            reports: calendar["reports"],
            resourcetype: calendar["resourcetype"],
            updated: calendar["updated"],
        
        })

    }catch(e){
        console.error("insertNewCaldavAccountIntoDexie", e)

    }
}
export async function updateCalendarColourbyID_Dexie(calendars_id, newColour){

    try{

        const intCalendars_id = parseInt(calendars_id)
        await db.calendars.update(intCalendars_id, {
            calendarColor: newColour
        })
    }catch(e){
        console.error("updateCalendarColourbyID_Dexie", e)
    }
}