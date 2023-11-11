import { getConnectionVar } from '../db';
import { createDAVClient, getBasicAuthHeaders } from 'tsdav';
import ICAL from '@/../../node_modules/ical.js/build/ical'
import { getCalendarfromCalendarID, isValidCaldavAccount } from './calendars';
import { getRandomString } from '@/helpers/crypto';
import { syncEventsWithCaldlav } from './object';
import { AES } from 'crypto-js';
import CryptoJS from "crypto-js"
import { logError, varNotEmpty } from '@/helpers/general';
import ical from '@/../ical/ical'
import { parseICSWithICALJS } from '../ical';

/**
 * 
 * @param {*} caldav_account_id  
 * @returns CalDAV client from tsdav
 */
export async function getCaldavClient(caldav_account_id)
{
    var caldavClientDetails=await getCaldavAccountDetailsfromId(caldav_account_id)
    const client =  await createDAVClient({
        serverUrl: caldavClientDetails[0].url,
        credentials: {
            username: caldavClientDetails[0].username,
            password: AES.decrypt(caldavClientDetails[0].password,process.env.AES_PASSWORD).toString(CryptoJS.enc.Utf8)
        },
        authMethod: 'Basic',
        defaultAccountType: 'caldav',
    })

    return client

}

export async function createCalDAVAccount(accountname, username, password, url, userid)
{
    var encryptedPass = AES.encrypt(password, process.env.AES_PASSWORD).toString()
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query('INSERT INTO caldav_accounts (name, username, password, url, userid) VALUES (?,?,? ,?,?)', [accountname, username, encryptedPass, url, userid], function (error, results, fields) {
            con.end()
            if (error) {
                console.log(error) 
            }
            return resolve(true)
            });

    })

}

export async function getCaldavAccountDetailsfromId(caldav_account_id)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM caldav_accounts WHERE caldav_accounts_id= ?", [ caldav_account_id], function (err, result, fields) {
            con.end()
            if (err) {
                console.log(err);
                return resolve(null)
            }
            return resolve(Object.values(JSON.parse(JSON.stringify(result))));

        })
    })


}


export async function saveCalendarEventsintoDB(calendarObjects, caldav_account_id, calendar_id)
{
    var con = getConnectionVar()

    //First we need to check if the event is already in database. If so, we will need to compare etags to see if an update is required.
    if(calendarObjects!=null && Array.isArray(calendarObjects) && calendarObjects.length>0)
    {
        for(let i=0; i<calendarObjects.length; i++)
        {
            var type = checkifObjectisVTODO(calendarObjects[i].data)
            var eventfromDB=await getCalendarEventbyURL(calendarObjects[i].url,calendar_id)
            var updated=Math.floor(Date.now() / 1000)
            if(eventfromDB!=null && Array.isArray(eventfromDB) && eventfromDB.length>0)
            {


                if(eventfromDB[0].etag==calendarObjects[i].etag)
                {
                    if(eventfromDB[0].deleted!=null)
                    {
                        //Update. Event might have been wrongly deleted. Might be required for nextcloud.
                        con.query('UPDATE calendar_events SET ? WHERE url = ?',[{etag :calendarObjects[i].etag, data: calendarObjects[i].data, updated:  updated, type:type,deleted: "" }, calendarObjects[i].url], function (error, results, fields) {
                            if (error) {
                                console.log(error.message)
                            }
                
                        })
    
                    }
                    else
                    {
                    //No need to update. Skip

                    }
                }
                else
                {

                    con.query('UPDATE calendar_events SET ? WHERE url = ?',[{etag :calendarObjects[i].etag, data: calendarObjects[i].data, updated:  updated, type:type }, calendarObjects[i].url], function (error, results, fields) {
                        if (error) {
                            console.log(error.message)
                        }
            
                    })

                }
            }
            else
            {
                //Insert into DB.
    
                con.query('INSERT INTO calendar_events (url, etag, data, updated, calendar_id, type) VALUES (?,? ,?,?,?,?)', [calendarObjects[i].url, calendarObjects[i].etag, calendarObjects[i].data, updated, calendar_id, type], function (error, results, fields) {
                    if (error) {
                        console.log(error)
                    }
        
                });

            }
        }
        await syncEventsWithCaldlav(calendarObjects,calendar_id)
    }

    
    con.end()


}


