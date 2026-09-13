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

function sortByDue(taskList: TaskArrayItem[], ascending: boolean): TaskArrayItem[]
{
    const decorated = taskList.map(task => ({
        task,
        key: task.due ? moment(task.due).unix() : (ascending ? 10000000000000 : -10000000000000)
    }))

    decorated.sort((a, b) => ascending ? (a.key - b.key) : (b.key - a.key))

    return decorated.map(d => d.task)
}

function sortbyPriority(taskList: TaskArrayItem[]){
       const decorated = taskList.map(task => {
        let priority = task.priority ?? 10
        if(typeof(priority) !== "number"){
            priority = parseInt(priority)
        }
        return { task, key: priority }
    })

    decorated.sort((a, b) => a.key - b.key)

    return decorated.map(d => d.task)
}
