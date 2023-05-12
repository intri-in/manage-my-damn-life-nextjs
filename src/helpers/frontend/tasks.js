import { ISODatetoHuman, getI18nObject } from "./general"
import * as moment from 'moment';
import { majorTaskFilter } from "./events";
import { getAuthenticationHeadersforUser } from "./user";
import { toast } from "react-toastify";
import VTodoGenerator from "vtodogenerator";
import { getAPIURL, varNotEmpty } from "../general";
import { makeParseICSRequest } from "./ics";
export function sortTaskListbyDue(list, todoList)
{
    var sortedList= []
    for(const key in list)
    {
        var sortedChildren = null
        var dueDate= ISODatetoHuman(todoList[1][key].todo.due)
        var unixTimestamp = moment(dueDate).unix();
        
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
     */

    if(varNotEmpty(oldUnparsed) && oldUnparsed!="")
    {
        var response = await makeParseICSRequest(oldUnparsed,"VTODO")
        if(varNotEmpty(response) && varNotEmpty(response.success) && response.success==true)
        {
            var newICALJSParsedData = response.data.message
            for(const key in newICALJSParsedData)
            {
                if (!(key in newTaskObject) && includeKeyInICS(key)==true)
                {
                    // This key is not in our object. So we include it.
                    if(varNotEmpty(newICALJSParsedData[key]["value"]) && newICALJSParsedData[key]["value"]!="")
                    {
                        newTaskObject[key]=newICALJSParsedData[key]["value"]
    
                    }else{
                        newTaskObject[key]=newICALJSParsedData[key]["additional"]
                    }
    
                }
            }
        }
    }
    
    return newTaskObject

}

export async function updateTodo(calendar_id, url, etag, dataObj) {

    var todo = new VTodoGenerator(dataObj)
    var data = todo.generate()
    console.log(data)
    const url_api = getAPIURL() + "caldav/calendars/modify/object"
    var i18next = getI18nObject()
    const authorisationData = await getAuthenticationHeadersforUser()
    var updated = Math.floor(Date.now() / 1000)
    const requestOptions =
    {
        method: 'POST',
        body: JSON.stringify({ "etag": etag, "data": data, "type": "VTODO", "updated": updated, "calendar_id": calendar_id, url: url, deleted: "" }),
        mode: 'cors',
        headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
    }

    return new Promise( (resolve, reject) => {
        try {

            fetch(url_api, requestOptions)
                .then(response => response.json())
                .then((body) => {
                   
            return resolve(body)
    
                });

        }
        catch (e) {
            toast.error(e.message)
            return resolve(null)

        }
    
    
    })
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