export async function getCalendarEventbyURL(url,calendar_id)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM calendar_events WHERE url= ? AND calendar_id=?", [url, calendar_id], function (err, result, fields) {
            con.end()
            if (err) {
                console.log(err);
                return resolve(null)
            }
            return resolve(Object.values(JSON.parse(JSON.stringify(result))));

        })
    })

}

export async function getAllCalendarEvents()
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM calendar_events", [], function (err, result, fields) {
            con.end()
            if (err) {
                console.log(err);
                return resolve(null)
            }
            return resolve(Object.values(JSON.parse(JSON.stringify(result))));
    
        })
        })

}

export function checkifObjectisVTODO(data)
{
    var type=""
    try{
        const  parsedData = ical.parseICS(data);
        for (let k in parsedData) {
            // console.log("parse Success")
            return parsedData[k].type
        }
    
    }catch(e){
        //logError(e, data)
        // console.log("Parse error1", e, data)
    }

    // We fall back to other parse to get type.
    if(type=="")
    {
        const  parsedData = parseICSWithICALJS(data, "VTODO");
        // console.log("parse Success", parsedData)

        if(varNotEmpty(parsedData) && parsedData!={})
        {
            return "VTODO"
        }else{
            const  parsedDataTry2 = parseICSWithICALJS(data, "VEVENT");
            if(varNotEmpty(parsedDataTry2) && parsedDataTry2!={})
            {
                return "VEVENT"
            }else{
                return ""
            }
        }
    }
    
}

export async function createEventinCalDAVAccount(url, caldav_accounts_id, calendar, event)
{

    var caldav_account= await getCaldavAccountDetailsfromId(caldav_accounts_id)

    return new Promise( (resolve, reject) => {
        if(isValidCaldavAccount(caldav_account))
    {
         createDAVClient({
            serverUrl: caldav_account[0].url,
            credentials: {
                username: caldav_account[0].username,
                password: AES.decrypt(caldav_account[0].password,process.env.AES_PASSWORD).toString(CryptoJS.enc.Utf8)
            },
            authMethod: 'Basic',
            defaultAccountType: 'caldav',
        }).then((client) => {
            client.createCalendarObject({
                calendar: calendar,
                filename: url,
                iCalString: event,
              }).then((result =>{
                return resolve({result: result, client:client})
              }))

    
        }, (rejected) => {
            console.log(rejected)
            var statusText="Server error. Check Logs."
            if(varNotEmpty(rejected) && varNotEmpty(rejected.message))
            {
                statusText=rejected.message
            }

            return resolve({result: {status: 500, error:rejected, statusText:statusText}, client:null})
        })
    

    

    }

        
    })

}
export async function updateEventinCalDAVAccount(caldav_accounts_id,  event)
{
    var caldav_account= await getCaldavAccountDetailsfromId(caldav_accounts_id)

    return new Promise( (resolve, reject) => {
        if(isValidCaldavAccount(caldav_account))
        {
           createDAVClient({
                serverUrl: caldav_account[0].url,
                credentials: {
                    username: caldav_account[0].username,
                    password: AES.decrypt(caldav_account[0].password,process.env.AES_PASSWORD).toString(CryptoJS.enc.Utf8) 
                },
                authMethod: 'Basic',
                defaultAccountType: 'caldav',
            }).then((client) => {
               client.updateCalendarObject({
                    calendarObject: event,
                    headers:getBasicAuthHeaders({
                        username: caldav_account[0].username,
                        password: AES.decrypt(caldav_account[0].password,process.env.AES_PASSWORD).toString(CryptoJS.enc.Utf8) 
        
                    })
                  }).then(result =>{
                    return resolve({result: result, client: client})
                  })
    
    
        
            }, (rejected) => {
                console.error(rejected)
                var statusText="Server error. Check Logs."
                if(varNotEmpty(rejected) && varNotEmpty(rejected.message))
                {
                    statusText=rejected.message
                }
                return resolve({result: {status: 500, error:rejected, statusText:statusText}, client:null, })

            })
        
    
        
    
        }
        else
        {
            console.log('updateEventinCalDAVAccount: no caldav account.')
            return resolve(null)
        }
    
    })

}

export async function getCaldavClientFromAccountID(caldav_accounts_id)
{
    var client= null
    console.log("caldav_account", caldav_accounts_id, caldav_account)
   
    return client



}

export async function getCaldavClientBasic(url, username, password)
{
    return new Promise( (resolve, reject) => {

    })
}

