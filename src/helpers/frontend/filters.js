import moment from "moment"
import { dueDatetoUnixStamp, ISODatetoHuman } from "./general"
import { getAuthenticationHeadersforUser } from "./user"
import { getAPIURL, isStringEmpty, logVar, varNotEmpty } from "../general"
import { RRuleHelper } from "./classes/RRuleHelper"
import { RecurrenceHelper } from "./classes/RecurrenceHelper"
import { getErrorResponse } from "../errros"
import { getMessageFromAPIResponse } from "./response"
import { END_OF_THE_UNIVERSE_DATE } from "@/config/constants"
import { dummyTranslationFunction } from "./translations"


export async function saveFiltertoServer(name, filter)
{
    const url_api=getAPIURL()+"filters/add"

    const authorisationData=await getAuthenticationHeadersforUser()


    return new Promise( (resolve, reject) => {

        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({"name":name, "filtervalue": filter}),
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData, 'Content-Type':'application/json'}),
        }
            fetch(url_api, requestOptions)
        .then(response => response.json())
        .then((body) =>{
            return resolve(body)
            }).catch(e =>
            {
                console.error("saveFiltertoServer: ",e)
                return resolve(getErrorResponse(e.message))
            })
    
    
    })

}

export async function makeFilterEditRequest(filterid, name, finalFilter)
{
    const url_api=getAPIURL()+"filters/modify"

    const authorisationData=await getAuthenticationHeadersforUser()


    return new Promise( (resolve, reject) => {

        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({"name":name, "filtervalue": finalFilter, "custom_filters_id": filterid}),
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData, 'Content-Type':'application/json'}),
        }
        
            fetch(url_api, requestOptions)
        .then(response => response.json())
        .then((body) =>{
            return resolve(body)
           
            
        }).catch(e =>{
            console.error(e)
            return resolve(getErrorResponse(e))
        })
    
    
    })

}

/**
 * Checks if the filter is valid.
 * @param {*} filter A JSON filter.
 * @returns Filter, if valid. Null otherwise
 */ 
export function checkifFilterValid(filter)
{

    let hasValidDueFilter=true
    let hasValidPriorityFilter = true
    let hasValidLabelFilter = true
    let hasValidLogic = true
    let hasValidStart = false
    if(filter.filter.due!=null && filter.filter.due!=undefined)
    {
        if((filter.filter.due[0]=="" || filter.filter.due[0]==null) &&  (filter.filter.due[1]=="" || filter.filter.due[1]==""))
        {
            hasValidDueFilter=false
        }else
        {
            if(filter.filter.due[0]!=null && filter.filter.due[0]!="" && filter.filter.due[1]!="" && filter.filter.due[1]!=null)
            {
                if(filter.filter.due[1]<filter.filter.due[0])
                {
                    hasValidDueFilter=false
                }
    
            }
        }
    }
    else
    {
        hasValidDueFilter=false
    }
  
    
    if(filter.filter.label==null || (Array.isArray(filter.filter.label) ==false && filter.filter.label!=null )  || (Array.isArray(filter.filter.label) == true && filter.filter.label!=null && filter.filter.label.length<1 ))
    {

        hasValidLabelFilter = false
    }


    if(filter.filter.priority==null || filter.filter.priority=="" )
    {
        hasValidPriorityFilter=false
    }

    if(filter.logic==null || filter.logic =="")
    {
        hasValidLogic= false
    }

    if("start" in filter.filter && filter.filter.start){
        if("before" in filter && filter.before){
            hasValidStart= true
        }
        if("after" in filter && filter.after){
            hasValidStart= true
        }
    }

    if(hasValidDueFilter || hasValidLabelFilter || hasValidLogic || hasValidPriorityFilter || hasValidStart)
    {
        return true
    }
    else{
        return false
    }
}

export function isValidFilter(filter)
{
    if(varNotEmpty(filter))
    {
        if(("filter" in filter) && ("logic" in filter))
        {
            return checkifFilterValid(filter)
        }else{
            return false
        }

    }else{
        return false
    }
}

export async function getAllFilters(){
    var filtersFromServer = await getFiltersFromServer()
    if(varNotEmpty(filtersFromServer) && varNotEmpty(filtersFromServer.success) && filtersFromServer.success==true)
    {
        return getMessageFromAPIResponse(filtersFromServer)
    }
    return []
}
export async function getFiltersFromServer()
{
    const url_api=getAPIURL()+"filters/get"
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }

    return new Promise( (resolve, reject) => {
            const response =  fetch(url_api, requestOptions)
            .then(response => response.json())
            .then((body) =>{
                return resolve(body)       
    
                }
            ).catch(e =>{
            console.error("getFiltersFromServer",e)
            return resolve(getErrorResponse(e))
            })
       
    });
  

}

