import validator from 'validator';

/**
 * Takes in one calendar returned from CalDAV server and processes it to be sent back to the user. 
 * @param calendar Processed calendar ready to be inserted into database.
 */
export function processCalendarFromCaldav(calendar){
 
    var calendartoReturn = {
        displayName:"",
        url:"",
        ctag:"",
        description:"",
        calendarColor:"",
        syncToken:"",
        resourcetype:"",
        timezone:""

    }
    if(calendar){
        calendartoReturn.displayName = typeof(calendar.displayName) == "string" ? calendar.displayName : validator.escape(calendar.displayName) 
        calendartoReturn.url =  calendar.url.toString()
        calendartoReturn.ctag = calendar.ctag.toString()
        calendartoReturn.description = typeof(calendar.description) == "string" ? calendar.description : validator.escape(calendar.description).toString()
        calendartoReturn.calendarColor = validator.isHexColor(calendar.calendarColor.toString()) ? calendar.calendarColor : ""
        calendartoReturn.syncToken = calendar.syncToken.toString()
        calendartoReturn.resourcetype = calendar.resourcetype.toString()
        const timezoneValidator = require('timezone-validator');
        try{
            calendartoReturn.timezone = timezoneValidator(calendar.timezone) ? calendar.timezone: ""
        }
        catch(e)
        {
            //Timezone is invalid.        
        }
        
        return calendartoReturn

    }
}
/**
 * Post authentication, this function saves CalDAV account to database. As of now, we save it on the server side.
 */
export function saveCaldavAccounttoDB()
{

}



