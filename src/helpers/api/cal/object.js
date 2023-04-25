import { isValidResultArray } from "@/helpers/general";
import { getConnectionVar } from "../db";


export async function getCalendarObjectsFromCalendar(calendar_id)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM calendar_events WHERE calendar_id=?", [calendar_id], function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            con.end()
            resolve(Object.values(JSON.parse(JSON.stringify(result))));

        })
    })

}
export async function syncEventsWithCaldlav(calDavCalendarObjects, calendar_id)
{
    // Will only delete events not present on CalDAV server.
    var con = getConnectionVar()

    var alLObjectsFromDB=  await getCalendarObjectsFromCalendar(calendar_id)

    if(alLObjectsFromDB!=null && Array.isArray(alLObjectsFromDB) && alLObjectsFromDB.length>0)
    {
        for(let i=0; i<alLObjectsFromDB.length; i++)
        {
            if(checkifEventExistsinCalDAVArray(alLObjectsFromDB[i], calDavCalendarObjects)==false)
            {
                //Set event to "deleted" in DB. This will enable user to later manually review items that need to be recovered.

                con.query('UPDATE calendar_events SET ? WHERE calendar_events_id = ?',[{deleted :"1" }, alLObjectsFromDB[i].calendar_events_id], function (error, results, fields) {
                    if (error) {
                        console.log(error)
                    }
        
                })



                

            }
        }
    } 
    
    con.end()

}

function checkifEventExistsinCalDAVArray(event, calDavCalendarObjects)
{
    var found = false
    if(isValidResultArray(calDavCalendarObjects))
    {
        for (const i in calDavCalendarObjects)
        {
            if(calDavCalendarObjects[i].url==event.url && calDavCalendarObjects[i].etag==event.etag )
            {
                found = true
            }

        }
    }

    return found
}
export async function deleteCalendarObjectsFromCalendarDB(calendar_id)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query('DELETE FROM calendar_events WHERE calendar_id=?', [calendar_id], function (error, results, fields) {
            if (error) {
                console.log(error)
            }
            con.end()
            });    
    })

}
export async function getCalendarObjectsFromCalendarbyType(calendar_id, filter)
{
    var query=""
    if(filter="todo")
    {
        query="SELECT * FROM calendar_events WHERE calendar_id=? AND type IN ('VTODO', 'VTIMEZONE')"
    }
    else
    {
        query="SELECT * FROM calendar_events WHERE calendar_id=?"
    }
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query(query, [calendar_id], function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            con.end()
            resolve(Object.values(JSON.parse(JSON.stringify(result))));

        })
    })

}

export function updateObjectinDB(url, etag, data, updated, type, calendar_id, deleted)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query('UPDATE calendar_events SET ? WHERE url=? AND calendar_id= ?',[{etag :etag, data: data, updated:  updated, type:type, deleted: deleted },url, calendar_id], function (error, results, fields) {
            con.end()
            
            if (error) {
            console.log(error.message)
            resolve(false)
        }
        resolve(true)

    })
    })
}

export async function getObjectFromDB(url, calendar_id)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM calendar_events WHERE calendar_id=? AND url=?", [calendar_id, url], function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            con.end()
            var resultFromDB = Object.values(JSON.parse(JSON.stringify(result)))
            if(isValidResultArray(resultFromDB))
            {
                resolve(resultFromDB[0])
            }
            else
            {
                resolve(null)
            }

        })
    })

}

export async function insertObjectIntoDB(url, etag, data, calendar_id, type)
{
    var objectfromDB= await getObjectFromDB(url, calendar_id)
    if(objectfromDB==null)
    {
        var con = getConnectionVar()
        var updated=Math.floor(Date.now() / 1000)
        return new Promise( (resolve, reject) => {
            con.query('INSERT INTO calendar_events (url, etag, data, updated, calendar_id, type) VALUES (?,? ,?,?,?,?)', [url, etag, data, updated, calendar_id, type], function (error, results, fields) {
                if (error) {
                    console.log("insertObjectIntoDB: ", error.message) 
                    resolve(false)
                }
    
                resolve(true)
        
            });
        
        })
    
    }

}

export async function deleteCalendarObjectsFromDB(url, calendar_id)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query('UPDATE calendar_events SET ? WHERE url=? AND calendar_id=?',[{deleted: "1" },url, calendar_id], function (error, results, fields) {
            con.end()
            
        if (error) {
        console.log(error.message)
        resolve(false)
        }   
        resolve(true)

    })
    })
}
