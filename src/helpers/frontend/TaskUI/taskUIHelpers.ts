import { TaskPending } from "@/helpers/api/tasks"
import { findIDinFilteredList, parentInFilteredList, returnGetParsedVTODO } from "../calendar"
import { Calendar_Events } from "../dexie/dexieDB"
import { filterEvents, majorTaskFilter } from "../events"
import { VTODO } from "../classes/VTODO"
import { haystackHasNeedle, isValidObject, isValidResultArray, varNotEmpty } from "@/helpers/general"
import { Calendar } from "@fullcalendar/core"
import { getAllChildrenforTask_FromDexie, getCalendarEventFromUID_Dexie, getEventFromDexieByID } from "../dexie/events_dexie"
import { RecurrenceHelper } from "../classes/RecurrenceHelper"
import { getCalDAVAccountbyCalDAVId_Dexie } from "../dexie/caldav_dexie"
import { getCalendarNameByIDFromDexie } from "../dexie/calendars_dexie"
import { getMessageFromAPIResponse } from "../response"
import { toast } from "react-toastify"
import { getI18nObject } from "../general"
import { useSetAtom } from "jotai"
import { updateViewAtom } from "stateStore/ViewStore"
import { TaskFilter } from "types/tasks/filters"
import { DEFAULT_SORT_OPTION, sortTasksByRequest } from "@/helpers/frontend/TaskUI/taskSort"

export interface TaskSection{
    name: string | null,
    tasks: TaskArrayItem[]
}
export interface TaskArrayItem{
    id: number | string,
    uid: string,
    summary?: string,
    priority? : number,
    due?: number,
    children: TaskArrayItem[]
}


export async function returnTaskListFilteredandSorted(eventsFromDexie: Calendar_Events[] | null, currentPageFilter: {} | TaskFilter, sortOption?: string){
    // console.time("returnTaskListFilteredandSorted: Time to get event list.")

    const sortby = sortOption?? DEFAULT_SORT_OPTION
    const filteredTodos = filterEvents(eventsFromDexie, currentPageFilter)
    //console.log(filteredTodos)

    
    //const todoList_heirarchy = arrangeTodoListbyHierarchyV2(filteredTodos, eventsFromDexie)

    const listofTasks_Obj= await getTopLevelUID_V3(filteredTodos)

    // console.log(todoList_heirarchy)
    const sortedTodoList = sortTasksByRequest(listofTasks_Obj, sortby)

    //console.log("sortedTodoList", sortedTodoList)
    // console.timeEnd("returnTaskListFilteredandSorted: Time to get event list.")

    return sortedTodoList
}

async function getAllChildrenforTask(uid):Promise<TaskArrayItem[]>{
    const childrenFromDexie = await getAllChildrenforTask_FromDexie(uid)
    let toReturn: TaskArrayItem[] = []
    if(childrenFromDexie && Array.isArray(childrenFromDexie) && childrenFromDexie.length>0){

        for(const child in childrenFromDexie){
            if(childrenFromDexie[child]["uid"]){
                //get Dexie Events ID from this uid
                const event = await getCalendarEventFromUID_Dexie(childrenFromDexie[child]["uid"])
                if(!event){
                    continue;
                }
                // console.log(event[0]["parsedData"]["summary"])
                if(event && Array.isArray(event) && event.length>0){
                    // This is a valid event.
   
                    let dueDate = event[0]["parsedData"]["due"]
                    if(checkifRepeatingTask(event[0]["parsedData"])){
                        //Repeating task
                        const recurrenceObj = new RecurrenceHelper(event[0]["parsedData"])
                        dueDate = recurrenceObj.getNextDueDate()
            
                    }

                    const children =  await getAllChildrenforTask(event[0]["uid"])
                    if(!checkifUIDAlreadyinChildren(event[0]["uid"], toReturn)){

                        toReturn.push({uid: event[0]["uid"]!, id: event[0].calendar_events_id!, summary: event[0]["parsedData"]["summary"], priority: event[0]["parsedData"]["priority"], due: dueDate, children:children})
                    }

                }

            }
        }
    }

    return toReturn

}

/**
 * Removes any duplicates from
 * @param eventArrayToReturn 
 */
function checkifUIDAlreadyinChildren(uid_toCheck, eventArrayToReturn){
    
    for(const j in eventArrayToReturn){
        if(eventArrayToReturn[j].uid==uid_toCheck){
            return true
        }
    }
    
    return false
}
/**
 * Instead of older approach (in arrangeTodoListbyHierarchyV2) instead  of recursively going through the list, we check if a tasks that has a parent. If yes, we check if the parent is in the filtered list. If yes, we skip the present task, else we add. By doing this we are left with the Top Level Tasks that have been filtered. We will then add children later.
 */
