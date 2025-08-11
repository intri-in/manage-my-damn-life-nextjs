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


export class Preference_CalendarsToShow{


    static get(){
        let toReturn = null
        try{
            const prefFromLocalStorage = localStorage.getItem(USER_PREFERENCE_CALENDARS_TO_SHOW)
            if(varNotEmpty(prefFromLocalStorage) && prefFromLocalStorage)
            {
                return JSON.parse(prefFromLocalStorage)
            }
        }catch(e)
        {
            console.error(e, "Preference_CalendarsToShow.get")
        }
    
        return toReturn
    }

    static remove(){

        try{
            localStorage.removeItem(USER_PREFERENCE_CALENDARS_TO_SHOW)
            localStorage.removeItem(USER_PREFERENCE_WEBCALS_TO_SHOW)
        }
        catch(e){
            console.warn("Preference_CalendarsToShow.remove", e)
        }

    }
    static set(preferenceObject: {account:{caldav_accounts_id: number}, calendars: any }[]){
        try
        {
            Preference_CalendarsToShow.remove()
            localStorage.setItem(USER_PREFERENCE_CALENDARS_TO_SHOW, JSON.stringify(preferenceObject))
        }catch(e){
            console.warn("Preference_CalendarsToShow.set", e)

        }

    }
    static setWebDav(preferenceObject: Calendars_toShow_WebCalAccountType[]){
        try
        {
            Preference_CalendarsToShow.remove()
            localStorage.setItem(USER_PREFERENCE_WEBCALS_TO_SHOW, JSON.stringify(preferenceObject))
        }catch(e){
            console.warn("Preference_CalendarsToShow.setWebDav", e)

        }

    }

    static async generate(caldav_accounts: {name: string, caldav_accounts_id: number, calendars: any }[]){

        //First we generate from caldav accounts and store it
        const fromCaldav = Preference_CalendarsToShow.generateFromCaldavObject(caldav_accounts)
        Preference_CalendarsToShow.set(fromCaldav)

    }


    static generateFromCaldavObject(caldav_accounts: {name: string, caldav_accounts_id: number, calendars: any }[]){

        var objToReturn : any= []
        for(const i in caldav_accounts){
            var entry = {}

            
            
            if(varNotEmpty(caldav_accounts[i].calendars) && Array.isArray(caldav_accounts[i].calendars) && caldav_accounts[i].calendars.length>0)
            {
                var newCalendarEntry: {calendars_id: any, caldav_accounts_id: any, show: boolean}[] = []
                
                
                for(const k in caldav_accounts[i].calendars){
                    if(varNotEmpty(caldav_accounts[i].calendars[k].caldav_accounts_id) && varNotEmpty(caldav_accounts[i].calendars[k].calendars_id && varNotEmpty(caldav_accounts[i].calendars[k].displayName))){
                        newCalendarEntry.push({
                            calendars_id: caldav_accounts[i].calendars[k].calendars_id,
                            caldav_accounts_id: caldav_accounts[i].calendars[k].caldav_accounts_id,
                            show: true
                        })        
                    }
                }
                
                if(newCalendarEntry.length>0)
                {
                    entry["account"]={
                        caldav_accounts_id:caldav_accounts[i].caldav_accounts_id,
                    }
                    entry["calendars"]=newCalendarEntry

                    objToReturn.push(entry)
                }

            }
              
            
        }
        Preference_CalendarsToShow.set(objToReturn)
        return objToReturn
    }

    static isValidObject(preferenceObject: any): boolean{
        if(varNotEmpty(preferenceObject) && Array.isArray(preferenceObject) && preferenceObject.length>0)
        {
            for(const i in preferenceObject)
            {
                if(!varNotEmpty(preferenceObject[i].account) ||!varNotEmpty( preferenceObject[i].account.caldav_accounts_id) || !varNotEmpty(preferenceObject[i].calendars) || Array.isArray(preferenceObject[i].calendars) ==false ) {
                        return false
                }
            }
    
        }else{
            return false
        }
    
    
        return true
    
    }

    static isUptoDate(caldav_accounts:{name: string, caldav_accounts_id: number, calendars: any }[]){
        const fromStorage = Preference_CalendarsToShow.get()
        if(varNotEmpty(fromStorage) && Array.isArray(fromStorage)){
            for(const i in caldav_accounts){
                if(this.findIndex_CaldavAccount(fromStorage, caldav_accounts[i].caldav_accounts_id)==null){
                    return false
                }else{
                    for (const j in caldav_accounts[i].calendars)
                    {
                        const index = this.findIndex_Calendar(fromStorage, caldav_accounts[i].caldav_accounts_id,caldav_accounts[i].calendars[j].calendars_id)

                        if(index==null ){
                            return false
                        }

                    }
                }
            }
        }else{
            return false
        }


        return true
    }

    static findIndex_CaldavAccount(objectFromStorage, caldav_accounts_id,){

        for(const i in objectFromStorage){

            if(objectFromStorage[i].account.caldav_accounts_id==caldav_accounts_id)
            {
                return i 
            }
        }

        return null
    }

    static findIndex_Calendar(objectFromStorage, caldav_accounts_id, calendars_id){
        for(const i in objectFromStorage){

            if(objectFromStorage[i].account.caldav_accounts_id==caldav_accounts_id)
            {
                for(const j in objectFromStorage[i].calendars){
                    if(objectFromStorage[i].calendars[j].calendars_id==calendars_id)
                    {
                        return [i, j]
                    }
                }
            }
        }

        return null

    }

    static  update(indexToUpdate: number[], newValue: boolean){

        let fromStorage = this.get()
        if(fromStorage){

            fromStorage[indexToUpdate[0]].calendars[indexToUpdate[1]].show=newValue
            this.set(fromStorage)
        }


        return null
    }

    static getShowValueForCalendar(caldav_accounts_id: number | string, calendars_id: number | string ): boolean{

        var objectFromStorage = this.get()

        if(this.isValidObject(objectFromStorage))
        {
            var index= this.findIndex_Calendar(objectFromStorage, caldav_accounts_id, calendars_id)
            if(varNotEmpty(index)){

                var toReturn=objectFromStorage[index![0]].calendars[index![1]].show
                if(varNotEmpty(toReturn) && typeof(toReturn) =="boolean")
                {
                    return toReturn
                }
            }

        }

        return true
    }
}