import { ISODatetoHuman, getI18nObject } from "./general"
import moment from 'moment';
import { majorTaskFilter, preEmptiveUpdateEvent, updateEvent } from "./events";
import { getAuthenticationHeadersforUser } from "./user";
import { toast } from "react-toastify";
import VTodoGenerator from "vtodogenerator";
import { getAPIURL, varNotEmpty } from "../general";
import { makeParseICSRequest } from "./ics";
import { getCalDAVAccountIDFromCalendarID_Dexie } from "./dexie/calendars_dexie";
import {RRule} from 'rrule'
import { parseRRuleString } from "./rrule";
// export function sortTaskListbyDue(list, todoList)
// {
//     var sortedList= []
//     for(const key in list)
//     {
//         var sortedChildren: any[] = []
//         var dueDate= ISODatetoHuman(todoList[1][key].todo.due)
//         var unixTimestamp = moment(dueDate).unix();
        
//         if(Object.keys(list[key]).length>0 )
//         {
//             //Has children. Sort the children.
//             sortedChildren=  sortTaskListbyDue(list[key], todoList)
//             sortedList.push([key, unixTimestamp, sortedChildren])

//         }
//         else
//         {
//             sortedList.push([key, unixTimestamp])

//         }


        
            
 

//     }
//     sortedList.sort(sortFunction);

//     return sortedList
       


    
// }

export function filterTaskList()
{
    
}
function sortFunction(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] < b[1]) ? -1 : 1;
    }
}

/**
 * Generates a new task object to pass to the VTODOGENERATOR
 * Makes sure that no data goes missing when a task is being edited, even when MMDL doesn't
 * support some of the fields.
 * Parses the ICS with two parsers to make sure we don't miss anything.
 * @param {*} currenTaskObject 
 * @param {*} oldData 
 */
export async function generateNewTaskObject(currenTaskObject, oldData, oldUnparsed)
{
    var newTaskObject= currenTaskObject
    if(oldData!=null && Object.keys(oldData).length>0)
    {
        for (const key in oldData)
        {
            if(!(key in newTaskObject) && includeKeyInICS(key)==true  && key!='taskDone')
            {
                newTaskObject[key]=oldData[key]
            }
        }
    }
    //console.log("inputobj", currenTaskObject, "outputObj", newTaskObject)

    /**
     * Now we parse with ICAL.js
     * Removed in v0.10.0. It just adds an extra API call during task/event save.
     * If some data goes missing, we will investigate if those cases arise.
     */

    // if(varNotEmpty(oldUnparsed) && oldUnparsed!="")
    // {
    //     var response = await makeParseICSRequest(oldUnparsed,"VTODO")
    //     if(varNotEmpty(response) && varNotEmpty(response.success) && response.success==true)
    //     {
    //         var newICALJSParsedData = response.data.message
    //         for(const key in newICALJSParsedData)
    //         {
    //             if (!(key in newTaskObject) && includeKeyInICS(key)==true)
    //             {
    //                 // This key is not in our object. So we include it.
    //                 if(varNotEmpty(newICALJSParsedData[key]["value"]) && newICALJSParsedData[key]["value"]!="")
    //                 {
    //                     newTaskObject[key]=newICALJSParsedData[key]["value"]
    
    //                 }else{
    //                     newTaskObject[key]=newICALJSParsedData[key]["additional"]
    //                 }
    
    //             }
    //         }
    //     }
    // }
    
    return newTaskObject

}