export function filtertoWords(filter, dateTimeFormat, t)
{
    if(!dateTimeFormat){
        dateTimeFormat='DD/MM/YYYY HH:mm'
    }
    if(!t){
        t=dummyTranslationFunction
    }
    let toReturnArray=[]
    let toReturnFinal = []

    if(filter.filter.due!=null&& filter.filter.due!=undefined && varNotEmpty(filter.filter.due[0]) && varNotEmpty(filter.filter.due[1]) &&(filter.filter.due[0]!="" || filter.filter.due[1]!="" ))
    {
        var dueBefore=t("END_OF_UNIVERSE")
        var dueAfter =t("BEGINNING_OF_UNIVERSE")
        if(filter.filter.due[0]!="" && filter.filter.due[0]!=null)
        {
            dueAfter= moment(new Date(filter.filter.due[0])).format(dateTimeFormat);
        }
    
        if(filter.filter.due[1]!="" && filter.filter.due[1]!=null )
        {
            dueBefore=moment(new Date(filter.filter.due[1])).format(dateTimeFormat);
        }


        toReturnArray.push(
            <>
            &#123; {t("DUE_AFTER").toUpperCase()} <small>{dueAfter.toString()}</small> {`${t("AND")} ${t("DUE_BEFORE").toUpperCase()}`} <small>{dueBefore.toString()}</small> &#125;
            </>)
   


    }



    if(filter.filter.label!=null && filter.filter.label.length>0)
    {
        var labelString = []

        for(const j in filter.filter.label)
        {
            if(j!=0)
            {
                labelString.push(" or ")
            }
            labelString.push(<i key={filter.filter.label[j]}>&nbsp;{filter.filter.label[j]}&nbsp;</i>)
           

        }
        
        toReturnArray.push(<>
        &#123; {t("TASK_HAS_ANY_OF_LABELS").toUpperCase()} &#91; {labelString} &#93;  &#125;
        </>)
        
    }

    if(("priority" in filter.filter) && filter.filter.priority &&!isNaN(filter.filter.priority))
    {
        toReturnArray.push(<>
        &#123; {t("TASK_HAS_A_MINIMUM_PRIORITY_OF").toUpperCase()} {filter.filter.priority}  &#125;

        </>)
    }
    
    if(("start" in filter.filter) && filter.filter.start)
    {
        let after= ""
        let before=""
        let output =""
        if("after" in filter.filter.start && filter.filter.start.after){
            after = moment(filter.filter.start.after).format(dateTimeFormat)
        }
        if("before" in filter.filter.start && filter.filter.start.before){
            before= moment(filter.filter.start.before).format(dateTimeFormat)
        }
        if((!isStringEmpty(after) || !isStringEmpty(before))){
            output= `${t("TASK_STARTS").toUpperCase()} `
            // console.log("output", output)
        }
        // console.log("filter.filter.start",after,before, )

        if(after){
            output=`${output}${t("AFTER").toUpperCase()} ${after}`
        }
        if(before){
            const andString = after ? ` ${t("AND")} `:"" 
            output=output+andString+`${t("BEFORE").toUpperCase()} ${before}`
        }
        if(output){

            toReturnArray.push(<>&#123; {output} &#125;
            </>)        
        }
        // toReturnArray.push(<>
        // &#123; {t("TASK_HAS_A_MINIMUM_PRIORITY_OF").toUpperCase()} {filter.filter.priority}  &#125;

        // </>)
    }
    for (const i in toReturnArray)
    {
        if(i!=0 )
        {
            toReturnFinal.push(<><br/><b>{filter.logic} </b><br/></>)
        }
         toReturnFinal.push(toReturnArray[i])
        
    }
   

   return toReturnFinal

}

