import * as moment from 'moment';

class VTodoGenerator{

    constructor(todoObject)
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
        var finalVTODO="BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Manage my Damn Life Tasks v0.1\n"
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
            finalVTODO +="RELATED-TO:"+this.relatedto+"\n"

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
        if(this.lastmodified!=null && this.lastmodified!="")
        {
            finalVTODO +="LAST-MODIFIED:"+this.getISO8601Date(this.lastmodified)+"\n"
        }
        if(this.start!=null && this.start!="")
        {
            finalVTODO +="START:"+this.getISO8601Date(this.start)+"\n"
        }

        if(this.class!=null && this.class!="" && this.class!=undefined)
        {
            finalVTODO +="CLASS:"+this.class+"\n"

        }

        if(this.geo!=null && this.geo!="" && this.geo!=undefined)
        {
            finalVTODO +="GEO:"+this.geo+"\n"

        }

        if(this.lastmod!=null && this.lastmod!="" && this.lastmod!=undefined)
        {
            finalVTODO +="LAST-MODIFIED:"+this.lastmod+"\n"

        }else{
            finalVTODO +="LAST-MODIFIED:"+dtstamp+"\n"

        }

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
            finalVTODO +="SEQUENCE:"+this.sequence+"\n"

        }

        
        
        
        finalVTODO +="END:VTODO\nEND:VCALENDAR"

        return finalVTODO
    }

    getISO8601Date(date)
    {
        var toReturn = ""
        if(date!=null)
        {
            var dueDateUnix= moment(date).unix()*1000;
            toReturn =  moment(dueDateUnix).format('YYYYMMDD');
            toReturn +=  "T"+moment(dueDateUnix).format('HHmmss');
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
        return id
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

}

export default VTodoGenerator