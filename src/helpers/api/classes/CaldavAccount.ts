import { getConnectionVar, getSequelizeObj } from "../db"
import validator from 'validator';
import { getRandomColourCode, isValidResultArray } from "@/helpers/general";
import { caldav_accounts } from "models/caldav_accounts";
import { calendars } from "models/calendars";
import { shouldLogforAPI } from "@/helpers/logs";
import { Calendars } from "./Calendars";

const calendarsModel = calendars.initModel(getSequelizeObj())
export class CaldavAccount{

    static calendarModel
    static caldav_accountsModel
    caldav_accounts_id: number | string

    constructor(caldavObject)
    {
       for (const key in caldavObject)
       {
            this[key] = caldavObject[key]
       }
       CaldavAccount.calendarModel = calendars.initModel(getSequelizeObj())
       CaldavAccount.caldav_accountsModel = caldav_accounts.initModel(getSequelizeObj())

    }

    /**
     * 
     * @param {*} calendar Calendar object from tsdav or from DB 
     * @param {*} caldav_accounts_id Caldav account ID from DB
     * @returns True if calendar exists
     */
    async calendarExists(calendar)
    {

        const resultfromDB = await CaldavAccount.calendarModel.findAll({
            where:{
                caldav_accounts_id: this.caldav_accounts_id.toString(),
                url: calendar.url,
                displayName: calendar.displayName.trim()
            }, 
            raw: true,
            nest: true,
        })
        // if(resultfromDB && Array.isArray(resultfromDB) && resultfromDB.length>0 ){
        //     return resultfromDB
        // }



        return resultfromDB

        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //     con.query("SELECT * FROM calendars WHERE caldav_accounts_id= ? AND url =? AND displayName =?", [ this.caldav_accounts_id, calendar.url,  calendar.displayName], function (err, result, fields) {
        //         con.end()
        //         if (err) {
        //             console.log(err);
        //             return resolve(null)
        //         }
        //         var toReturn = Object.values(JSON.parse(JSON.stringify(result)));
        //         if(toReturn!=null&&toReturn.length>=1)
        //         {
        //             return resolve(true)
        //         }
        //         else
        //         {
        //             return resolve(false)
        //         }
    
        //     })
        // })
    
    }

    /**
     * 
     * @param {*} calendar Calendar object from tsdav or from database.
     * @returns Error, if any.
     */
     async insertCalendar(calendar)
    {
        // let displayName = typeof(calendar.displayName) == "string" ? calendar.displayName : validator.escape(calendar.displayName) 
        // let url =  calendar.url.toString()
        // let ctag = calendar.ctag.toString()
        // let description = typeof(calendar.description) == "string" ? calendar.description : validator.escape(calendar.description).toString()
        // let calendarColor = validator.isHexColor(calendar.calendarColor.toString()) ? calendar.calendarColor : getRandomColourCode()
        // let syncToken = calendar.syncToken.toString()

        // let resourcetype = calendar.resourcetype.toString()
        // const timezoneValidator = require('timezone-validator');
        // let timezone =""
        // try{
        //     timezone = timezoneValidator(calendar.timezone) ? calendar.timezone: ""
        // }
        // catch(e)
        // {
        //     if(shouldLogforAPI()) console.log("insertCalendar timezone", e, calendar)
        // }
        return CaldavAccount.calendarModel.create({
            displayName:calendar.displayName, url:calendar.url, ctag: calendar.ctag, description:calendar.description, calendarColor:calendar.calendarColor, syncToken:calendar.syncToken, timezone:calendar.timezone, caldav_accounts_id:this.caldav_accounts_id, resourcetype:calendar.resourcetype
        })

        // con.query('INSERT INTO calendars (displayName, url, ctag, description, calendarColor, syncToken, timezone, caldav_accounts_id, resourcetype) VALUES (?,? ,?,?,? ,?,?,?,? )', [displayName, url, ctag,description,calendarColor, syncToken, timezone, this.caldav_accounts_id, resourcetype], function (error, results, fields) {
        //     if (error) {
        //         console.log(error)
        //         return error.message
        //     }
        //     con.end()
        //     });


    }

    /**
     * 
     * @returns Gets all calendar for an initialised instance of Caldav Acccount Object.
     */
    async getAllCalendars()
    {

        const resultfromDB = await CaldavAccount.caldav_accountsModel.findAll({
            where:{
                caldav_accounts_id: this.caldav_accounts_id,
            }, 
            raw: true,
            nest: true,
        })

        return resultfromDB

        


        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //     con.query("SELECT * FROM calendars WHERE caldav_accounts_id= ?", [ this.caldav_accounts_id], function (err, result, fields) {
        //         con.end()
        //         if (err) {
        //             console.log(err);
        //             return resolve(null)
        //         }
        //         return resolve(Object.values(JSON.parse(JSON.stringify(result))));
    
        //     })
        // })
    
    }

    async delete()
    {
        await CaldavAccount.caldav_accountsModel.destroy({
            where: {
                caldav_accounts_id: this.caldav_accounts_id,
            },
        });
        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //     con.query('DELETE FROM caldav_accounts WHERE caldav_accounts_id=?', [this.caldav_accounts_id], function (error, results, fields) {
        //         con.end()
        //         if (error) {
        //             return resolve(error.message)
        //         }

        //         return resolve(null)
        //         });    
        // })

    }
    /**
     * Gets CalDAV account from ID.
     */
    static async getFromID(caldav_accounts_id)
    {

        const resultfromDB = await CaldavAccount.caldav_accountsModel.findAll({
            where:{
                caldav_accounts_id: caldav_accounts_id,
            }, 
            raw: true,
            nest: true,
        })

        return resultfromDB

        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //     con.query("SELECT * FROM caldav_accounts WHERE caldav_accounts_id= ?", [ caldav_accounts_id], function (err, result, fields) {
        //         con.end()
        //         if (err) {
        //             console.log(err);
        //             return resolve(null)
        //         }
        //         return resolve(Object.values(JSON.parse(JSON.stringify(result))));
    
        //     })
        // }) 

    }

    static async getIDFromCalendar(calendarObject)
    {

        const resultfromDB = await CaldavAccount.calendarModel.findAll({
            where:{
                calendars_id: calendarObject.calendars_id,
            }, 
            raw: true,
            nest: true,
        })

        if(resultfromDB && Array.isArray(resultfromDB) && resultfromDB.length>0){
            return resultfromDB[0]["caldav_accounts_id"]
        }

        return null
        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //     con.query("SELECT * FROM calendars WHERE calendars_id=?", [calendarObject.calendars_id], function (err, result, fields) {
        //         con.end()
        //         if (err) {
        //             console.log(err);
        //             return resolve(null)
        //         }                
        //         var resultFromDB= Object.values(JSON.parse(JSON.stringify(result)))
        //         if(isValidResultArray(resultFromDB))
        //         {
        //             return resolve(resultFromDB[0].caldav_accounts_id);
    
        //         }else
        //         {
        //             return resolve(null)
        //         }
        
        //     })
        //     })
    
    }

    static async checkIfCalendarURLinCaldavAccount_GetID(caldav_accounts_id, url){
        const calendar_id = await Calendars.getIDFromURL(url)
        // console.log("calendar_id", calendar_id)
        if(!calendar_id) return ""
        const calendar = await calendarsModel.findAll({
            where:{
                caldav_accounts_id:caldav_accounts_id.toString(),
                calendars_id:calendar_id
            },
        })
        // console.log("calendar", calendar)

        if(calendar && Array.isArray(calendar) && calendar.length>0)
        {
            return calendar_id
        }
        
        return ""
    }


}