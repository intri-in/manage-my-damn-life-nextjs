export const LASTSYNC="LASTSYNC"

// IS_SYNCING holds the state of sync. It's true 
export const IS_SYNCING="IS_SYNCING"


export function clearLocalStorage(){
    try{
        localStorage.clear();
    }catch(e){
        console.error("clearLocalStorage", e)
    }
}


export function getValueFromLocalStorage(keyName){

    if(!keyName){
        return null
    }

    try{
        return localStorage.getItem(keyName)
    }catch(e){
        console.warn("getValueFromLocalStorage",e)
    }
    return null
}

/**
 * Saves calendar names from server to user storage.
 * @param {*} calendarsFromServer Calendar data from API
 */
export function setUserCalendarStorageVar(calendarsFromServer){
    try{

        const toStore= JSON.stringify(calendarsFromServer)
        localStorage.setItem("MMDL_USER_CALENDARS", toStore)
    }
    catch(e){
        console.warn("setUserCalendarStorageVar", e)
    }
}

/**
 * Get the array of Calendars and caldav accounts from LocalStorage.
 * @returns Array of Calendars and Caldav accounts from Local storage. 
 */
export function getUserCalendarsFromLocalStorage(){
    try{
        const userCalendarString= localStorage.getItem("MMDL_USER_CALENDARS")
   
        const toReturn = JSON.parse(userCalendarString)
        return toReturn
    }
    catch(e){
        console.warn("getUserCalendarsFromLocalStorage", e)
        return null
    }

}