async function getTopLevelUID_V3(todoList: Calendar_Events[])
{
    let finalArray: TaskArrayItem[]=[]
    
    // We will keep removing the events that have been added to Top Level Array and Let the remaining be left for further processing.

    let remainingArray: Calendar_Events[] = [] 

    if(todoList!=null && Array.isArray(todoList) && todoList.length>0)
    {

        for(let i=0; i<todoList.length; i++)
        {
            let todo: {} | undefined  = undefined
            if(todoList[i].parsedData){
                
                todo = todoList[i].parsedData
            }else{
                todo = returnGetParsedVTODO(todoList[i].data)

            }
            if(!todo){
                continue;
            }
            //let todoObj = new VTODO(todoList[i])
            //console.log("todoObj", todo,todoObj)
            const parent = getParsedTaskParent(todo)
            let dueDate = todo["due"]
            if(checkifRepeatingTask(todo)){
                //Repeating task
                const recurrenceObj = new RecurrenceHelper(todo)
                dueDate = recurrenceObj.getNextDueDate()
    
            }
            // console.log(todoObj.parsedData.summary, todoObj.hasNoRelatedParent(), todoObj.parsedData.relatedto)

            let addToList = false

            if(!parent)
            {
                //Probably a parent task with no relations to anyone. We add it to our top-level list.
                addToList=true
                
            }else{
                // The task has a parent.

                if(parentInFilteredList(parent, todoList)==false)
                {
                    // console.log(todo.summary, todo.relatedto)

                    // Task is a sub task. Its parent however is not in the filtered list. Therefore, this is a top-level task for our current parameters. We add it to the array.
                    addToList=true
                    
                }
            }
            if(addToList){

                const children = await getAllChildrenforTask(todo["uid"])
                finalArray.push({uid:todo["uid"], id: todoList[i].calendar_events_id!, children:children, summary: todo["summary"], priority: todo["priority"], due: dueDate })
            }



            
        }

    }

    return finalArray
    
}



/**
 * @param {*} todoList List of filtered todos.
 * @param {*} filter Any filter to be applied
 * @param {*} allEvents List of all unfiltered events
 * @returns 
 */

export function arrangeTodoListbyHierarchyV2(todoList: Calendar_Events[], allEvents): TaskArrayItem[]
{
    //console.log(todoList)
    console.time("arrangeTodoListbyHierarchyV2: Time to get top level UID")
    const listofTasks_Obj= getTopLevelUID_V2(todoList)

    //console.log(listofTasks_Obj)    
    console.timeEnd("arrangeTodoListbyHierarchyV2: Time to get top level UID")
    // console.log("listofTasks", listofTasks)

    console.time("arrangeTodoListbyHierarchyV2: Time to get children")
    recursivelyAddChildren_V2(listofTasks_Obj.topLevelTasks, allEvents, 0)
    console.timeEnd("arrangeTodoListbyHierarchyV2: Time to get children")
    return listofTasks_Obj.topLevelTasks

}


/**
 * Recursively adds children to the array of top level tasks.
 * @param {array} listofTasks List of top level tasks obtained from the function {@link arrangeTodoListbyHierarchyV2}
 * @param todoList List of all unfiltered events from Dexie
 * @param counter Counter to measure how many time recursion has taken place
 * @returns 
 */
function recursivelyAddChildren_V2(listofTasks: TaskArrayItem[], remainingFiltered: Calendar_Events[], counter)
{
    //Counter included so recursion doesn't go haywire.
    //Try increasing the environment variable, if subtasks aren't rednering properly.
    if(process.env.NEXT_PUBLIC_SUBTASK_RECURSION_CONTROL_VAR && counter>process.env.NEXT_PUBLIC_SUBTASK_RECURSION_CONTROL_VAR)
    {
        return listofTasks
    }
    counter++        

    for(const i in listofTasks)
    {
        const children = findChildrenV2(listofTasks[i].uid, remainingFiltered)

        // console.log("children", children)
        if(isValidResultArray(children))
        {
            listofTasks[i].children=children
            const newTodoListWithChildrenRemoved = removeChildrenFromBiggerArray(children,remainingFiltered )
            // console.log(newTodoListWithChildrenRemoved.length-todoList.length+children.length)
            recursivelyAddChildren_V2(listofTasks[i].children, newTodoListWithChildrenRemoved, counter)           
        }
        else
        {
            listofTasks[i].children=[]
        }
    }
    return listofTasks

}
/**
 * Remove the found children from the main events array to make sure that the array size keeps reducing with every item.
 * @param childrenArray
 * @param mainArray 
 */
