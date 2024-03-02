import { isValidResultArray } from "@/helpers/general"
import { getCalDAVSummaryFromDexie } from "./caldav_dexie"
import { fetchEventsForCalendarsFromDexie } from "./events_dexie"
import { db } from "./dexieDB";

export async function clearDexieDB(){

    await db.caldav_accounts.clear()
    await db.calendars.clear()
    await db.calendar_events.clear()
    await db.labels.clear()
    return true
    
}

export function compareCalDAVSummary_andGetIndex(rowToCompare, summaryToCompareWith){

    let toReturn = -1
    for(const j in summaryToCompareWith ){
        if(summaryToCompareWith[j]["caldav_accounts_id"]==rowToCompare["caldav_accounts_id"]){
            // console.log(summaryToCompareWith[j]["caldav_accounts_id"],rowToCompare["caldav_accounts_id"])
            // console.log(summaryToCompareWith[j]["url"],rowToCompare["url"])
            //Found. Now we check if the values match.
            if(summaryToCompareWith[j]["url"]==rowToCompare["url"] && summaryToCompareWith[j]["username"]==rowToCompare["username"]){
                return j

            }
        }
    }
    

    return toReturn

}

export async function getEventsFromDexie_LikeAPI(){
    var toReturn: any =[]
    const allSummary = await getCalDAVSummaryFromDexie()
    if (isValidResultArray(allSummary)) {
        for (const i in allSummary) {
            if (isValidResultArray(allSummary[i]["calendars"])) {
                for (const j in allSummary[i]["calendars"]) {
                    let cal = allSummary[i]["calendars"][j]
                    let info = {
                        caldav_account: allSummary[i]["name"],
                        caldav_accounts_id: allSummary[i]["caldav_accounts_id"],
                        calendar: cal["displayName"],
                        color: cal["calendarColor"]
                    }
                    // console.log("cal", cal)
                    const events = await fetchEventsForCalendarsFromDexie(cal["calendars_id"])
                    // console.log("events", cal["calendars_id"], events )
                    let toAddToResult = {
                        info: info,
                        events: events
                    }
                    toReturn.push(toAddToResult)
                }


            }
        }

    }


    return toReturn
}

export async function getCaldavIDFromCalendarID_FromDexieSummary(calendars_id){
    const calDAVSummary = await getCalDAVSummaryFromDexie()
    if(isValidResultArray(calDAVSummary)){
        for (let i = 0; i < calDAVSummary.length; i++) {
            if(isValidResultArray(calDAVSummary[i]["calendars"])){
                const calendars = calDAVSummary[i]["calendars"]
                for(const j in calendars){
                    if(calendars[j]["calendars_id"]==calendars_id){
                        return calDAVSummary[i]["caldav_accounts_id"]
                    }
                }
            }
        }
    }

    return null
}

export async function checkifCalendarIDPresentinDexieSummary(calendar_id){
    
    const  summaryToCheck=  await getCalDAVSummaryFromDexie()
    let toReturn = false
    if(isValidResultArray(summaryToCheck )){
        for(const i in summaryToCheck ){
            if(isValidResultArray(summaryToCheck[i]["calendars"])){
                for(const j in summaryToCheck[i]["calendars"]){
                    if(summaryToCheck[i]["calendars"][j]["calendars_id"]==calendar_id){
                        return true
                    }
                }
            }
        }
    }



    return toReturn


}

export function basicTaskFilterForDexie(parsedTask){

    // console.log("parsedTask", parsedTask)
    if(parsedTask["summary"] && !parsedTask.completed && parsedTask["completion"]!="100"){
        // Task passed the basic checks
        return true
    }else{
        return false
    }
}