export async function handleUI_TodoUpdate(calendar_id, url, etag, data, caldav_accounts_id, onDismissFunction, taskName){
        
    preEmptiveUpdateEvent(calendar_id, url, etag, data, "VTODO").then(oldEvent =>{

        if(onDismissFunction){
            onDismissFunction(null, taskName)
        }
        updateEvent(calendar_id,url, etag, data, caldav_accounts_id,"VTODO", oldEvent).then((body)=>{
            if(onDismissFunction){

                onDismissFunction(body, taskName)
            }
            
        })
    })

}
export async function updateTodo_WithUI(calendar_id, url, etag, dataObj, onDismissFunction){

    var todo = new VTodoGenerator(dataObj, {strict: false})
    var data = todo.generate()
    // console.log("data", data)
    // return
    const caldav_accounts_id = await getCalDAVAccountIDFromCalendarID_Dexie(calendar_id)
    if(caldav_accounts_id){
        handleUI_TodoUpdate(calendar_id, url, etag, data, caldav_accounts_id, onDismissFunction, dataObj["summary"])
    }

}

export async function updateTodo(calendar_id, url, etag, dataObj, oldEvent) {

    var todo = new VTodoGenerator(dataObj, {strict: false})
    var data = todo.generate()
    const caldav_accounts_id = await getCalDAVAccountIDFromCalendarID_Dexie(calendar_id)
    if(caldav_accounts_id){
        const body = await updateEvent(calendar_id,url, etag, data, caldav_accounts_id,"VTODO", oldEvent)
        return body
    }
    // console.log(data)
    // const url_api = getAPIURL() + "caldav/calendars/modify/object"
    // var i18next = getI18nObject()
    // const authorisationData = await getAuthenticationHeadersforUser()
    // var updated = Math.floor(Date.now() / 1000)
    // const requestOptions =
    // {
    //     method: 'POST',
    //     body: JSON.stringify({ "etag": etag, "data": data, "type": "VTODO", "updated": updated, "calendar_id": calendar_id, url: url, deleted: "" }),
    //     mode: 'cors',
    //     headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
    // }

    // return new Promise( (resolve, reject) => {

    //         fetch(url_api, requestOptions)
    //             .then(response => response.json())
    //             .then((body) => {
    //                 return resolve(body)
    
    //             }).catch (e => {
    //                 toast.error(e.message)
    //                 return resolve(null)
    //             })
    
    // })
}


function includeKeyInICS(key)
{
    //We ignore keys that we already are taking care of.
    const ignoreListofKeys=[
        "last-modified",
        "percent-complete",
    ]

    var include = true
    for (const i in ignoreListofKeys)
    {
        if(ignoreListofKeys[i]==key)
        {
            include=false
        }
    }

    return include
}

export function addRRuleIntervalToDate(date: string, rrule: RRule | null | undefined ){
    if(!rrule) return date
    let toReturn = moment(moment(date).toISOString())
        switch(rrule.options.freq){
            case RRule.YEARLY:
                toReturn.add(rrule.options.interval, 'years')

            case RRule.MONTHLY:
                toReturn.add(rrule.options.interval, 'months')
                break;
            case RRule.WEEKLY:
                toReturn.add(rrule.options.interval, 'w')
                break;
            case RRule.DAILY:
                toReturn.add(rrule.options.interval, 'days')
                break;

            default:
                break;
                
        }
    return toReturn.toISOString()

}

export function getStartAndEndDateForTaskForCalendar(data: any): {start : string, end: string}{

    let toReturn = {start: "", end:""}
    if (!data ) return toReturn

    if(!data.start && !data.due) return {start: "", end : ""}
    const hasBothDates: boolean =  (data.start!=null && data.start!=undefined) && (data.due!=null && data.due!=undefined)
    // console.log("hasBothDates", data.start, data.due, hasBothDates)
    if(hasBothDates){
        toReturn={
            start: moment(data.start).toISOString(),
            end:moment(data.due).toISOString(),
        }
        return toReturn
    }

    if(data.due){
        const newStart = moment(data.due).subtract(1, "hours");
        return  {start: newStart.toISOString(), end:moment(data.due).toISOString()}
    }

    const newEnd = moment(data.start).add(1, "hours");
    return {start: moment(data.start).toISOString(), end: newEnd.toISOString()}

}