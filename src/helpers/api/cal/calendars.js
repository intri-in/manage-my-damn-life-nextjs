import { getConnectionVar } from "../db";
import validator from 'validator';
import { getUseridFromUserhash } from "../user";
import { isValidResultArray } from "@/helpers/general";
import { deleteCalendarObjectsFromCalendarDB } from "./object";

export async function getCaldavAccountfromDetails(username, url)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM caldav_accounts WHERE username= ? AND url =?", [ username, url], function (err, result, fields) {
            if (err) throw err;
            con.end()
            resolve(Object.values(JSON.parse(JSON.stringify(result))));

        })
    })

}

export async function getCaldavAccountfromUserID(userid)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT caldav_accounts_id,username,url,name FROM caldav_accounts WHERE userid= ?", [userid], function (err, result, fields) {
            if (err) throw err;
            con.end()
            resolve(Object.values(JSON.parse(JSON.stringify(result))));

        })
    })

}


export async function getCaldavAccountsfromUserid(userid)
{

    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT caldav_accounts_id,username,url,name FROM caldav_accounts WHERE userid= ?", [ userid], function (err, result, fields) {
            if (err) throw err;
            con.end()
            resolve(Object.values(JSON.parse(JSON.stringify(result))));

        })
    })

}

export async function getCaldavAccountsAllData(userid)
{

    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM caldav_accounts WHERE userid= ?", [ userid], function (err, result, fields) {
            if (err) throw err;
            con.end()
            resolve(Object.values(JSON.parse(JSON.stringify(result))));

        })
    })

}



export async function caldavAccountExistinDB(username, url)
{
    const caldavaccounts=await getCaldavAccountfromDetails(username, url)
    if(caldavaccounts!=null&&caldavaccounts.length>0)
    {

        return caldavaccounts
    }
    else
    {
        return false
    }
}

export function isValidCaldavAccount(account_array)
{
    if(account_array!=null&&account_array.length>0&&account_array[0].caldav_accounts_id!=null)
    {
        return true
    }
    else
    {
        return false
    }

}
/**
 * 
 * @param {*} calendar Calendar object from tsdav or from DB 
 * @param {*} caldav_accounts_id Caldav account ID from DB
 * @returns True if calendar exists
 */
export async function checkifCalendarExistforUser(calendar, caldav_accounts_id)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM calendars WHERE caldav_accounts_id= ? AND url =? AND displayName =?", [ caldav_accounts_id, calendar.url,  calendar.displayName], function (err, result, fields) {
            if (err) throw err;
            con.end()
            var toReturn = Object.values(JSON.parse(JSON.stringify(result)));
            if(toReturn!=null&&toReturn.length>=1)
            {
                resolve(true)
            }
            else
            {
                resolve(false)
            }

        })
    })
}

export async function insertCalendarintoDB(calendar ,caldav_accounts_id)
{
    var con = getConnectionVar()
    var displayName = typeof(calendar.displayName) == String ? calendar.displayName : validator.escape(calendar.displayName) 
    var url =  calendar.url.toString()
    var ctag = calendar.ctag.toString()
    var description = typeof(calendar.description) == String ? calendar.description : validator.escape(calendar.description).toString()
    var calendarColor = validator.isHexColor(calendar.calendarColor.toString()) ? calendar.calendarColor : ""
    var syncToken = calendar.syncToken.toString()

    var resourcetype = calendar.resourcetype.toString()
    const timezoneValidator = require('timezone-validator');
    var timezone =""
    try{
         timezone = timezoneValidator(calendar.timezone) ? calendar.timezone: ""
    }
    catch(e)
    {
        //Timezone is invalid.        
    }
    

    con.query('INSERT INTO calendars (displayName, url, ctag, description, calendarColor, syncToken, timezone, caldav_accounts_id, resourcetype) VALUES (?,? ,?,?,? ,?,?,?,? )', [displayName, url, ctag,description,calendarColor, syncToken, timezone, caldav_accounts_id, resourcetype], function (error, results, fields) {
        if (error) {
            console.log(error)
            return error.message
        }
        con.end()
        });


}

