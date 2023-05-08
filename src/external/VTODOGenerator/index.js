import { varNotEmpty } from '@/helpers/general';
import * as moment from 'moment';

class VTodoGenerator{

    constructor(todoObject, skipVCALENDAR=false)
    {
        if(todoObject!=null && Object.keys(todoObject).length>0)
        {
            for(const key in todoObject)
            {
                this[key]=todoObject[key]
            }
        }else{
            throw new Error("No valid task object provided.")
        }
        this.oldData= null
        this.skipVCALENDAR = skipVCALENDAR
    }

    generate()
    {
        var dtstamp=""
        if(this.dtstamp!=null && this.dtstamp!="")
        {
            dtstamp=this.getISO8601Date(this.dtstamp)
        }
        else
        {
            dtstamp = this.getISO8601Date(moment().unix()*1000)

        }
        var categories=""
        var uid= ""
        if(this.uid!=null&&this.uid!="")
        {
            uid=this.uid
        }
        else
        {
            uid=this.generateNewUID()
        }
        if(this.categories!=null && Array.isArray(this.categories) && this.categories.length>0)
        {
            for (const i in this.categories)
            {
                if(i!=(this.categories.length-1))
                {
                    categories+= this.categories[i]+","

                }
                else{
                    categories+= this.categories[i]

                }
            }
        }
        var finalVTODO=""
        if(this.skipVCALENDAR==null || this.skipVCALENDAR==undefined || this.skipVCALENDAR==false)
        {
            finalVTODO+="BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Manage my Damn Life Tasks v0.1\n"

        }
        finalVTODO +="BEGIN:VTODO\nUID:"+uid+"\n"
        finalVTODO +="DTSTAMP:"+dtstamp+"\n"

        if(this.created!=null && this.created!="")
        {
            finalVTODO +="CREATED:"+this.getISO8601Date(this.created)+"\n"
        }  

        if(this.summary!=null && this.summary!=""){
       
            finalVTODO +="SUMMARY:"+this.summary+"\n"
        }  
    
        if(this.due!=null && this.due!="")
        {
            finalVTODO +="DUE:"+this.getISO8601Date(this.due)+"\n" 
        }


        if(this.completed!=null && this.completed!="")
        {
            finalVTODO += "COMPLETED:"+this.getISO8601Date(moment().unix()*1000)+"\n"

            // The task is completed, so we set the STATUS as COMPLETED.
            // This is required for apps like JTX Boards to recognize that the task has been completed.
            finalVTODO += "STATUS:COMPLETED\n" 

            //finalVTODO +="PERCENT-COMPLETE: 100\n" 
            if(this.completion!=null && this.completion!="")
            {
                finalVTODO +="PERCENT-COMPLETE:"+this.completion+"\n" 
            }

        }else{
            if(this.status!=null&&this.status!=""&& this.statusIsValid(this.status)){
                finalVTODO +="STATUS:"+this.status+"\n" 
    
            }
    
            if(this.completion!=null && this.completion!="")
            {
                finalVTODO +="PERCENT-COMPLETE:"+this.completion+"\n" 
            }
            else
            {
                finalVTODO +="PERCENT-COMPLETE:0\n" 

            }
        }
        if(categories!=null && categories!="")
        {
            finalVTODO += "CATEGORIES:"+categories+"\n"

        }
        if(this.relatedto!=null && this.relatedto!="")
        {
            if(typeof(this.relatedto)=="string")
            {
                finalVTODO +="RELATED-TO:"+this.relatedto+"\n"
            }else
            {
                if(Array.isArray(this.relatedto) )
                {
                    for(const i in this.relatedto)
                    {
                        if(varNotEmpty(this.relatedto[i].params) && varNotEmpty(this.relatedto[i].params.RELTYPE) && varNotEmpty(this.relatedto[i].val)){
                            var relatedOutput="RELATED-TO;RELTYPE="+this.relatedto[i].params.RELTYPE.toString().toUpperCase()+":"+this.relatedto[i].val+"\n"
                            finalVTODO+=relatedOutput
    
                        }
                    }
                }else{
                    var relatedOutput="RELATED-TO;RELTYPE="+this.relatedto.params.RELTYPE.toString().toUpperCase()+":"+this.relatedto.val+"\n"
                    finalVTODO+=relatedOutput
                }
            }

        }
        if(this.priority!=null && this.priority!="")
        {
            finalVTODO +="PRIORITY:"+this.priority+"\n"

        }

        if(this.description!=null && this.description!="")
        {
            var description=this.description.replace(/(?:\r\n|\r|\n)/g, '\\n');
  
            finalVTODO +="DESCRIPTION:"+description+"\n"

        }
        if(this.start!=null && this.start!="")
        {
            finalVTODO +="DTSTART:"+this.getISO8601Date(this.start)+"\n"

        }

        if(this.class!=null && this.class!="" && this.class!=undefined)
        {
            finalVTODO +="CLASS:"+this.class+"\n"

        }

        if(this.geo!=null && this.geo!="" && this.geo!=undefined)
        {
            finalVTODO +="GEO:"+this.geo+"\n"

        }

        /*
        if(this.lastmod!=null && this.lastmod!="" && this.lastmod!=undefined)
        {
            finalVTODO +="LAST-MODIFIED:"+this.lastmod+"\n"

        }else{
            finalVTODO +="LAST-MODIFIED:"+dtstamp+"\n"

        }
        */
        finalVTODO +="LAST-MODIFIED:"+this.getISO8601Date(Date.now())+"\n"
        

        if(this.location!=null && this.location!="" && this.location!=undefined)
        {
            finalVTODO +="LOCATION:"+this.location+"\n"

        }
        if(this.organizer!=null && this.organizer!="" && this.organizer!=undefined)
        {
            finalVTODO +="ORGANIZER:"+this.organizer+"\n"

        }

        if(this.sequence!=null && this.sequence!="" && this.sequence!=undefined)
        {
            finalVTODO +="SEQUENCE:"+parseInt(this.sequence)+1+"\n"

        }

        if(this.resources!=null && this.resources!="" && Array.isArray(this.resources) && this.resources.length>0)
        {
            var resourcesOutput="RESOURCES:"

            for(const i in this.resources)
            {
                if(i!=0)
                {
                    resourcesOutput+=","
                }
                resourcesOutput+=this.resources[i]
            }
            finalVTODO +=resourcesOutput+"\n"


        }
        if(this.rrule!=null && this.rrule!="" && this.rrule["FREQ"]!="" && this.rrule["FREQ"]!=null && this.rrule["INTERVAL"]!="" && this.rrule.INTERVAL!="" )
        {

            var rruleOutput="RRULE:FREQ="+this.rrule.FREQ+";INTERVAL="+this.rrule.INTERVAL+";"

            if(this.rrule.COUNT!=null && this.rrule.COUNT!="")
            {
                rruleOutput+="COUNT="+this.rrule.COUNT+";"
            }

            if(this.rrule.UNTIL!="" && this.rrule.UNTIL!=null)
            {
                rruleOutput+="UNTIL="+this.getISO8601Date(this.rrule.UNTIL, true)+";"

            }
            finalVTODO +=rruleOutput+"\n"

        }

        /*

        // Adding attendee info as of now breaks calendar (not the todo, but the entire calendar in Nextcloud client for some reason.)
        // Another reason for skipping is that RFC5545 mentions that attendee must not be included in a todo, but rather in a group calendar object (Section 3.8.4.1).


        if(this.attendee!="" && this.attendee!=null && Array.isArray(this.attendee))
        {
            var attendeeOutput ="ATTENDEE"
            
            for (const i in this.attendee)
            {
                if(i.toUpperCase()!="ROLE")
                {
                    attendeeOutput+=i.toString().toUpperCase()+"="+this.attendee[i]+";"

                }
            }

            finalVTODO +=attendeeOutput+":\n"

        }
        */
        if(this.url!="" && this.url!=null)
        {
            finalVTODO +="URL:"+this.url+"\n"
        }
        if(this.recurrenceid!="" && this.recurrenceid!=null)
        {
            finalVTODO +="RECURRENCE-ID:"+this.getISO8601Date(this.recurrenceid)+"\n"
        }


        finalVTODO +="END:VTODO\n"
        if(this.recurrences!=null)
        {
           
            for(const i in this.recurrences)
            {
                //console.log(this.recurrences[i])
                var newVTODO = new VTodoGenerator(this.recurrences[i], true)
                finalVTODO += newVTODO.generate()
            }
           

        }

        if(this.skipVCALENDAR==null || this.skipVCALENDAR==undefined || this.skipVCALENDAR==false)
        {
            finalVTODO+="END:VCALENDAR\n"

        }


        return finalVTODO
    }

    getISO8601Date(date, skipTime)
    {
        var toReturn = ""
        if(date!=null)
        {
            var dueDateUnix= moment(date).unix()*1000;
            toReturn =  moment(dueDateUnix).format('YYYYMMDD');
            if(skipTime==null || skipTime!="null" && skipTime==false)
            {
                toReturn +=  "T"+moment(dueDateUnix).format('HHmmss');

            }
        }
        else{
            return null
        }
        return toReturn
    }
    generateNewUID()
    {
        var crypto = require("crypto");
        var id = crypto.randomBytes(32).toString('hex');
        return id+"@intri"
    }

    static getValidStatusValues()
    {
       var validvalues=[ "NEEDS-ACTION", "COMPLETED", "IN-PROCESS", "CANCELLED"]

       return validvalues
    }

    statusIsValid(status)
    {
        var validStatuses = this.constructor.getValidStatusValues()
        var found = false
        for (let i=0; i<validStatuses.length; i++)
        {
            if(validStatuses[i]==status)
            {
                return true
            }
        }

        return found

    }

    setOldData(oldData)
    {
        this.oldData = oldData

    }

}

export default VTodoGenerator