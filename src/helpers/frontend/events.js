import { isValidResultArray, varNotEmpty } from "../general"
import { arrangeTodoListbyHierarchy, getParsedTodoList, getUnparsedEventData, returnGetParsedVTODO } from "./calendar"
import { dueDatetoUnixStamp, getI18nObject, ISODatetoHuman, ISODatetoHumanISO } from "./general"
import ical from '@/../ical/ical'
import { applyEventFilter } from "./filters"
import moment from "moment"
import { getAuthenticationHeadersforUser } from "./user"

export async function getEvents(calendarEvents, filter)
{
    var filteredEvents= calendarEvents
    if(filter!=null && filter.filter!=null && Object.keys(filter.filter).length>0)
    {
        filteredEvents = filterEvents(calendarEvents, filter)
    }
    var unparsedData= getUnparsedEventData(calendarEvents)
    var listofTodos= arrangeTodoListbyHierarchy(filteredEvents, filter, calendarEvents )

    return [listofTodos, getParsedTodoList(calendarEvents), unparsedData]

}

function filterEvents(calendarEvents, filter)
{
    var finalArray=[]
    if(calendarEvents!=null && Array.isArray(calendarEvents) && calendarEvents.length>0)
    {
        for(let i=0; i<calendarEvents.length; i++)
        {
            var todo = returnGetParsedVTODO(calendarEvents[i].data)

            if(applyTaskFilter(todo, filter)==true && (calendarEvents[i].deleted==null || calendarEvents[i].deleted==""))
            {
                finalArray.push(calendarEvents[i])
            }
        }
    
    }
    return finalArray
}

export function majorTaskFilter(todo)
{
    var todoStatusOK = true
    if(todo.status !=null && todo.status=="COMPLETED")
    {
        todoStatusOK=false
    }
    if((todo.completed==null || todo.completed=="")&& todo.completion!="100"&&todo.summary!=null && todo.summary!=undefined && (todo.deleted == null || todo.deleted == "") && todoStatusOK)
    {
        
        return true
    }
    else{
        return false
    }
}

function checkifEventisAlreadyinFilteredList(calendarEvents, filteredList)
{
    if(isValidResultArray(filteredList))
    {
       // for (const i in )
    }
}
export function applyTaskFilter(todo,filter)
{

    return applyEventFilter(todo, filter)
    /*
    var toReturn = true
    if(filter!=null && filter.filter!=null)
    {
        var filterByLabelResult = true
        if(filter.filter.label!=null && filterbyLabel(filter.filter.label, todo.category)==false)
        {
            filterByLabelResult= false
            if(filter.filter.due==null&&filter.filter.priority==null)
            {
                return filterByLabelResult
            }
        }
        var filterByDueResult= true
        if(filter.filter.due!=null && filterbyDue(filter.filter.due, todo.due)==false)
        {
            filterByDueResult = false
            if(filter.filter.label==null&&filter.filter.priority==null)
            {
                return filterByDueResult
            }
        }


        var filterbyPriorityResult =true

        if(filter.filter.priority!=null && filterbyPriority(filter.filter.priority,todo.priority)==false)
        {
            filterbyPriorityResult=false
            if(filter.filter.label==null&&filter.filter.due==null)
            {
                return filterbyPriorityResult
            }
        }

        
        if(filter.logic!=null)
        {
            if(filter.logic=="or")
            {
                if(filterByDueResult==true || filterByLabelResult==true || filterbyPriorityResult==true)
                {
                    return true
                }
                else
                {
                    return false
                }
            }else{
                if(filterByDueResult==true && filterByLabelResult==true && filterbyPriorityResult==true)
                {
                    return true
                }
                else
                {
                    return false
                }
            }
        }

    }
    else
    {
        return true
    }
    return toReturn

    */
}

