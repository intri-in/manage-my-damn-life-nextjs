import { isValidResultArray } from "@/helpers/general";
import { deleteCalDAVAccountFromDexie, getCalDAVSummaryFromDexie, saveCaldavAccountToDexie } from "./caldav_dexie";
import { deleteOneCalendarFromDexie, insertOneCalendarIntoDexie } from "./calendars_dexie";

export async function syncCalDAVSummary(calDavSummaryFromServer){
    const calDavFromDexie = await getCalDAVSummaryFromDexie()
    for (const i in calDavSummaryFromServer){
        let found =false
            for(const j in calDavFromDexie ){
                if(calDavFromDexie[j]["caldav_accounts_id"]==calDavSummaryFromServer[i]["caldav_accounts_id"]){
                    //Found. Now we check if the values match.
                    if(calDavFromDexie[j]["url"]!=calDavSummaryFromServer[i]["url"] || calDavFromDexie[j]["username"]!=calDavSummaryFromServer[i]["username"]){
                        found=true
                    }else{
                        //Now we go and match up calendars.
                        await compareCalendars(calDavSummaryFromServer[i]["calendars"],calDavFromDexie[j]["calendars"], calDavSummaryFromServer[i]["caldav_accounts_id"])
                    }
                }
            }

            if(!found){
                //We need to create the caldav account in dexie.
                saveCaldavAccountToDexie(calDavSummaryFromServer[i],calDavSummaryFromServer[i].username)
            }
        }
            // Deleting those not present on the server.

    for(const j in calDavFromDexie ){
        var found = false
        for (const i in calDavSummaryFromServer){
            if(calDavFromDexie[j]["caldav_accounts_id"]==calDavSummaryFromServer[i]["caldav_accounts_id"]){
                found =true
            }
        }
        // console.log(calDavFromDexie[j]["caldav_accounts_id"], found)
        if(!found){
            deleteCalDAVAccountFromDexie(calDavFromDexie[j]["caldav_accounts_id"])
        }
    }




}


export async function compareCalendars(calFromServer, calFromDexie, caldav_accounts_id){
    for(const i in calFromServer){
        var found =false
        for(const j in calFromDexie){
            if(calFromServer[i]["url"]==calFromDexie[j]["url"]){
                found = true
            }
        }
        if(!found){
            //We need to create it.
            insertOneCalendarIntoDexie(calFromServer[i], caldav_accounts_id)
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
            deleteOneCalendarFromDexie(calFromDexie[j]["calendars_id"])
        }
    }
}