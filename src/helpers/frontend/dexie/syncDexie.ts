import { isValidResultArray } from "@/helpers/general";
import { deleteCalDAVAccountFromDexie, getCalDAVSummaryFromDexie, saveCaldavAccountToDexie } from "./caldav_dexie";
import { deleteOneCalendarFromDexie, insertOneCalendarIntoDexie } from "./calendars_dexie";
import { caldavAccountsfromServer } from "../calendar";
import { compareCalDAVSummary_andGetIndex } from "./dexie_helper";

export async function syncCalDAVSummary(calDavSummaryFromServer){
    const calDavFromDexie = await getCalDAVSummaryFromDexie()
    for (const i in calDavSummaryFromServer){
        const indexInDexie = compareCalDAVSummary_andGetIndex(calDavSummaryFromServer[i], calDavFromDexie)
        // console.log("index", indexInDexie)
        if(indexInDexie==-1 || indexInDexie=="-1"){
            //Not found in dexie summary.
                //We need to create the caldav account in dexie.
            await saveCaldavAccountToDexie(calDavSummaryFromServer[i],calDavSummaryFromServer[i].username)
        }

    }
    
    // Deleting those not present on the server.

    for(const j in calDavFromDexie ){
        const indexInServer = compareCalDAVSummary_andGetIndex(calDavFromDexie[j], calDavSummaryFromServer)
        if(indexInServer==-1 || indexInServer=="-1"){
            await deleteCalDAVAccountFromDexie(calDavFromDexie[j]["caldav_accounts_id"])
        }
    }
        //Now we go and match up calendars.
    await syncCalendarList(calDavSummaryFromServer)

    return true


}

export async function syncCalendarList(calDavSummaryFromServer){
    const calDavFromDexie = await getCalDAVSummaryFromDexie()
    // console.log("calDavSummaryFromServer Calendar Sync", calDavSummaryFromServer, calDavFromDexie)
    for (const i in calDavSummaryFromServer){

        const indexInDexie = compareCalDAVSummary_andGetIndex(calDavSummaryFromServer[i], calDavFromDexie)
        // console.log("index calendar", indexInDexie)
        if(indexInDexie!=-1 && indexInDexie!="-1"){
            await compareCalendars(calDavSummaryFromServer[i]["calendars"],calDavFromDexie[indexInDexie]["calendars"], calDavSummaryFromServer[i]["caldav_accounts_id"])

        }

    }
}
export async function compareCalendars(calFromServer, calFromDexie, caldav_accounts_id){
    // console.log("calFromServer,calFromDexie ", calFromServer,calFromDexie)
    for(const i in calFromServer){
        var found =false
        for(const j in calFromDexie){
            if(calFromServer[i]["url"]==calFromDexie[j]["url"]){
                found = true
            }
        }
        // console.log(calFromServer[i]["url"], found)
        if(!found){
            //We need to create it.
            await insertOneCalendarIntoDexie(calFromServer[i], caldav_accounts_id)
        }
    }

    // Now to delete the ones that are extra.
    for(const j in calFromDexie){
        var found =false
        for(const i in calFromServer){
            if(calFromServer[i]["url"]==calFromDexie[j]["url"]){
                found = true
            }

        }
        if(!found){
            //We need to delete it from Dexie, as it doesn't exist on caldav.
            await deleteOneCalendarFromDexie(calFromDexie[j]["calendars_id"])
        }
    }
}
