import ical from '@/../ical/ical'
import { getAuthenticationHeadersforUser } from "./user";
import { getAPIURL, isValidObject, isValidResultArray, logError, logVar, varNotEmpty } from "../general";
import { majorTaskFilter } from "./events";
import * as _ from 'lodash'
import { VTODO } from "./classes/VTODO";
import { getErrorResponse } from "../errros";
import { getParsedAlarmsFromTodo } from "./VTODOHelpers";
import { AlarmType } from "@/components/events/AlarmForm";
import { VAlarmType } from "@/types/valarm";
export async function getCaldavAccountsfromServer(): Promise<any>
{
    const url_api=getAPIURL()+"caldav/calendars" 
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),
    }

    return new Promise( (resolve, reject) => {
     
            const response =  fetch(url_api, requestOptions as RequestInit)
            .then(response => response.json())
            .then((body) =>{
                //Save the events to db.
                return resolve(body)
                
    
            }).catch(e =>{
            return resolve(getErrorResponse(e))
            })

    })

}
export async function caldavAccountsfromServer(): Promise<any>
{
    const url_api=getAPIURL()+"caldav/calendars" 
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),
    }

    return new Promise( (resolve, reject) => {

            const response =  fetch(url_api, requestOptions as RequestInit)
            .then(response => response.json())
            .then((body) =>{
                //Save the events to db.
                if(body!=null && body.success!=null)
                {
                    if(body.success==true && body.data!=null && body.data.message!=null)
                    {
                        return resolve(body.data.message)
    
                    }
                    
                }
                else
                {
                    return resolve(null)
    
                }
                
    
            }).catch(e =>
            {
                logVar(e, "caldavAccountsfromServer")
                return resolve(null)
            })
    })

}


export async function getLatestCalendarEvents(caldav_accounts_id, calendars_id, filters)
{
    const url_api=getAPIURL()+"caldav/calendars/events/db/?caldav_accounts_id="+caldav_accounts_id+"&&calendars_id="+ calendars_id+"&&filter="+filters
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }

    return new Promise( (resolve, reject) => {
            const response =  fetch(url_api, requestOptions as  RequestInit)
            .then(response => response.json())
            .then((body) =>{
                //Save the events to db.
                return resolve(body)
    
            }).catch(e =>
            {
                return resolve(getErrorResponse(e))
            })
    })

}

export async function getAllEvents(filters)
{
    if(filters!=null)
    {
        var url_api=getAPIURL()+"caldav/calendars/events/db/all?&&filter="+filters

    }else{
        var url_api=getAPIURL()+"caldav/calendars/events/db/all"

    }
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }

    return new Promise( (resolve, reject) => {
       
            const response =  fetch(url_api, requestOptions as  RequestInit)
            .then(response => response.json())
            .then((body) =>{
                //Save the events to db.
                return resolve(body)
                
    
            }).catch(e =>{
                return resolve(getErrorResponse(e))
            })
    })

}




export function returnEventType(data)
{
    try{
        const  parsedData = ical.parseICS(data);
        for (let k in parsedData) {

            if(parsedData[k].type=="VTODO" || parsedData[k].type=="VEVENT") {
                return parsedData[k].type
            }        
        }
    
    }
    catch(e)
    {
        logError(e, data)
        return ""
    }
    
}

/***
 * Since Thunderbird and other clients tend to add a lot of timezone data not yet supported in MMDL, we check if the parsedData row is a VTODO or not.
 */
function isValidParsedVTODO(parsedDataEntry){
    if(("type" in parsedDataEntry)==false)
    {
        return false
    }
    if(parsedDataEntry["type"]!="VTODO")
    {
        return false
    }

    return true
}

