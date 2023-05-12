import { getConnectionVar } from "../db"
import validator from 'validator';
import { getRandomColourCode, isValidResultArray } from "@/helpers/general";

export class CaldavAccount{
    
    constructor(caldavObject)
    {
       for (const key in caldavObject)
       {
            this[key] = caldavObject[key]
       }
    }

    /**
     * 
     * @param {*} calendar Calendar object from tsdav or from DB 
     * @param {*} caldav_accounts_id Caldav account ID from DB
     * @returns True if calendar exists
     */
    calendarExists(calendar)
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT * FROM calendars WHERE caldav_accounts_id= ? AND url =? AND displayName =?", [ this.caldav_accounts_id, calendar.url,  calendar.displayName], function (err, result, fields) {
                con.end()
                if (err) {
                    console.log(err);
                    return resolve(null)
                }
                var toReturn = Object.values(JSON.parse(JSON.stringify(result)));
                if(toReturn!=null&&toReturn.length>=1)
                {
                    return resolve(true)
                }
                else
                {
                    return resolve(false)
                }
    
            })
        })
    
    }

    /**
     * 
     * @param {*} calendar Calendar object from tsdav or from database.
     * @returns Error, if any.
     */
     async insertCalendar(calendar)
    {
        var con = getConnectionVar()
        var displayName = typeof(calendar.displayName) == String ? calendar.displayName : validator.escape(calendar.displayName) 
        var url =  calendar.url.toString()
        var ctag = calendar.ctag.toString()
        var description = typeof(calendar.description) == String ? calendar.description : validator.escape(calendar.description).toString()
        var calendarColor = validator.isHexColor(calendar.calendarColor.toString()) ? calendar.calendarColor : getRandomColourCode()
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
        

        con.query('INSERT INTO calendars (displayName, url, ctag, description, calendarColor, syncToken, timezone, caldav_accounts_id, resourcetype) VALUES (?,? ,?,?,? ,?,?,?,? )', [displayName, url, ctag,description,calendarColor, syncToken, timezone, this.caldav_accounts_id, resourcetype], function (error, results, fields) {
            if (error) {
                console.log(error)
                return error.message
            }
            con.end()
            });


    }

    /**
     * 
     * @returns Gets all calendar for an initialised instance of Caldav Acccount Object.
     */
    async getAllCalendars()
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT * FROM calendars WHERE caldav_accounts_id= ?", [ this.caldav_accounts_id], function (err, result, fields) {
                con.end()
                if (err) {
                    console.log(err);
                    return resolve(null)
                }
                return resolve(Object.values(JSON.parse(JSON.stringify(result))));
    
            })
        })
    
    }

    async delete()
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query('DELETE FROM caldav_accounts WHERE caldav_accounts_id=?', [this.caldav_accounts_id], function (error, results, fields) {
                con.end()
                if (error) {
                    return resolve(error.message)
                }

                return resolve(null)
                });    
        })

    }
    /**
     * Gets CalDAV account from ID.
     */
    static async getFromID(caldav_accounts_id)
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT * FROM caldav_accounts WHERE caldav_accounts_id= ?", [ caldav_accounts_id], function (err, result, fields) {
                con.end()
                if (err) {
                    console.log(err);
                    return resolve(null)
                }
                return resolve(Object.values(JSON.parse(JSON.stringify(result))));
    
            })
        }) 

    }

    static async getIDFromCalendar(calendarObject)
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT * FROM calendars WHERE calendars_id=?", [calendarObject.calendars_id], function (err, result, fields) {
                con.end()
                if (err) {
                    console.log(err);
                    return resolve(null)
                }                
                var resultFromDB= Object.values(JSON.parse(JSON.stringify(result)))
                if(isValidResultArray(resultFromDB))
                {
                    return resolve(resultFromDB[0].caldav_accounts_id);
    
                }else
                {
                    return resolve(null)
                }
        
            })
            })
    
    }


}