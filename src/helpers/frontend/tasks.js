import { ISODatetoHuman } from "./general"
import * as moment from 'moment';
import { majorTaskFilter } from "./events";
export function sortTaskListbyDue(list, todoList)
{
    var sortedList= []
    for(const key in list)
    {
        var sortedChildren = null
        var dueDate= ISODatetoHuman(todoList[1][key].todo.due)
        var unixTimestamp = moment(dueDate, 'D/M/YYYY H:mm').unix();
        

        if(Object.keys(list[key]).length>0 )
        {
            //Has children. Sort the children.
            sortedChildren=  sortTaskListbyDue(list[key], todoList)
            sortedList.push([key, unixTimestamp, sortedChildren])

        }
        else
        {
            sortedList.push([key, unixTimestamp])

        }


        
            
 

    }
    sortedList.sort(sortFunction);

    return sortedList
       


    
}

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
 * @param {*} currenTaskObject 
 * @param {*} oldData 
 */
export function generateNewTaskObject(currenTaskObject, oldData)
{
    var newTaskObject= currenTaskObject
    if(oldData!=null && Object.keys(oldData).length>0)
    {
        for (const key in oldData)
        {
            if(key!="due" && key!="start" && key!="summary"&& key!="created"&& key!="completion"&& key!="completed"&& key!="status"&& key!="uid"&& key!="categories"&& key!="priority"&& key!="relatedto"&& key!="lastmodified"&& key!="dtstamp"&& key!="description")
            {
                newTaskObject[key]=oldData[key]
            }
        }
    }
    //console.log("inputobj", currenTaskObject, "outputObj", newTaskObject)

    return newTaskObject

}