export function returnGetParsedVTODO(vtodo) : null | any
{
    if(!vtodo){
        return null
    }
    try{
        const  parsedData = ical.parseICS(vtodo);
        // console.log("parsedData", parsedData)
        for (let k in parsedData) {
            if(!isValidParsedVTODO(parsedData[k]))
            {
                continue;
            }
            
            let entries = Object.entries(parsedData[k])
            //console.log(parsedData[k].recurrences)
            let relatedto =""
            let percentcomplete=""
    
            for(let i=0; i<entries.length; i++)
            {
                let key = entries[i][0]
                if(key=="related-to")
                {
                    relatedto= entries[i][1] as string
    
                }   
                if(key=="percent-complete")
                {
                    percentcomplete=(entries[i][1] as string).toString()
                }
            }      
            
    
            let duedate=parsedData[k].due
            if(typeof(parsedData[k].due) =='object' && typeof(parsedData[k].due) !='string' ){
                
                    try{
                        duedate=parsedData[k].due.val
                    }
                    catch{
                        duedate=""
                    }
            }
            let recurrences ={}
            if(parsedData[k].recurrences && Array.isArray(parsedData[k].recurrences))
            {
                for(const i in parsedData[k].recurrences)
                {
                    recurrences[i]=parsedData[k].recurrences[i]
                }
        
            }
    
            //console.log("recurrences", recurrences, typeof(parsedData[k].recurrences))
            let description =""
            //console.log(parsedData[k].description)
            if(parsedData[k].description){
                if(typeof(parsedData[k].description)=="string"){
                    description=parsedData[k].description
                }else{
                    if(("params" in parsedData[k].description) && ("ALTREP" in parsedData[k].description["params"])){
                        // This will support HTML in the future, perhaps.
                        //description = parsedData[k].description["params"]["ALTREP"]
                        description = parsedData[k].description["val"]
                    }else{
                        if("val" in parsedData[k].description){
                            description=parsedData[k].description["val"]
                        }
                    }
                }
            }
            let alarms: VAlarmType[] = []
            let toReturn= {
                summary:parsedData[k].summary,
                created: parsedData[k].created,
                due: duedate,
                completion: parsedData[k].completion,
                completed: parsedData[k].completed,
                status:parsedData[k].status,
                uid:parsedData[k].uid,
                category:parsedData[k].categories,
                priority:parsedData[k].priority,
                start:parsedData[k].start,
                relatedto:relatedto,
                lastmodified:parsedData[k].lastmodified,
                dtstamp: parsedData[k].dtstamp,
                description: description,
                rrule: parsedData[k].rrule,
                recurrences: recurrences,
                alarms: alarms
            }
    
            for (const key in parsedData[k])
            {
                if(!(key in toReturn))
                {
                    //Try to parse any alarms
                    const alarms = getParsedAlarmsFromTodo(parsedData[k])
                    if(alarms && Array.isArray(alarms) && alarms.length>0){
                        toReturn.alarms= alarms
                    }
                    toReturn[key]=_.cloneDeep(parsedData[k][key])
                }
            }
            //console.log(toReturn)
            return toReturn
        }
    
    }catch(e){
        console.log("returnGetParsedVTODO",e,vtodo)
        return {}
    }

}

/**
 * @deprecated
 * @param {*} todoList List of filtered todos.
 * @param {*} filter Any filter to be applied
 * @param {*} allEvents List of all unfiltered events
 * @returns 
 */
export function arrangeTodoListbyHierarchy(todoList, filter, allEvents)
{

    // console.time("time1")
    var listofTasks= getTopLevelUID(todoList, filter)
    // console.timeEnd("time1")
    //console.log("listofTasks", listofTasks)

    // console.time("time2")
    recursivelyAddChildren(listofTasks, allEvents, 0)
    // console.timeEnd("time2")
    return listofTasks

}

