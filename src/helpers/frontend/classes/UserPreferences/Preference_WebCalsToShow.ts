import { varNotEmpty } from "@/helpers/general"; 
import { getAllWebcalsforCurrentUserfromDexie } from "../../dexie/webcal_dexie";
import { USER_PREFERENCE_CALENDARS_TO_SHOW, USER_PREFERENCE_WEBCALS_TO_SHOW } from "../../localstorage";

interface ObjectPreferenceEntry{
    account: AccountType
    calendars: any[]
}
interface AccountType{
    caldav_accounts_id?: string | number
    name?: string | number
    type?:string
}
export interface Calendars_toShow_WebCalAccountType{
    webcal_id: number | string;
    name: string;
    show: boolean
}    



/**
 * Get preference object for displaying web_cal
 */
export async function getPreferenceObject_webCalsToShow():Promise<Calendars_toShow_WebCalAccountType[] | any>{
    try{

        const prefFromLocalStorage =  localStorage.getItem(USER_PREFERENCE_WEBCALS_TO_SHOW)
        if(prefFromLocalStorage) {
            return JSON.parse(prefFromLocalStorage)

        }
        return generatePreferenceObject_webCalsToShow()

    }catch(e){
        console.error(e, "Preference_WebCalsToShow.get")
        return []
    }

}

export async function removePreferenceObject_webCalsToShow(){

    try{
        localStorage.removeItem(USER_PREFERENCE_WEBCALS_TO_SHOW)
    }
    catch(e){
        console.warn("Preference_WebCalsToShow.remove", e)
    }

}
export async function setPreferenceObject_webCalsToShow(preferenceObject: Calendars_toShow_WebCalAccountType[]){
    try
    {
        await removePreferenceObject_webCalsToShow()
        localStorage.setItem(USER_PREFERENCE_WEBCALS_TO_SHOW, JSON.stringify(preferenceObject))
    }catch(e){
        console.warn("Preference_WebCalsToShow.setWebDav", e)
    }
}


export async function generatePreferenceObject_webCalsToShow(){
    let toSave: Calendars_toShow_WebCalAccountType[] = []
    const allWebCalsFromDexie = await getAllWebcalsforCurrentUserfromDexie()
    if(allWebCalsFromDexie && Array.isArray(allWebCalsFromDexie) && allWebCalsFromDexie.length>0
    ){
        for (const i in allWebCalsFromDexie){
            toSave.push({name: allWebCalsFromDexie[i].name, show: true, webcal_id:allWebCalsFromDexie[i].webcals_id!.toString()})
        }

    }
    setPreferenceObject_webCalsToShow(toSave)

    return toSave

}

export async function flipShowValueforWebCalId(webcal_id_toChange){
    const prefObj =  await getPreferenceObject_webCalsToShow()
    if(prefObj && Array.isArray(prefObj) && prefObj.length>0){
        for(const i in prefObj){
            if(webcal_id_toChange==prefObj[i]["webcal_id"]){
                prefObj[i]["show"]=!prefObj[i]["show"]
                
            }
        }
    }
    setPreferenceObject_webCalsToShow(prefObj)
    return prefObj
}

export async function checkIfUserWanttoSeeWebCalIDFromPreferenceObject(webcal_id){
    const prefObj =  await getPreferenceObject_webCalsToShow()
    if(prefObj && Array.isArray(prefObj) && prefObj.length>0){
        for(const i in prefObj){
            if(webcal_id==prefObj[i]["webcal_id"]){
                return prefObj[i]["show"]
            }

        }
    }
    return true

}