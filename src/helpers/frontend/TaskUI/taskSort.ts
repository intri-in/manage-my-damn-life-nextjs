import moment from "moment";
import { TaskArrayItem } from "./taskUIHelpers";
import { ISODatetoHuman, ISODatetoHumanISO } from "../general";

export const DEFAULT_SORT_OPTION = "due_asc"
export const SORT_OPTION_PRIORITY_DESC="priority_desc"
export function sortTasksByRequest(taskList: TaskArrayItem[], request){
    switch(request){
        case "due_asc":
            return sortByDue(taskList, true)
        case "due_desc":
            return sortByDue(taskList, false)
        case SORT_OPTION_PRIORITY_DESC:
            return sortbyPriority(taskList)
        default:
            return taskList
    }


}

function sortByDue(taskList: TaskArrayItem[], ascending: boolean){
    if(ascending){

        taskList.sort(function(a,b){
            const dueDateA= a.due ? moment(a.due).unix() : 10000000000000
            const dueDateB= b.due ? moment(b.due).unix() : 10000000000000
            // console.log("sort", a.summary, moment(a.due).toString(), dueDateA, b.summary, moment(b.due).toISOString(), dueDateB, dueDateA-dueDateB)
            return dueDateA - dueDateB
        })
    }else{
        taskList.sort(function(a,b){
            const dueDateA= a.due ? moment(a.due).unix() : -10000000000000
            const dueDateB= b.due ? moment(b.due).unix() : -10000000000000
            // console.log("sort", a.summary, a.due, dueDateA, b.summary, b.due, dueDateB, dueDateA-dueDateB)
            return dueDateB - dueDateA
        })
    }

    return taskList

}
function sortbyPriority(taskList: TaskArrayItem[]){
    taskList.sort(function(a,b){
        let priorityA = a.priority ?? 10
        if(typeof(priorityA)!=="number"){
            priorityA=parseInt(priorityA)
        }
        let priorityB = b.priority ?? 10
        if(typeof(priorityB)!=="number"){
            priorityB=parseInt(priorityB)
        }
        return priorityA-priorityB
    })
    return taskList
}
