import { isValidResultArray } from "../general"
import { arrangeTodoListbyHierarchy, getParsedTodoList, getUnparsedEventData, returnGetParsedVTODO } from "./calendar"
import { dueDatetoUnixStamp, ISODatetoHuman } from "./general"
import ical from '@/../ical/ical'
import { applyEventFilter } from "./filters"

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
    if((todo.completed==null || todo.completed=="")&& todo.completion!="100"&&todo.summary!=null && todo.summary!=undefined && (todo.deleted == null || todo.deleted == ""))
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