function recursivelyAddChildren(listofTasks, todoList, counter)
{
    //Counter included so recursion doesn't go haywire.
    //Try increasing the environment variable, if subtasks aren't rednering properly.
    var toReturn=null
    const maxTries = process.env.NEXT_PUBLIC_SUBTASK_RECURSION_CONTROL_VAR ?? 100
    if(counter>maxTries)
    {
        return false
    }
    counter++
    for(const key in listofTasks)
    {
        var children = findChildren(key, todoList)
        if(isValidResultArray(children))
        {
            for(const i in children)
            {
                var keyofChild= children[i]
                listofTasks[key][keyofChild]={}


                /*if(majorTaskFilter(todoList[key].todo)==true)
                {
                    listofTasks[key][keyofChild]={}

                }*/

            }
           recursivelyAddChildren(listofTasks[key], todoList, counter)

           
        }
        else
        {
            listofTasks[key]={}
        }
    }
    return listofTasks

}
function getTopLevelUID(todoList, filter)
{
    var finalArray={}

    if(todoList!=null && Array.isArray(todoList) && todoList.length>0)
    {

        for(let i=0; i<todoList.length; i++)
        {
            var todo = returnGetParsedVTODO(todoList[i].data)
            //console.log("parsed todo", todo)
            var todoObj = new VTODO(todoList[i])

           // console.log(todoObj.parsedData.summary, todoObj.hasNoRelatedParent(), todoObj.parsedData.relatedto)
            todo.deleted= todoList[i].deleted
            if(majorTaskFilter(todo)==true)
            {

                if(isValidObject(filter))
                {
                    

                    if(todoObj.hasNoRelatedParent()==true)
                    {
                        // Task is a sub task. If parent is in todoList, then we don't add it at top level. If the parent is not here, we add.
                        if(findIDinFilteredList(todo.relatedto, todoList)==false)
                        {
                            finalArray[todo.uid]={}
    
                        }
                        else
                        {
                            finalArray[todo.relatedto]={}
    
                        }
                    }else
                    {
                        finalArray[todo.uid]={}
    
                    }

                }else
                {

                    if(todoObj.hasNoRelatedParent()==true)
                    {
                        //Probably a parent task with no relations to anyone.
                        finalArray[todo.uid]={}             
                    }

                }
            }

            
        }

    }

    return finalArray
    
}
export function getParsedTodoList(todoList)
{
    var finalArray={}
    if(todoList!=null && Array.isArray(todoList) && todoList.length>0)
    {
        for(let i=0; i<todoList.length; i++)
        {
            var todo = returnGetParsedVTODO(todoList[i].data)
            todo["url_internal"]=todoList[i].url
            todo["etag"]=todoList[i].etag
            todo["calendar_id"]=todoList[i].calendar_id
            todo["deleted"]=todoList[i].deleted
            todo["calendar_events_id"] = todoList[i]["calendar_events_id"]
            
            finalArray[todo.uid]={todo}
            
        }
    }
    return finalArray

}

export function getUnparsedEventData(todoList)
{
    var finalArray={}
    if(todoList!=null && Array.isArray(todoList) && todoList.length>0)
    {
        for(let i=0; i<todoList.length; i++)
        {
            var todo = returnGetParsedVTODO(todoList[i].data)
            todo["url"]=todoList[i].url
            todo["etag"]=todoList[i].etag
            todo["calendar_id"]=todoList[i].calendar_id
            todo["deleted"]=todoList[i].deleted
            todo["calendar_events_id"] = todoList[i]["calendar_events_id"]

            finalArray[todo.uid]={data: todoList[i].data}
        }
    }
    return finalArray

}
function findChildrenOld(id, todoList)
{
    var children: string[]=[]
    for(let i=0; i<todoList.length; i++)
    {
        var todo = returnGetParsedVTODO(todoList[i].data)
        if(todo.relatedto!=null && todo.relatedto!="")
        {
            if(todo.relatedto==id && (todoList[i].deleted==null || todoList[i].deleted=="" ))
            {

                children.push(todo.uid)
            }
        }
    }
    return children
}

function findChildren(id, todoList)
{
    var children: string[]=[]
    for(let i=0; i<todoList.length; i++)
    {
        var todo = new VTODO(todoList[i])
        if(todo.getParent()==id)
        {
            children.push(todo.parsedData.uid)
        }
    }
    return children
}


export function findIDinFilteredList(relatedto, todoList)
{
    const id = VTODO.getParentIDFromRelatedTo(relatedto)
    var found = false
    for(let i=0; i<todoList.length; i++)
    {
        var todo = returnGetParsedVTODO(todoList[i].data)
        if(todo.uid==id)
        {
            found=true
        }
    }
    return found
}

export function parentInFilteredList(parent, todoList){
    let found = false
    for(let i=0; i<todoList.length; i++)
    {
        
        if(todoList[i]["uid"]==parent)
        {
            return true
        }
    }


    return found 
}


