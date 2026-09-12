import { isValidResultArray } from "@/helpers/general";
import { Users, db } from "./dexieDB";
import { getUserDataFromCookies, logoutUser } from "../user";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { getSessionFromNextAuthAPI, getUserIDFromNextAuthSession_API } from "../nextAuthHelpers";
const LOCAL_STORAGE_USER_ID="LOCAL_STORAGE_USER_ID"

export async function getUserIDFromHash_Dexie(userhash){

    if(!userhash) return 
    //First we check if the data is even there.
    const userIDArray =  await db.users
    .where('hash')
    .equals(userhash)
    .toArray()
    .catch(e =>{
        console.error("getUserIDFromHash_Dexie", e)
    })
    if(userIDArray && isValidResultArray(userIDArray)){
        // console.log("userIDArray",userIDArray)
        
        return userIDArray[userIDArray.length-1]["id"]
        
    }else{
        return null
    }

}


export async function deDuplicateUser(userIDArray: Users[])
{
    //Count number of Caldav_Accounts for each user id.
    let counter = [] 
    for(const i in userIDArray){


    }
    
}
export async function getUserIDForCurrentUser_Dexie(): Promise<number>{
    if(typeof(window)==="undefined"){
        throw new Error("This function must be called only from the Client side.")
    }
    //First we try to fetch from local storage.
    const userID_fromLocalStorage = localStorage.getItem(LOCAL_STORAGE_USER_ID)
    if(userID_fromLocalStorage) return Number(userID_fromLocalStorage)
    if(!await nextAuthEnabled()){
        const userData = getUserDataFromCookies()
        const userHash = userData["userhash"]
        const userid = await getUserIDFromHash_Dexie(userHash)
        if(userid) {
            localStorage.setItem(LOCAL_STORAGE_USER_ID,userid?.toString())
        }else{
            console.warn("getUserIDForCurrentUser_Dexie: userid is empty")
        }
        return Number(userid)
    }else{
        //NextAuth is being used.
        const userhash = await getUserIDFromNextAuthSession_API()
        const userid = await getUserIDFromHash_Dexie(userhash)  
        if(userid) {
            localStorage.setItem(LOCAL_STORAGE_USER_ID,userid?.toString())
        }else{
            console.warn("getUserIDForCurrentUser_Dexie: userid is empty")
        }
        return Number(userid)

    }
}

async function getUserHashforCurrentUser(){
    if(!await nextAuthEnabled()){

        const userData = getUserDataFromCookies()
        return userData["userhash"]
        
    }else{
        //NextAuth is being used.
        return await getUserIDFromNextAuthSession_API()
    }

}

export async function addUserToDB_Dexie(userhash){
    
    const id = await db.users.add({
        hash:userhash,      
    })
  


}

export async function checkifCurrentUserInDexie(){

    // const userData = getUserDataFromCookies()
    // const userhash = userData["userhash"]

    // if(!userhash){
    //     return false
    // }
    const userid = await getUserIDForCurrentUser_Dexie()
    if(!userid){

        const userhash = await getUserHashforCurrentUser()
        // console.log("userid and hash", userid, userhash)
    
        await addUserToDB_Dexie(userhash)
        
    }

    return true

}