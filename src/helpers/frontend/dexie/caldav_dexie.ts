import { addTrailingSlashtoURL, isValidResultArray } from "@/helpers/general";
import { Caldav_Accounts, db } from "./dexieDB";
import { deleteAllCalendarsFromCaldavAccountID_Dexie, getAllCalendarsFromCalDavAccountIDFromDexie, getCalendarNameByIDFromDexie } from "./calendars_dexie";
import { getUserDataFromCookies } from "../user";
import { getUserIDForCurrentUser_Dexie } from "./users_dexie";

export async function getCalDAVSummaryFromDexie(){
  const userData = getUserDataFromCookies()
  const userHash = userData["userhash"]
  // console.log("userData", userData)
  // console.time("dexie_getUserIDFromHash_Dexie")
  const userid = await getUserIDForCurrentUser_Dexie()    
  // console.timeEnd("dexie_getUserIDFromHash_Dexie")
  
  // console.time("dexie_getAllCalDavAccountsFromDexie")
  const caldavAccounts = await getAllCalDavAccountsFromDexie(userid)
  // console.timeEnd("dexie_getAllCalDavAccountsFromDexie")

  let toReturn :any = []
  if(Array.isArray(caldavAccounts)){
    for(const i in caldavAccounts){
      const allCals = await getAllCalendarsFromCalDavAccountIDFromDexie(caldavAccounts[i]["caldav_accounts_id"])
      if(isValidResultArray(allCals)){
        caldavAccounts[i]["calendars"] = allCals
      }
      toReturn.push(caldavAccounts[i])
    }
  }
  // console.log(toReturn, "toReturn")
  
  return toReturn
}

export async function getCalDAVAccountbyCalDAVId_Dexie(caldav_accounts_id){
  const caldav =  await db.caldav_accounts
  .where('caldav_accounts_id')
  .equals(caldav_accounts_id)
  .toArray();

  return caldav
}

export async function getNameForTaskList(caldav_accounts_id, calendars_id){

  return new Promise((resolve, reject) => {
   getNameofCalDAVFromDexie(caldav_accounts_id).then((caldavName) =>{
    getCalendarNameByIDFromDexie(calendars_id).then((calendarName) =>{
      return resolve(caldavName+" >> "+calendarName)
    })
   })

  })

}



export async function getNameofCalDAVFromDexie(caldav_accounts_id){
  const caldav = await getCalDAVAccountbyCalDAVId_Dexie(caldav_accounts_id)
  if(isValidResultArray(caldav)){
    return caldav[0].name
  }
}
/**
 * Gets key from caldav_accounts_id
 * @param caldav_accounts_id 
 */
export async function getKeyFromCaldavAccountsID(caldav_accounts_id){
  const caldav =  await db.caldav_accounts
  .where('caldav_accounts_id')
  .equals(caldav_accounts_id)
  .toArray();

// Return result
  if(caldav && Array.isArray(caldav) && caldav.length>0){

    return caldav[0].id;
  }
  return null

}
export async function getCaldavAccountfromDexie(caldavFromDB){
  
         
        const caldav =  await db.caldav_accounts
          .where('caldav_accounts_id')
          .equals(caldavFromDB["caldav_accounts_id"])
          .toArray();
  
        // Return result
        return caldav;

}
export async function getAllCalDavAccountsFromDexie(userid){

    if(!userid){
      return []
    }
    const caldav =  await db.caldav_accounts
    .where('userid')
    .equals(userid)
    .toArray()
    .catch(e =>{
      console.error("getAllCalDavAccountsFromDexie", e)
  })

  // Return result
  return caldav;
  
 
}
export async function findCalDAVAccountinDexie(url, username, userid){
    // console.log("url, username", url, username)
    let toReturn: Caldav_Accounts[] = []
    const caldav =  await db.caldav_accounts
    .where('url')
    .equals(addTrailingSlashtoURL(url))
    .and(item => item.username ==username)
    .toArray()
    .catch(e =>
      {
        console.error("findCalDAVAccountinDexie", e)
      });

    if(caldav && Array.isArray(caldav)){
      // Check if the userid exists
      for (const i in caldav){
        if(caldav[i]["userid"].toString()==userid.toString()){
          toReturn.push(caldav[i])
        }
      }
    }
  // Return result
  return toReturn;

}


export async function saveCaldavAccountToDexie(caldavFromDB, username, useridInput?){

  let userid=useridInput
  if(!useridInput){
    userid = await getUserIDForCurrentUser_Dexie()

  }


    const caldavFromDexie = await findCalDAVAccountinDexie(caldavFromDB["url"], caldavFromDB["username"],userid)
    if(caldavFromDexie && caldavFromDexie.length==0){
      await insertNewCaldavAccountIntoDexie(caldavFromDB, username,userid)
      return true
    }
}

export async function insertNewCaldavAccountIntoDexie(caldavFromDB, username,userid){

  if(!userid) return 
    const id = await db.caldav_accounts.add({
        name: caldavFromDB["name"],
        username: username,
        url:  caldavFromDB["url"],
        caldav_accounts_id:  caldavFromDB["caldav_accounts_id"],
        userid:parseInt(userid),
    }).catch(e =>{
      console.error("insertNewCaldavAccountIntoDexie", e)
    })



  }

export async function deleteCalDAVAccountFromDexie(caldav_accounts_id){
  const keyFromDexie = await getKeyFromCaldavAccountsID(caldav_accounts_id)
  if(keyFromDexie){
    const result = await db.caldav_accounts.delete(keyFromDexie)
    deleteAllCalendarsFromCaldavAccountID_Dexie(caldav_accounts_id)
  }
  //Delete all Calendars too.

}