function removeChildrenFromBiggerArray(childrenArray: TaskArrayItem[], mainArray:Calendar_Events[]){
    let finalArray: Calendar_Events[] = []
    for(let j=0; j<mainArray.length; j++){
        let found = false
        for(const i in childrenArray)
        {
            if(mainArray[j].calendar_events_id==childrenArray[i].id)
            {
                found = true
            }
        }
        if(!found){
            finalArray.push(mainArray[j])
        }
    }

    return finalArray
}
function findChildrenV2(id: string, remainingFiltered: Calendar_Events[])
{
    var children: TaskArrayItem[]=[]
    for(let i=0; i<remainingFiltered.length; i++)
    {
        var todo = new VTODO(remainingFiltered[i])
        if(todo.getParent()==id)
        {
            let dueDate = todo.parsedData?.due
            if(checkifRepeatingTask(todo)){
                //Repearing task
                let recurrenceObj = new RecurrenceHelper(todo.parsedData)
                dueDate = recurrenceObj.getNextDueDate()
    
            }
            children.push({
                uid: todo.parsedData?.uid,
                id:remainingFiltered[i].calendar_events_id!,
                children: [],
                summary: todo.parsedData?.summary,
                priority: todo.parsedData?.priority, 
                due: dueDate
            })
        }
    }
    return children
}

function findChildrenThatDontSatisfyFilter(){

}

export function checkifRepeatingTask(parsedTask){
    if ("rrule" in parsedTask && parsedTask.rrule) {
        return true
    }
    return false
}

export function getParsedTaskParent(parsedTask){
    var relatedTo = parsedTask.relatedto

    if (varNotEmpty(relatedTo) && relatedTo != "") {

        if (typeof (relatedTo) != "string") {
            if (Array.isArray(relatedTo)) {
                for (const k in relatedTo) {
                    if (varNotEmpty(relatedTo[k].params) && varNotEmpty(relatedTo[k].params.RELTYPE)) {
                        if (relatedTo[k].params.RELTYPE == "PARENT") {
                            return relatedTo[k].val
                        }
                    }


                }
            } else {
                if (varNotEmpty(relatedTo.params) && varNotEmpty(relatedTo.params.RELTYPE)) {
                    if (relatedTo.params.RELTYPE == "PARENT") {
                        return relatedTo.val
                    }
                }
            }



        } else {
            return relatedTo
        }
    } else {
        return ""
    }



}
function getTopLevelUID_V2(todoList: Calendar_Events[])
{
    let finalArray: TaskArrayItem[]=[]
    
    // We will keep removing the events that have been added to Top Level Array and Let the remaining be left for further processing.

    let remainingArray: Calendar_Events[] = [] 

    if(todoList!=null && Array.isArray(todoList) && todoList.length>0)
    {

        for(let i=0; i<todoList.length; i++)
        {
            let todo: {} | undefined  = undefined
            if(todoList[i].parsedData){
                
                todo = todoList[i].parsedData
            }else{
                todo = returnGetParsedVTODO(todoList[i].data)

            }
            if(!todo){
                continue;
            }
            //let todoObj = new VTODO(todoList[i])
            //console.log("todoObj", todo,todoObj)
            const parent = getParsedTaskParent(todo)
            let dueDate = todo["due"]
            if(checkifRepeatingTask(todo)){
                //Repeating task
                const recurrenceObj = new RecurrenceHelper(todo)
                dueDate = recurrenceObj.getNextDueDate()
    
            }
            // console.log(todoObj.parsedData.summary, todoObj.hasNoRelatedParent(), todoObj.parsedData.relatedto)

            if(!parent)
            {
                //Probably a parent task with no relations to anyone.
                finalArray.push({uid:todo["uid"], id: todoList[i].calendar_events_id!, children:[], summary: todo["summary"], priority: todo["priority"], due: dueDate })

                
            }else{
                
                if(parentInFilteredList(parent, todoList)==false)
                {
                    // console.log(todo.summary, todo.relatedto)

                    // Task is a sub task. If parent is in todoList, then we don't add it at top level. If the parent is not here, we add.
                    
                    finalArray.push({uid:todo["uid"], id: todoList[i].calendar_events_id!, children:[], summary: todo["summary"], priority: todo["priority"], due: dueDate })
                    
                }
                else
                {
                    //Add the todo to remaining array.

                    remainingArray.push(todoList[i])
                }
            }
            // if(majorTaskFilter(todo)==true)
            // {
            //     if(todoObj.hasNoRelatedParent()==true)
            //     {
            //         //Probably a parent task with no relations to anyone.
            //         finalArray.push({uid:todo.uid, id: todoList[i].calendar_events_id, children:[], summary: todo.summary })
            //     }
            //     console.log("parsed todo", todo.summary, todoObj.hasNoRelatedParent())
            //     if(isValidObject(filter))
            //     {
            //         if(todoObj.hasNoRelatedParent()==true)
            //         {
            //             console.log("parsed todo", todo.summary)
                        
                        
            //         }else
            //         {
            //             finalArray.push({uid:todo.uid, id: todoList[i].calendar_events_id, children:[], summary: todo.summary })
    
            //         }

            //     }else
            //     {

            //         if(todoObj.hasNoRelatedParent()==true)
            //         {
            //             //Probably a parent task with no relations to anyone.
            //             finalArray.push({uid:todo.uid, id: todoList[i].calendar_events_id, children:[], summary: todo.summary })
            //         }

            //     }
            // }

            
        }

    }

    return {
        topLevelTasks: finalArray,
        rest: remainingArray
    }
    
}

