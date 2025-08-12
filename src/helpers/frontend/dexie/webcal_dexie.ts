import { getUserIDForCurrentUser_Dexie } from "./users_dexie";
import { db } from "./dexieDB";
import { getWebCalsFromServer } from "../webcals";
import { Json } from "sequelize/types/utils";

export async function addWebCalAccounttoDexie(webcalid,name, link, updateInterval, lastFetched, colour){
    const userid = await getUserIDForCurrentUser_Dexie()
    if(!userid){
        return
    }
    const id = await db.webcals.add({
        name: name,
        webcals_id:webcalid,
        link:link,
        colour:colour,
        updateInterval: updateInterval,
        userid:userid.toString(),
        lastFetched: lastFetched
    }).catch(e =>{
      console.error("insertNewCaldavAccountIntoDexie", e)
    })

    return id

}

export async function addWebCalEventstoDexie(webcalId, parsedCal){
    for (const i in parsedCal){
        let dataToSave = parsedCal[i]
        console.log("typeof(dataToSave)", typeof(dataToSave))
        if(typeof(dataToSave) !=="string"){
            dataToSave= JSON.stringify(parsedCal[i])
        }
        const id = await db.webcals_events.add({
            data:dataToSave,
            webcals_id:webcalId
        }).catch(e =>{
            console.error("insertNewCaldavAccountIntoDexie", e)
        })
    
    
    }
}

export async function isWebCalAccountAlreadyinDexie(webcalid){
    const id = await getPrimaryKeyFromWebCalId_Dexie(webcalid)
    if(id) return true
    return false
}

export async function getPrimaryKeyFromWebCalId_Dexie(webcalId){
    const webcal =  await db.webcals
    .where('webcals_id')
    .equals(webcalId)
    .toArray();

    if(webcal && Array.isArray(webcal) && webcal.length>0){
        return webcal[0].id
    }
    
    return null
}

export async function getWebCalIDFromPrimaryID_Dexie(id){
    const webcal =  await db.webcals
    .where('id')
    .equals(parseInt(id))
    .toArray();

    if(webcal && Array.isArray(webcal) && webcal.length>0){
        return webcal[0].webcals_id
    }
    
    return null

}

export async function deleteEventsFromWebCal_Dexie(webcalId){
    const webcal =  await db.webcals_events
    .where('webcals_id')
    .equals(webcalId)
    .delete()

}
export async function deleteWebCalbyWebCalIdFromDexie(webcalId){
    const primaryKey = await getPrimaryKeyFromWebCalId_Dexie(webcalId)
    await db.webcals.delete(primaryKey)
    
}


export async function getAllWebcalsforCurrentUserfromDexie(){
    const userid = await getUserIDForCurrentUser_Dexie()
    if(!userid){
        return 
    }
    const webcals =  await db.webcals
    .where('userid')
    .equals(userid.toString())
    .toArray();

    return webcals

}


export async function updateWebCalLastFetched_Dexie(webcalid, lastFetched){
    const id = await getPrimaryKeyFromWebCalId_Dexie(webcalid)
    await db.webcals.update(id, {
        lastFetched: lastFetched
    })

}

export async function updateEventsinWebcal_Dexie(webcalId, newParsedCal){
    await deleteEventsFromWebCal_Dexie(webcalId)
    await addWebCalEventstoDexie(webcalId, newParsedCal)
}

export async function getEventsfromWebcal_Dexie(webcalId){
    const webcals_events =  await db.webcals_events
    .where('webcals_id')
    .equals(webcalId)
    .toArray()


    return webcals_events


}