function filterbyLabel(filterArray, categoryArray)
{
    var toReturn = false
    if(filterArray!=null && filterArray.length>0 )
    {
        if(categoryArray!=null )
        {
            for (let j=0; j<categoryArray.length; j++)
            {
                 
                for (let i=0; i<filterArray.length; i++)
                {
                    if(filterArray[i].trim()==categoryArray[j].trim())
                    {
                        return true
                    }
                    
                }
            }
        }
        else
        {
            return false
        }        
        
    }


    return toReturn
}

function filterbyDue(filterdueArray, dueDate)
{
    var toReturn = false
    if(filterdueArray!=null && filterdueArray.length==2)
    {
        if(dueDate!=null && dueDate!="")
        {
            var dueUnixStamp= dueDatetoUnixStamp(ISODatetoHuman(dueDate))
            if(dueUnixStamp>=filterdueArray[0] && dueUnixStamp <= filterdueArray[1])
            {
                return true
            }
        }
        else
        {
            return false
        }        
        
    }


    return toReturn

}

function filterbyPriority(priorityFilter, priority)
{
    var toReturn = false
    if(priorityFilter!=null)
    {
        if(priority!=null && priority<priorityFilter)
        {
                return true
           
        }
        else
        {
            return false
        }        
        
    }


    return toReturn

}

export function getParsedEvent(data)
{
    var data= ical.parseICS(data)

    if(data!=null )
    {
        for(const key in data)
        {
            if(data[key].type=="VEVENT")
            {
                return data[key]
            }
        }
    }

}

export function isAllDayEvent(start, end)
{
    var dateStart = moment(start).unix()
    var dateend = moment(end).unix()
    var allDay=false
    if(dateend-dateStart ==86400)
    {
        allDay= true
    }

    return allDay

}

export function rruleToObject(rrule)
{
    var objectToReturn = {"FREQ": "", "INTERVAL":"", "UNTIL":""}
    if(varNotEmpty(rrule))
    {
        var burst = rrule.split(';')

        if(varNotEmpty(burst) && Array.isArray(burst))
        {
            for(const i in burst)
            {
                if(burst[i].startsWith("FREQ="))
                {
                    var freq = burst[i].split('=')[1]
                    objectToReturn["FREQ"]=freq
                }

                if(burst[i].startsWith("INTERVAL="))
                {
                    var interval = burst[i].split('=')[1]
                    objectToReturn["INTERVAL"]=interval

                }
                if(burst[i].startsWith("UNTIL="))
                {
                    var interval = burst[i].split('=')[1]
                    objectToReturn["UNTIL"]=interval

                }

            }
        }
    }

    if(objectToReturn["INTERVAL"]=="" && objectToReturn["FREQ"]!="" )
    {
        objectToReturn["INTERVAL"]=1
    }
    return objectToReturn

}

export function rruleObjecttoWords(rrule)
{
    var words = ""
    var i18next = getI18nObject()
    if(varNotEmpty(rrule))
    {
        if(rrule["FREQ"]!="")
        {
            if(rrule["INTERVAL"]=="1" || rrule["INTERVAL"]=="" || rrule["INTERVAL"]==1 )
            {
                if(rrule["FREQ"]=="DAILY")
                {
                    words+=i18next.t("EVERY")+" "+i18next.t("DAY").toLowerCase()
                }

                if(rrule["FREQ"]=="WEELY")
                {
                    words+=i18next.t("EVERY")+" "+i18next.t("WEEK").toLowerCase()

                }

                if(rrule["FREQ"]=="MONTHLY")
                {
                    words+=i18next.t("EVERY")+" "+i18next.t("MONTH").toLowerCase()

                }

            }else{
                if(rrule["FREQ"]=="DAILY")
                {
                    words+=i18next.t("EVERY")+" "+rrule["INTERVAL"]+" "+i18next.t("DAYS").toLowerCase()
                }

                if(rrule["FREQ"]=="WEEKLY")
                {
                    words+=i18next.t("EVERY")+" "+rrule["INTERVAL"]+" "+i18next.t("WEEKS").toLowerCase()

                }

                if(rrule["FREQ"]=="MONTHLY")
                {
                    words+=i18next.t("EVERY")+" "+rrule["INTERVAL"]+" "+i18next.t("MONTHS").toLowerCase()

                }
            }
        }

        if(rrule["UNTIL"]!="")
        {
            words+=" "+i18next.t("UNTIL").toLowerCase()+" "+ new Date(moment(rrule["UNTIL"]))
        }

    }
    return words
}

