import { getRandomColourCode, isValidResultArray } from '@/helpers/general'
import { getConnectionVar, getSequelizeObj } from '../db'
import validator from 'validator';
import { calendars } from 'models/calendars';
import { calendar_events } from 'models/calendar_events';

const calendarsModel = calendars.initModel(getSequelizeObj())
const calendarEventsModel = calendar_events.initModel(getSequelizeObj())
export class Calendars{

    calendars_id: string | number
    constructor(calendarObject)
    {
        for (const key in calendarObject)
        {
             this[key] = calendarObject[key]
        }
 
    }

    async getAllEvents(type): Promise<calendar_events[]>
    {

        let whereStatement = {
            calendar_id: this.calendars_id,

        }
        if(type){
            whereStatement["type"] = type
        }
        return await calendarEventsModel.findAll({
            where: whereStatement
        });
        
        // var con = getConnectionVar()
        // var query="SELECT * FROM calendar_events WHERE calendar_id= ?"
        // if(type!=null && type!=undefined)
        // {
        //     query="SELECT * FROM calendar_events WHERE calendar_id= ? AND type=?"
        // }
        // return new Promise( (resolve, reject) => {
        //     con.query(query , [ this.calendars_id, type], function (err, result, fields) {
        //         con.end()
        //         if (err) {
        //             console.log("Calendars.getAllEvents: ",err) 
        //             return resolve(null)
        //         }
        //         var resultFromDB= Object.values(JSON.parse(JSON.stringify(result)))
        //         return resolve(resultFromDB)
        //     })
        // })

    }
    /**
     * 
     * @param {*} calendar Calendar object from tsdav or from database.
     * @returns True if no error. False otherwise.
     */
    static async updateCalendarinDB(calendar, calFromDB)
    {
        let displayName = typeof(calendar.displayName) == "string" ? calendar.displayName : validator.escape(calendar.displayName) 
        let url =  calendar.url.toString()
        let ctag = calendar.ctag.toString()
        let description = typeof(calendar.description) == "string" ? calendar.description : validator.escape(calendar.description).toString()
        let calendarColor = validator.isHexColor(calendar.calendarColor.toString()) ? calendar.calendarColor : ""
        //let syncToken = calendar.syncToken.toString() //Sync token update causes problems, as far as I know. skip update.
    
        let resourcetype = calendar.resourcetype.toString()
        const timezoneValidator = require('timezone-validator');
        let timezone =""
        try{
             timezone = timezoneValidator(calendar.timezone) ? calendar.timezone: ""
        }
        catch(e)
        {
            //Timezone is invalid.        
        }

        // if(calendarColor!=null && calendarColor!="")
        // {
        //     var setData={displayName: displayName, url:url, ctag: ctag, description: description, calendarColor: calendarColor, resourcetype:resourcetype, timezone:timezone, updated: updated }
        // }
        // else
        // {
        //     var setData={displayName: displayName, url:url, ctag: ctag, description: description,  resourcetype:resourcetype, timezone:timezone, updated: updated }
        // }

        let calendarColour = calendar["calendarColor"]
        if("calendarColor" in calendar && "calendarColor" in calFromDB){
            if(validator.isHexColor(calFromDB["calendarColor"]) && calFromDB["calendarColor"].trim()!=calendar["calendarColor"]){
                //Prefer user set colour from MMDL.
                calendarColour =calFromDB["calendarColor"]
            }

        }
        const updated=Math.floor(Date.now() / 1000)

        return calendarsModel.update(
            { displayName: displayName, url:url, ctag: ctag, description: description, calendarColor: calendarColor, resourcetype:resourcetype, timezone:timezone, updated: updated.toString() },
            {
              where: {
                url: calendar.url,
              },
            },
          );
        // return new Promise( (resolve, reject) => {
        //     con.query('UPDATE calendars SET ? WHERE url = ?',[{displayName: displayName, url:url, ctag: ctag, description: description, calendarColor: calendarColor, resourcetype:resourcetype, timezone:timezone, updated: updated }, calendar.url], function (error, results, fields) {
        //         if (error) {
        //             console.log("updateCalendarinDB: ",error.message)
        //             return resolve(false)
        //         }
        //         con.end()
        //         return resolve(true)
        //     })
        
        // })
    
    
    }

    /**
     * Deletes all events for the given database calendar object.
     * @param {*} calendar 
     * @returns Null.
     */
    static async deleteAllEvents(calendar)
    {
        if(calendar && ("calendars_id" in calendar) && calendar.calendars_id)
        {
            return calendarEventsModel.destroy({
                where: {
                    calendar_id: calendar.calendars_id,
                },
            });
            // var calendar_id=calendar.calendars_id
            // var con = getConnectionVar()
            // return new Promise( (resolve, reject) => {
            //     con.query('DELETE FROM calendar_events WHERE calendar_id=?', [calendar_id], function (error, results, fields) {
            //         if (error) {
            //             console.log(error)
            //         }                    
            //         con.end()
            //         return resolve(null)
            //         });    
            // })
    
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

        if(calendar && ("calendars_id" in calendar) && calendar.calendars_id)
        {
            return calendarsModel.destroy({
                where: {
                    calendars_id: calendar.calendars_id,
                },
            });

            // var calendar_id=calendar.calendars_id
            // var con = getConnectionVar()
            // return new Promise( (resolve, reject) => {
            //     con.query('DELETE FROM calendars WHERE calendars_id=?', [calendar_id], function (error, results, fields) {
            //         if (error) {
            //             console.log(error)
            //         }
            //         con.end()

            //         return resolve(null)
            //         });    
            // })
    
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
        return calendarsModel.findOne({
            where:{
                calendars_id: calendar_id
            }
        })
        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //     con.query("SELECT * FROM calendars WHERE calendars_id= ?", [ calendar_id], function (err, result, fields) {
        //         con.end()
        //         if (err) {
        //             console.log("getCalendarfromCalendarID: ",err) 
        //             return resolve(null)
        //         }
        //         var resultFromDB= Object.values(JSON.parse(JSON.stringify(result)))
        //         if(isValidResultArray(resultFromDB))
        //         {
        //             return resolve(resultFromDB[0]);
    
        //         }
    
        //     })
        // })
    
    }

    static async getIDFromURL(url)
    {
        const calendar =  await calendarsModel.findAll({
            where:{
                url: url
            },
            
        })
        if(calendar && Array.isArray(calendar) && calendar.length>0 && ("calendars_id" in calendar[0]) && calendar[0].calendars_id){
            return calendar[0].calendars_id
        }
        return null
    }
   
}