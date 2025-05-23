import { isValidResultArray } from "@/helpers/general";
import { deleteCalDAVAccountFromDexie, getCalDAVSummaryFromDexie, saveCaldavAccountToDexie } from "./caldav_dexie";
import { deleteOneCalendarFromDexie, getCalendarIDFromUrl_Dexie, insertOneCalendarIntoDexie, updateCalendarSyncTokenAndCtag } from "./calendars_dexie";
import { caldavAccountsfromServer } from "../calendar";
import { compareCalDAVSummary_andGetIndex } from "./dexie_helper";
import { getUserDataFromCookies } from "../user";
import { getUserIDForCurrentUser_Dexie } from "./users_dexie";

export async function syncCalDAVSummary(calDavSummaryFromServer){
    const userid = await getUserIDForCurrentUser_Dexie()
    const calDavFromDexie = await getCalDAVSummaryFromDexie()
    console.log("calDavFromDexie", calDavFromDexie, userid)
    for (const i in calDavSummaryFromServer){
        const indexInDexie = compareCalDAVSummary_andGetIndex(calDavSummaryFromServer[i], calDavFromDexie)
        console.log("index", indexInDexie)
        if(indexInDexie==-1 || indexInDexie=="-1"){
            //Not found in dexie summary.
                //We need to create the caldav account in dexie.
            await saveCaldavAccountToDexie(calDavSummaryFromServer[i],calDavSummaryFromServer[i].username,userid)
        }

    }
    
    // Deleting those not present on the server.

    for(const j in calDavFromDexie ){
        const indexInServer = compareCalDAVSummary_andGetIndex(calDavFromDexie[j], calDavSummaryFromServer)
        // console.log(calDavFromDexie[j])
        if(indexInServer==-1 || indexInServer=="-1"){
            await deleteCalDAVAccountFromDexie(calDavFromDexie[j]["caldav_accounts_id"])
        }
    }
        //Now we go and match up calendars.
    return await syncCalendarList(calDavSummaryFromServer)



}

export async function syncCalendarList(calDavSummaryFromServer){
    const calDavFromDexie = await getCalDAVSummaryFromDexie()
    let toReturn:{caldav_accounts_id: string| number, calendars: any[]}[] =[]

    // console.log("calDavSummaryFromServer Calendar Sync", calDavSummaryFromServer, calDavFromDexie)
    
    for (const i in calDavSummaryFromServer){

        const indexInDexie = compareCalDAVSummary_andGetIndex(calDavSummaryFromServer[i], calDavFromDexie)
        // console.log("index calendar", indexInDexie)
        if(indexInDexie!=-1 && indexInDexie!="-1"){
            toReturn.push(await compareCalendars(calDavSummaryFromServer[i]["calendars"],calDavFromDexie[indexInDexie]["calendars"], calDavSummaryFromServer[i]["caldav_accounts_id"]))

        }

    }

    return toReturn
}
/**
 * Compares calendars received from CalDaV account to the ones stored locally.
 * Return a list of calendars that need to be synced.
 * @param calFromServer 
 * @param calFromDexie 
 * @param caldav_accounts_id 
 */
export async function compareCalendars(calFromServer, calFromDexie, caldav_accounts_id){
    // console.log("calFromServer,calFromDexie ", calFromServer,calFromDexie)
    let toReturn:{caldav_accounts_id: string| number, calendars: any[]} = {caldav_accounts_id:caldav_accounts_id, calendars:[]}
    let calendarToSyncList : any[]= []
    for(const i in calFromServer){
        let found =-1
        if(calFromDexie){

            for(let j=0; j<calFromDexie.length; j++ ){
                if(calFromServer[i]["url"]==calFromDexie[j]["url"]){
                    found = j
                    break;
                }
            }
        }
        // console.log(calFromServer[i]["url"], found)
        if(found==-1){
            //We need to create it.
            await insertOneCalendarIntoDexie(calFromServer[i], caldav_accounts_id)
            // We also need to sync this calendar.
            //Get Calendars_id for this calendar
            const calendars_id = await getCalendarIDFromUrl_Dexie(calFromServer[i]["url"])
            calendarToSyncList.push({calendars_id:calendars_id,...calFromServer[i]})
        }else{
            //Update calender
            // const calendar_id = getCalendarIDFromUrl_Dexie(found)
            if((calFromServer[i]["ctag"]!=calFromDexie[found]["ctag"] ) || calFromServer[i]["syncToken"]!=calFromDexie[found]["syncToken"]  ){
                //Update these values in the local calendar.
                updateCalendarSyncTokenAndCtag(calFromDexie[found]["calendars_id"], calFromServer[i]["syncToken"], calFromServer[i]["ctag"])
                //This calendar must be synced.

                calendarToSyncList.push({calendars_id:calFromDexie[found]["calendars_id"],...calFromServer[i]})
            }

        }
    }
    toReturn.calendars=calendarToSyncList
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

    return toReturn
}
