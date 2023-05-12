import { isValidResultArray, logError } from "@/helpers/general";
import { getConnectionVar } from "../db";
import { Events } from "./Events";

export default class EventMeta extends Events {

    constructor(metaObject)
    {
        for (const key in metaObject)
        {
             if(key=="calendar_events_id")
             {
                super({calendar_events_id: metaObject[key]})
             }

             this[key] = metaObject[key]

        }

    }

    async getAll()
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT * FROM calendar_events_meta WHERE calendar_events_meta_id= ?", [ this.calendar_events_id], function (err, result, fields) {
                con.end()
                if (err) {
                    logError(err, "Events.getMeta") 
                    return resolve(null)
                }
                var resultFromDB= Object.values(JSON.parse(JSON.stringify(result)))
                return resolve(resultFromDB[0]);

                
            })
        })

    }

    async get()
    {
        var con = getConnectionVar()

        return new Promise( (resolve, reject) => {
            con.query("SELECT value FROM calendar_events_meta WHERE calendar_events_id= ? AND property=? ", [ this.calendar_events_id, this.property], function (err, result, fields) {
                con.end()
                if (err) {
                    logError(err, "Events.getMeta") 
                    return resolve(null)
                }
                var resultFromDB= Object.values(JSON.parse(JSON.stringify(result)))
                if(isValidResultArray(resultFromDB) && resultFromDB.length>0)
                {
                    return resolve(resultFromDB[resultFromDB.length-1]["value"]);

                }else{
                    return resolve(null)
                }

                
            })
        })
    }

    async insert()
    {
        var con = getConnectionVar()
        var created = Math.floor(Date.now()/1000)
        //Check if it exists in DB already.

        
        const metaInDB = await this.get()
        
        if(metaInDB==null)
        {
            return new Promise( (resolve, reject) => {


                con.query('INSERT INTO calendar_events_meta (property, value, userid, created, calendar_events_id) VALUES (?,? ,?,?,?)', [this.property, this.value, this.userid, created, this.calendar_events_id], function (error, results, fields) {
                    if (error) {
                        logError(error,"EventMeta.insertEventMeta")
                    }
                    con.end()
                    return resolve(results)
                    });
            
            })
    
        }else{
            //Make an update request.
            
            return new Promise( (resolve, reject) => {
                con.query('UPDATE calendar_events_meta SET ? WHERE property = ? AND calendar_events_id = ?',[{ created: created, value: this.value }, this.property, this.calendar_events_id], function (error, results, fields) {
                    if (error) {
                        console.log("updateCalendarinDB: ",error.message)
                        return resolve(false)
                    }
                    con.end()
                    return resolve(true)
                })
            
            })
        
        }
    
    }


}