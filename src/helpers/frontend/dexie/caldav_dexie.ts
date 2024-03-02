import { addTrailingSlashtoURL, isValidResultArray } from "@/helpers/general";
import { db } from "./dexieDB";
import { deleteAllCalendarsFromCaldavAccountID_Dexie, getAllCalendarsFromCalDavAccountIDFromDexie, getCalendarNameByIDFromDexie } from "./calendars_dexie";

export async function getCalDAVSummaryFromDexie(){
  const caldavAccounts = await getAllCalDavAccountsFromDexie()
  var toReturn :any = []
  if(isValidResultArray(caldavAccounts)){
    for(const i in caldavAccounts){
      const allCals = await getAllCalendarsFromCalDavAccountIDFromDexie(caldavAccounts[i]["caldav_accounts_id"])
      if(isValidResultArray(allCals)){
        caldavAccounts[i]["calendars"] = allCals
      }
      toReturn.push(caldavAccounts[i])
    }
  }

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
export async function getAllCalDavAccountsFromDexie(){
  try{
    
    const caldav =  await db.caldav_accounts
    .toArray();

  // Return result
  return caldav;
  }
  catch(e){
    console.warn("getAllCalDavAccountsFromDexie",e)
  }

}
export async function findCalDAVAccountinDexie(url, username){
    // console.log("url, username", url, username)
    const caldav =  await db.caldav_accounts
    .where('url')
    .equals(addTrailingSlashtoURL(url))
    .and(item => item.username ==username)
    .toArray();

  // Return result
  return caldav;

}
export async function saveCaldavAccountToDexie(caldavFromDB, username){
    const caldavFromDexie = await findCalDAVAccountinDexie(caldavFromDB["url"], caldavFromDB["username"])
    if(caldavFromDexie && caldavFromDexie.length==0){
      await insertNewCaldavAccountIntoDexie(caldavFromDB, username)
      return true
    }
}

export async function insertNewCaldavAccountIntoDexie(caldavFromDB, username){
    try{
        const id = await db.caldav_accounts.add({
            name: caldavFromDB["name"],
            username: username,
            url:  caldavFromDB["url"],
            caldav_accounts_id:  caldavFromDB["caldav_accounts_id"]
        })
    }catch(e){
        console.error("insertNewCaldavAccountIntoDexie", e)
    }


  }

export async function deleteCalDAVAccountFromDexie(caldav_accounts_id){
  const keyFromDexie = await getKeyFromCaldavAccountsID(caldav_accounts_id)
  if(keyFromDexie){
    const result = await db.caldav_accounts.delete(keyFromDexie)
    deleteAllCalendarsFromCaldavAccountID_Dexie(caldav_accounts_id)
  }
  //Delete all Calendars too.

}