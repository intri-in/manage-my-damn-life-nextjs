import { isValidResultArray, logError, varNotEmpty } from "@/helpers/general"
import { getConnectionVar } from "../db"
import { isValid } from "js-base64"
import { CaldavAccount } from "./CaldavAccount"
import { User } from "./User"

export class Events{

    
    constructor(eventObject)
    {
        for (const key in eventObject)
        {
             this[key] = eventObject[key]
        }
 
    }

    async userHasAccess()
    {
        var toReturn = false
        var calendarofEvent = await this.getCalendarID()
        if(varNotEmpty(calendarofEvent))
        {
            var caldavAccountID = await CaldavAccount.getIDFromCalendar({calendars_id: calendarofEvent})

            if(varNotEmpty(caldavAccountID))
            {
                var userObject = new User(this.userid)

                return await userObject.hasAccesstoCaldavAccountID(caldavAccountID)
            }
        }

       return toReturn
    }

    getCalendarID()
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT calendar_id FROM calendar_events WHERE calendar_events_id= ?", [ this.calendar_events_id], function (err, result, fields) {
                con.end()
                if (err) {
                    logError(err, "Events.getMeta") 
                    resolve(null)
                }
                var resultFromDB= Object.values(JSON.parse(JSON.stringify(result)))
                
                if(isValidResultArray(resultFromDB))
                {
                    resolve(resultFromDB[0]["calendar_id"])
                }else{
                    resolve(null)
                }

                
            })

        })
    }

}