export function generateTaskArrayFromDexieOutput(tasksFromDexie: Calendar_Events[]){
    let toReturn: TaskArrayItem[] = []
    if(Array.isArray(tasksFromDexie)==false){
        return []
    }

    for (let i=0; i<tasksFromDexie.length; i++){
        const parsedTodo = returnGetParsedVTODO(tasksFromDexie[i].data)
        if(parsedTodo){
                    

        }
    }
}

export async function filterTaskListArray(taskList: TaskArrayItem[], filter): Promise<TaskArrayItem[]>{
    let newDexieList: TaskArrayItem[] = []
    for(const k in taskList)
    {
        const event = await getEventFromDexieByID(parseInt(taskList[k].id.toString()))
        if(event && Array.isArray(event) && event.length>0){
            const throughFilter = filterEvents(event, filter)
            if(throughFilter && Array.isArray(throughFilter) && throughFilter.length>0){
                newDexieList.push(taskList[k])
            }
        }
    }

    return newDexieList
}

/**
 * 
 * @param taskList Applies basic filter to entire Task Array List and removes done and comepleted tasks
 */
export async function removeDoneTasksFromTaskListArray(taskList: TaskArrayItem[]){
    let newTaskArrayList: TaskArrayItem[] = []
    for(const k in taskList)
    {
        const event = await getEventFromDexieByID(parseInt(taskList[k].id.toString()))
        if(event && Array.isArray(event) && event.length>0){

            const todo = returnGetParsedVTODO(event[0].data)
            if(majorTaskFilter(todo) && TaskPending(todo)){
                if(taskList[k].children.length>0){
                    const row_children = await removeDoneTasksFromTaskListArray(taskList[k].children)
                    let toAddRow = taskList[k]
                    toAddRow.children = row_children
                    newTaskArrayList.push(toAddRow)
                }else{

                    newTaskArrayList.push(taskList[k])
                }
            }
        }
    }

    return newTaskArrayList
}

export async function filterTaskListArrayFromSearchTerm(taskList: TaskArrayItem[], searchTerm: string)
{
    let newTaskArrayList: TaskArrayItem[] = []
    for(const k in taskList)
    {
        const event = await getEventFromDexieByID(parseInt(taskList[k].id.toString()))
        if(event && Array.isArray(event) && event.length>0){
            const todo = returnGetParsedVTODO(event[0].data)
            if(haystackHasNeedle(searchTerm.trim(), todo?.summary) || haystackHasNeedle(searchTerm.trim(), todo?.description)){
                newTaskArrayList.push(taskList[k])
            }

        }
    }

    return newTaskArrayList
}
/**
 * 
 */
export async function getCaldavAndCalendarNameForView(caldav_accounts_id, calendar_id){
    let name = ""
    const caldav_Info = await getCalDAVAccountbyCalDAVId_Dexie(caldav_accounts_id)
    if(caldav_Info && Array.isArray(caldav_Info) && caldav_Info.length>0){
        name=caldav_Info[0]["name"]+ " >> "
    }

    const calendarName = await getCalendarNameByIDFromDexie(calendar_id)
    return name+calendarName
}

export const onServerResponse_UI = (body, taskName) =>{
    var message= getMessageFromAPIResponse(body)
    const finalToast = taskName ? taskName+": ": ""
    const i18next = getI18nObject()
    if (body != null) {
        if (body.success == true) {
            
            if(typeof(message)==="string"){

                toast.success(finalToast+i18next.t(message))
            }else{
                toast.success(finalToast+i18next.t("Done")+"!")
            }
        
        }
        else {
            if(message){

                toast.error(message)
            }else{
                toast.error(finalToast+i18next.t("ERROR_GENERIC"))
            }
            
        }
    }
}