export function rruleObjectToString(rrule)
{
    var toReturn =""
    if(varNotEmpty(rrule) && rrule["FREQ"]!=""){
        for (const key in rrule)
        {
            if(varNotEmpty(rrule[key])&&rrule[key]!="")
            {
                if(key=="UNTIL")
                {
                    toReturn+=key+"="+moment(rrule[key]).toISOString()+";"

                }else
                {
                    toReturn+=key+"="+rrule[key]+";"

                }

            }
        }
    }

    return toReturn
}

export function getEmptyRecurrenceObject()
{
    var toReturn =  {"FREQ": "", "UNTIL": "", "INTERVAL": ""}

    return toReturn
}
export function rrule_DataToFormData(rrule)
{
    var toReturn = {"FREQ": "", "UNTIL": "", "INTERVAL": ""}
    
    toReturn["UNTIL"] = ISODatetoHuman(rrule["UNTIL"])
    if(rrule["FREQ"]=="DAILY"){
        toReturn["FREQ"] = "DAYS"

    }

    if(rrule["FREQ"]=="WEEKLY"){
        toReturn["FREQ"] = "WEEKS"

    }
    if(rrule["FREQ"]=="MONTHLY"){
        toReturn["FREQ"] = "MONTHS"

    }
    toReturn["INTERVAL"] = rrule["INTERVAL"]
    
    return toReturn

}

export function reccurence_torrule(formDataRRule)
{
    var toReturn = {"FREQ": "", "UNTIL": "", "INTERVAL": ""}
    toReturn["UNTIL"] = formDataRRule["UNTIL"]

    if(formDataRRule["FREQ"]=="DAYS"){
        toReturn["FREQ"] = "DAILY"

    }

    if(formDataRRule["FREQ"]=="WEEKS"){
        toReturn["FREQ"] = "WEEKLY"

    }
    if(formDataRRule["FREQ"]=="MONTHS"){
        toReturn["FREQ"] = "MONTHLY"
    }
    toReturn["INTERVAL"] = formDataRRule["INTERVAL"]

    return toReturn
}

export function getEmptyEventDataObject()
{
    var toReturn = { "data": {"start": "", "end":"", "summary": "", "description": "", "rrule": "", "status": "","location": ""}, "event": {"calendar_id":null, "url": null} }

    return toReturn
}

export function addAdditionalFieldsFromOldEvent(newEventData, oldEventData)
{
    var missingKeys=[]
    var toReturn=newEventData

    for (const i in oldEventData.data)
    {
        var found = false
        for (const k in newEventData.data)
        {
            if(k==i)
            {
                found=true
            }
        }

        if(found==false)
        {
            missingKeys.push(i)
        }

    }
    for (const l in missingKeys)
    {
        toReturn.data[missingKeys[l]]=oldEventData.data[missingKeys[l]]
    }
    return newEventData

}


export async function updateEvent(calendar_id, url, etag, data) {
    const url_api = process.env.NEXT_PUBLIC_API_URL + "caldav/calendars/modify/object"

    const authorisationData = await getAuthenticationHeadersforUser()
    var updated = Math.floor(Date.now() / 1000)
    const requestOptions =
    {
        method: 'POST',
        body: JSON.stringify({ "etag": etag, "data": data, "type": "VEVENT", "updated": updated, "calendar_id": calendar_id, url: url, deleted: "" }),
        mode: 'cors',
        headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
    }
    return new Promise( (resolve, reject) => {
        try {
            fetch(url_api, requestOptions)
                .then(response => response.json())
                .then((body) => {
                    resolve(body)
    
                });
        }
        catch (e) {
            resolve({success: false, data:{message: e.message}})
        }
    
    
    })
}