export async function updateCalendarinDB(calendar ,caldav_accounts_id)
{
    var con = getConnectionVar()
    var displayName = typeof(calendar.displayName) == String ? calendar.displayName : validator.escape(calendar.displayName) 
    var url =  calendar.url.toString()
    var ctag = calendar.ctag.toString()
    var description = typeof(calendar.description) == String ? calendar.description : validator.escape(calendar.description).toString()
    var calendarColor = validator.isHexColor(calendar.calendarColor.toString()) ? calendar.calendarColor : ""
    //var syncToken = calendar.syncToken.toString()

    var resourcetype = calendar.resourcetype.toString()
    const timezoneValidator = require('timezone-validator');
    var timezone =""
    try{
         timezone = timezoneValidator(calendar.timezone) ? calendar.timezone: ""
    }
    catch(e)
    {
        //Timezone is invalid.        
    }
    var updated=Math.floor(Date.now() / 1000)
    return new Promise( (resolve, reject) => {
        con.query('UPDATE calendars SET ? WHERE url = ?',[{displayName: displayName, url:url, ctag: ctag, description: description, calendarColor: calendarColor, resourcetype:resourcetype, timezone:timezone, updated: updated }, calendar.url], function (error, results, fields) {
            if (error) {
                console.log("updateCalendarinDB: ",error.message)
                resolve(false)
            }
            con.end()
            resolve(true)
        })
    
    })


}

export async function deleteCalendarFromDB(calendar ,caldav_accounts_id)
{
    return new Promise( (resolve, reject) => {
        //First delete all objects in Events.
        const deleteResult =  deleteCalendarObjectsFromCalendarDB(calendar.calendars_id)

        con.query('DELETE FROM calendars WHERE url=?', [calendar.url], function (error, results, fields) {
            if (error) {
                throw error.message
            }
            con.end()
            });    

    })
}
export async function getObjectsfromCalendar(calendar)
{
    const objects = await fetchCalendarObjects({
        calendar: calendar,
      });
      
}

export async function getCaldavAccountIDFromCalendarID(calendar_id)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM calendars WHERE calendars_id=?", [calendar_id], function (err, result, fields) {
            if (err) throw err;
            con.end()
            var resultFromDB= Object.values(JSON.parse(JSON.stringify(result)))
            if(isValidResultArray(resultFromDB))
            {
                resolve(resultFromDB[0].caldav_accounts_id);

            }else
            {
                resolve(null)
            }
    
        })
        })
}

export async function checkifUserhasAccesstoCaldavAccount(userid, caldav_accounts_id)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM caldav_accounts WHERE caldav_accounts_id= ? AND userid=?", [caldav_accounts_id, userid], function (err, result, fields) {
            if (err) throw err;
            con.end()
            var resultFromDB=Object.values(JSON.parse(JSON.stringify(result)))

            if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
            {
                resolve(true);
            }
            else
            {
                resolve(false);
            }
            

        })
    })

}
/**
 * Checks if user has access to requested calendar. Returns calendar if user has access. Null otherwise.
 * @param {*} userid 
 * @param {*} caldav_account_id 
 * @param {*} calendar_id 
 * @returns 
 */
export async function checkifUserHasAccesstoRequestedCalendar(userid, caldav_account_id, calendar_id)
{
    const userhasAccesstoCaldav=await checkifUserhasAccesstoCaldavAccount(userid, caldav_account_id)
    var calToReturn = null
    if(userhasAccesstoCaldav)
    {
        const allCalendarsinCaldavAccount= await getCalendarsfromCaldavAccountsID(caldav_account_id)
        
        if(allCalendarsinCaldavAccount!=null && Array.isArray(allCalendarsinCaldavAccount) && allCalendarsinCaldavAccount.length>0)
        {
            for (let i=0; i<allCalendarsinCaldavAccount.length; i++)
            {
                if(allCalendarsinCaldavAccount[i].calendars_id==calendar_id)
                {
                    calToReturn=allCalendarsinCaldavAccount[i]
                }
            }
        }
            
       
    }
    return calToReturn
}

export async function getCalendarsfromCaldavAccountsID(caldav_accounts_id)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM calendars WHERE caldav_accounts_id= ?", [ caldav_accounts_id], function (err, result, fields) {
            if (err) throw err;
            con.end()
            resolve(Object.values(JSON.parse(JSON.stringify(result))));

        })
    })

}


export function getCalendarfromCalendarID(calendar_id)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM calendars WHERE calendars_id= ?", [ calendar_id], function (err, result, fields) {
            con.end()
            if (err) {
                console.log("getCalendarfromCalendarID: ",err) 
                resolve(null)
            }
            var resultFromDB= Object.values(JSON.parse(JSON.stringify(result)))
            if(isValidResultArray(resultFromDB))
            {
                resolve(resultFromDB[0]);

            }

        })
    })

}