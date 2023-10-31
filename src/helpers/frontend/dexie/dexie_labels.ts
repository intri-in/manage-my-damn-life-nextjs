import { isValidResultArray } from "@/helpers/general";
import { db } from "./dexieDB";
import { getRandomColourCode } from "../general";
import { fetchAllEventsFromDexie } from "./events_dexie";
import { returnGetParsedVTODO } from "../calendar";

export async function getAllLabelsFromDexie() {
    try {
        const labels = await db.labels
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
export async function checkifLabelExistsinDexie(labelName) {
    try {
        const labels = await db.labels
            .where('name')
            .equals(labelName)
            .toArray();
        if (isValidResultArray(labels)) {
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
    if (await checkifLabelExistsinDexie(labelString) == false) {
        //Add Label
        try {
            const id = await db.labels.add({
                name: labelString,
                colour: getRandomColourCode(),
            })
        } catch (e) {
            console.error("writeLabeltoDexie", e)
        }

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
    const eventArray = await fetchAllEventsFromDexie()
    if (isValidResultArray(eventArray)) {
        for (const i in eventArray) {
            const labelArray = returnGetParsedVTODO(eventArray[i]["data"]).category
            await saveLabelToDexie(labelArray)

        }
    }

}