import { getRandomColourCode, isValidResultArray } from '@/helpers/general'
import { getConnectionVar } from '../db'
import validator from 'validator';

export class Calendars{

    /**
     * 
     * @param {*} calendar Calendar object from tsdav or from database.
     * @returns True if no error. False otherwise.
     */
    static async updateCalendarinDB(calendar)
    {
        var con = getConnectionVar()
        var displayName = typeof(calendar.displayName) == String ? calendar.displayName : validator.escape(calendar.displayName) 
        var url =  calendar.url.toString()
        var ctag = calendar.ctag.toString()
        var description = typeof(calendar.description) == String ? calendar.description : validator.escape(calendar.description).toString()
        var calendarColor = validator.isHexColor(calendar.calendarColor.toString()) ? calendar.calendarColor : ""
        //var syncToken = calendar.syncToken.toString() //Sync token update causes problems, as far as I know. skip update.
    
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

        if(calendarColor!=null && calendarColor!="")
        {
            var setData={displayName: displayName, url:url, ctag: ctag, description: description, calendarColor: calendarColor, resourcetype:resourcetype, timezone:timezone, updated: updated }
        }
        else
        {
            var setData={displayName: displayName, url:url, ctag: ctag, description: description,  resourcetype:resourcetype, timezone:timezone, updated: updated }
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

    /**
     * Deletes all events for the given database calendar object.
     * @param {*} calendar 
     * @returns Null.
     */
    static async deleteAllEvents(calendar)
    {
        if(calendar!=null && calendar.calendars_id!=null)
        {
            var calendar_id=calendar.calendars_id
            var con = getConnectionVar()
            return new Promise( (resolve, reject) => {
                con.query('DELETE FROM calendar_events WHERE calendar_id=?', [calendar_id], function (error, results, fields) {
                    if (error) {
                        throw error.message
                    }
                    con.end()
                    resolve(null)
                    });    
            })
    
        }
        else
        {
            console.log("Invalid Calendar DB Object", calendar)
            throw new Error("Invalid Calendar DB Object.")
        }
    
    
    }

    /**
     * Deletes the given calendar from DB.
     * @param {*} calendar 
     * @returns 
     */
    static async deleteCalendar(calendar)
    {

        if(calendar!=null && calendar.calendars_id!=null)
        {
            var calendar_id=calendar.calendars_id
            var con = getConnectionVar()
            return new Promise( (resolve, reject) => {
                con.query('DELETE FROM calendars WHERE calendars_id=?', [calendar_id], function (error, results, fields) {
                    if (error) {
                        throw error.message
                    }
                    con.end()

                    resolve(null)
                    });    
            })
    
        }
        else
        {
            console.log("Invalid Calendar DB Object", calendar)

            throw new Error("Invalid Calendar DB Object.")
        }

    }

    /**
     * Gets requested calendar object from database.
     * @param {*} calendars_id Calendar ID from database 
     */
    static async getFromID(calendar_id)
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
   
}