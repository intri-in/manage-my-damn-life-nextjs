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

