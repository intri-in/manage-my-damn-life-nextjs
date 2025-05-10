import { isValidResultArray } from "@/helpers/general";
import { db } from "./dexieDB";
import { getRandomColourCode } from "../general";
import { fetchAllEventsFromDexie } from "./events_dexie";
import { returnGetParsedVTODO } from "../calendar";
import { basicTaskFilterForDexie } from "./dexie_helper";
import { getUserIDForCurrentUser_Dexie } from "./users_dexie";

export async function getAllLabelsFromDexie() {

    const userId = await getUserIDForCurrentUser_Dexie()
    if(!userId){
        return []
    }
    try {
        const labels = await db.labels
        .where("userid")
        .equals(userId)
        .toArray();

        return labels

    } catch (e) {
        console.warn("getAllLabelsFromDexie", e)
        return []
    }
}

export async function getLabelIDFromName_Dexie(labelName) {
    try {
        const labels = await db.labels
            .where('name')
            .equals(labelName)
            .toArray();
        if (isValidResultArray(labels)) {
            return labels[0].labels_id
        }

        return null

    } catch (e) {
        console.warn("getLabelIDFromName_Dexie", e)
        return null //Fallback so multiple labels aren't created in case of db error.
    }

}
export async function checkifLabelExistsinDexie(labelName,userid) {
    try {
        const labels = await db.labels
            .where('userid')
            .equals(userid)
            .and(label => label.name?.toLowerCase() == labelName.toLowerCase())
            .toArray();
        if (isValidResultArray(labels)) {getLabelIDFromName_Dexie
            return true
        }

        return false

    } catch (e) {
        console.warn("checkifLabelExistsinDexie", e)
        return true //Fallback so multiple labels aren't created in case of db error.
    }

}
export async function saveLabelToDexie(label) {
    if (label) {
        if (isValidResultArray(label)) {
            for (const i in label) {
                await writeLabeltoDexie(label[i])
            }
        } else {
            await writeLabeltoDexie(label)

        }
    }
}

export async function writeLabeltoDexie(labelString) {
    const userid = await getUserIDForCurrentUser_Dexie()
    if(!userid){
        return
    }
    if (await checkifLabelExistsinDexie(labelString,userid) == false) {
        //Add Label
        try {
            const id = await db.labels.add({
                name: labelString,
                userid: userid,
                colour: getRandomColourCode(),
            })
        } catch (e) {
            console.error("writeLabeltoDexie", e)
        }

    }
}
export async function clearLabelsFromDexie(){
    try {
        const id = await db.labels.clear()
    } catch (e) {
        console.error("clearLabelsFromDexie", e)
    }

}

export async function deleteLabelbyIDFromDexie(labels_id){
    try {
        await db.labels.delete(labels_id)
    } catch (e) {
        console.error("deleteLabelbyIDFromDexie", e)
    }

}

export async function updateLabelColourinDexie(labelName, colour) {
    const key = await getLabelIDFromName_Dexie(labelName)
    if (key) {
        try {
            db.labels.update(key, { colour: colour })
        } catch (e) {
            console.error("updateLabelColourinDexie", e)

        }
    }
}
export async function updateLabelCacheInDexie() {
    // await clearLabelsFromDexie()
    let tempLabelList: any = []
    const eventArray = await fetchAllEventsFromDexie("VTODO")
    if (isValidResultArray(eventArray)) {
        for (const i in eventArray) {
            const parsedTask = returnGetParsedVTODO(eventArray[i]["data"])
            if(parsedTask && basicTaskFilterForDexie(parsedTask)){
                const labelArray =parsedTask["category"]
                if(isValidResultArray(labelArray)){
                    for(const j in labelArray){
                        if(!tempLabelList.includes(labelArray[j]) && labelArray[j]){
                            
                            tempLabelList.push(labelArray[j])
                        }
                    }
                }else{
                    if(labelArray && !tempLabelList.includes(labelArray))
                    tempLabelList.push(labelArray)

                }
                // await saveLabelToDexie(labelArray)
            }

        }
        //Now that we have a generated List, we compare them to the ones we have saved in Dexie.
        await saveLabelToDexie(tempLabelList)
        
        // All the labels have been saved. We now delete the ones not in the new list.
        const labelsFromDexie = await getAllLabelsFromDexie()
        for(const l in labelsFromDexie){
            if(!tempLabelList.includes(labelsFromDexie[l]["name"])){
                // Label will be deleted.
                // console.log("To Delete ", labelsFromDexie[l]["name"])
                await deleteLabelbyIDFromDexie(labelsFromDexie[l]["labels_id"])
            }
        }

        // console.log("tempLabelList", tempLabelList)
    }else{
        // No event in dexie. Delete all labels.
        clearLabelsFromDexie()
    }

}