export function applyEventFilter(event, filter)
{

//    console.log("filter",  filter.filter)
    if(!filter || ("filter" in filter) ==false ){
        //Filter is invalid.
        //Let all events through!!
        return true
    }
    let logic="or"
    if("logic" in filter && filter.logic)
    {
        logic=filter.logic.toLowerCase()
    }


    /**
     * Only consider logic if there are more than one condition. Override logic to "or"
     */
    // console.log(countConditionsinFilter(filter))
    if(countConditionsinFilter(filter)<=1){

        logic="or"
    }
    
        let filterByLabelResult = false
        if(filter.filter.label!=null)
        {
            filterByLabelResult= filterbyLabel(filter.filter.label, event.category)
            // console.log("filterByLabelResult", filterByLabeleResult, event.category, filter.filter.label)
        }
        if(!filterbyLabel && logic=="and"){
            return false
        }

        let filterByDueResult= false
        if(filter.filter.due!=null)
        {
            let dueDate = event.due

            if ("rrule" in event && event.rrule ) {
                //Repeating Object
                var recurrenceObj = new RecurrenceHelper(event)
                dueDate= recurrenceObj.getNextDueDate()
            }
    
            filterByDueResult = filterbyDue(filter.filter.due, dueDate)
           
           
        }
        if(!filterByDueResult && logic=="and"){
            return false
        }

        let filterbyPriorityResult =false
        // console.log(("priority" in filter.filter && filter.filter.priority!=null))
        if("priority" in filter.filter && filter.filter.priority!=null)
        {
            filterbyPriorityResult=filterbyPriority(filter.filter.priority,event.priority)
            console.log(event.priority,filterbyPriorityResult)
            
           
        }

        if(!filterbyPriorityResult && logic=="and"){
            return false
        }

        let filterbyStartResult = false
        if("start" in filter.filter && filter.filter.start && "start" in event)
        {
            let startDate = event.start

            if ("rrule" in event && event.rrule ) {
               //Recurring event.
               // We ignore the start date, because it can be way in the past.
               // We instead use the due date.
               var recurrenceObj = new RecurrenceHelper(event)
               startDate= recurrenceObj.getNextDueDate()

            }

            filterbyStartResult = filterbyStart(filter.filter.start, startDate)
        }
        if(!filterbyStartResult && logic=="and"){
            return false
        }
        //if Logic is OR, we return true if any of the filters were true.
        return (filterbyPriorityResult == true || filterByDueResult == true || filterByLabelResult == true || filterbyStartResult == true)

        // if(logic == "or")
    // {
    // }
    // else{

    //     var filterByLabelResult = null
    //     if(filter.filter.label!=null)
    //     {
    //         var filterByLabelResult= filterbyLabel(filter.filter.label, event.category)
    //         if(filterByLabelResult==false)
    //         {
    //             return false
    //         }
    //     }
    //     var filterByDueResult= null
    //     if(filter.filter.due!=null)
    //     {
    //         var dueDate = event.due

    //         if (varNotEmpty(event.rrule) && event.rrule != "") {
    //             //Repeating Object
    //             var recurrenceObj = new RecurrenceHelper(event)
    //             dueDate= recurrenceObj.getNextDueDate()
    //         }
    
    //         filterByDueResult = filterbyDue(filter.filter.due, dueDate)

    //         return filterByDueResult
           
    //     }

    //     var filterbyPriorityResult =null

    //     if(filter.filter.priority!=null && filterbyPriority(filter.filter.priority,event.priority)==false)
    //     {
    //         filterbyPriorityResult=false
            
    //         return filterbyPriorityResult
           
    //     }

    //     return true

    // }
    

}
/**
 * Counts the number of condition there are in a filter
 * @param {*} filter 
 */
function countConditionsinFilter(filter){

    let counter =0
    if(!isValidFilter(filter)){
        return counter
    }

    const filterData = filter.filter

    if("priority" in filterData && filterData.priority){
        counter++
    }

    if("due" in filterData && filterData.due){
        counter++
    }

    if("label" in filterData && filterData.label){
        counter++
    }

    if("start" in filterData && filterData.start){
        counter++
    }


    return counter
}
function filterbyLabel(filterArray, categoryArray)
{
    let toReturn = false
    // console.log("filterArray", filterArray, "categoryArray", categoryArray)
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
function filterbyStart(filter_start, startDate ){
    let toReturn = false

    if(filter_start && startDate)
    {
        const startUnix= moment(startDate).unix()

        if(("before" in filter_start) && filter_start.before){
            if(startUnix<=filter_start.before)
            {
                toReturn = true
            }

        }
        

        if("after" in filter_start && filter_start.after){
            if(startUnix>=filter_start.after)
            {
                toReturn = true
            }

            
        }
    }

    return toReturn
}
function filterbyDue(filterdueArray, dueDate)
{
    let toReturn = false
    if(filterdueArray!=null && filterdueArray.length==2)
    {
        if(dueDate!=null && dueDate!="")
        {
            const dueUnixStamp= moment(dueDate).unix()
            const dueStart = moment(filterdueArray[0]).unix()
            const dueEnd = moment(filterdueArray[1]).unix()
            if(dueUnixStamp>=dueStart && dueUnixStamp <= dueEnd)
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
        if(priority!=null && priority!=0 && priority!="0" && priority<priorityFilter)
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

export function getFilterReadytoPost(filter)
{
    var newFilter = {}
    if(varNotEmpty(filter) && varNotEmpty(filter.logic) && varNotEmpty(filter.filter))
    {
        newFilter = {logic: filter.logic, filter:{}}
        
        if(varNotEmpty(filter.filter.due) && Array.isArray(filter.filter.due) && (filter.filter.due[0]!="" || filter.filter.due[1]!=""))
        {
            newFilter.filter.due = filter.filter.due

            if(!newFilter.filter.due[1]){
                newFilter.filter.due[1]=END_OF_THE_UNIVERSE_DATE
            }
        }

        if(varNotEmpty(filter.filter.priority) &&filter.filter.priority!="")
        {
            newFilter.filter.priority = filter.filter.priority
        }

        if(varNotEmpty(filter.filter.label) && Array.isArray(filter.filter.label) && filter.filter.label.length>0)
        {
            newFilter.filter.label = filter.filter.label
        }
        

    }

    // console.log("new Filter", newFilter)
    return newFilter


}

export function filterDueIsValid(due)
{
    var isValid = false
    if(varNotEmpty(due) && Array.isArray(due) && due.length==2 )
    {
        var dueFromValid=false
        if(varNotEmpty(due[0]) && due[0]!="")
        {
            dueFromValid = true
        }

        var dueToValid = false

        if(varNotEmpty(due[1]) && due[1]!="")
        {
            dueToValid = true
        }

        if(dueFromValid==false && dueToValid==false)
        {
            isValid= false
        }else{
            isValid = true
        }
    }

    return isValid
}