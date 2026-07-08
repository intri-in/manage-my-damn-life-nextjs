import moment from "moment"
import { varNotEmpty } from "../general"
import { dummyTranslationFunction } from "./translations"
import { TaskFilter } from "types/tasks/filters"
import { Fragment } from "react";
export function filterToWords(filter: TaskFilter, dateTimeFormat: string, t: any): JSX.Element[]
{
    if(!filter.filter){
        return [<Fragment key="emptyList"></Fragment>]
    }
    if(!dateTimeFormat){
        dateTimeFormat='DD/MM/YYYY HH:mm'
    }
    if(!t){
        t=dummyTranslationFunction
    }
    let toReturnArray: JSX.Element[] = []
    let toReturnFinal: JSX.Element[] = []

    if(filter.filter.due!=null&& filter.filter.due!=undefined && varNotEmpty(filter.filter.due[0]) && varNotEmpty(filter.filter.due[1]) &&(filter.filter.due[0]!="" || filter.filter.due[1]!="" ))
    {
        let dueBefore=t("END_OF_UNIVERSE")
        let dueAfter =t("BEGINNING_OF_UNIVERSE")
        if(filter.filter.due[0]!="" && filter.filter.due[0]!=null)
        {
            dueAfter= moment(new Date(filter.filter.due[0])).format(dateTimeFormat);
        }
    
        if(filter.filter.due[1]!="" && filter.filter.due[1]!=null )
        {
            dueBefore=moment(new Date(filter.filter.due[1])).format(dateTimeFormat);
        }


        toReturnArray.push(
            <Fragment key="dueFilter">
            &#123; {t("DUE_AFTER").toUpperCase()} <small>{dueAfter.toString()}</small> {`${t("AND")} ${t("DUE_BEFORE").toUpperCase()}`} <small>{dueBefore.toString()}</small> &#125;
            </Fragment>
            )
   


    }
    if(filter.filter.dueRelative && filter.filter.dueRelative.direction && filter.filter.dueRelative.value && !isNaN(parseInt(filter.filter.dueRelative.value.toString()))){

        const direction = filter.filter.dueRelative.direction
        const value =  Number(filter.filter.dueRelative.value)
        const unit = filter.filter.dueRelative.unit
        toReturnArray.push(
            <Fragment key="dueRelativeFilter">
            &#123; {t(direction).toUpperCase()} <small>{value.toString()} {filter.filter.dueRelative.unit}</small> &#125;
            </Fragment>)
    }


    if(filter.filter.label!=null && filter.filter.label.length>0)
    {
        let labelString: JSX.Element[] = []

        for(let j=0; j<filter.filter.label.length; j++)
        {
            if(j!=0)
            {
                labelString.push(<Fragment key={`orName_${j}`}>
                or 
                </Fragment>)
            }
            labelString.push(<i key={filter.filter.label[j]}>&nbsp;{filter.filter.label[j]}&nbsp;</i>)
           

        }
        
        toReturnArray.push(<Fragment key="labelFilter">
        &#123; {t("TASK_HAS_ANY_OF_LABELS").toUpperCase()} &#91; {labelString} &#93;  &#125;
        </Fragment>)
        
    }

    if(("priority" in filter.filter) && filter.filter.priority &&!isNaN(parseInt(filter.filter.priority.toString())))
    {
        toReturnArray.push(<Fragment key="priorityFilter">
        &#123; {t("TASK_HAS_A_MINIMUM_PRIORITY_OF").toUpperCase()} {filter.filter.priority}  &#125;

        </Fragment>)
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
        // console.log("After", after, before)
        if(after || before){
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

            toReturnArray.push(<Fragment key="startFilter">&#123; {output} &#125;
            </Fragment>)        
        }
        // toReturnArray.push(<>
        // &#123; {t("TASK_HAS_A_MINIMUM_PRIORITY_OF").toUpperCase()} {filter.filter.priority}  &#125;

        // </>)
    }
    if(filter.filter.startRelative && filter.filter.startRelative.direction && filter.filter.startRelative.value && !isNaN(parseInt(filter.filter.startRelative.value.toString()))){

    const direction = filter.filter.startRelative.direction
    const value =  Number(filter.filter.startRelative.value)
    const unit = filter.filter.startRelative.unit
    toReturnArray.push(
        <Fragment key="startRelativeFilter">
        &#123; {t(direction).toUpperCase()} <small>{value.toString()} {filter.filter.startRelative.unit}</small> &#125;
        </Fragment>)
    }

    for (let i=0; i<toReturnArray.length; i++)
    {
        if(i!=0 )
        {
            toReturnFinal.push(<Fragment key={`logic_name_${i}`}><br/><b>{filter.logic} </b><br/></Fragment>)
        }
         toReturnFinal.push(toReturnArray[i])
        
    }
   

   return toReturnFinal

}



/**
 * Checks if the filter is valid.
 * @param {*} filter A JSON filter.
 * @returns Filter, if valid. Null otherwise
 */ 
type errorMessageForFilterValidation ={
    due: string,
    dueRelative: string,
    label: string,
    logic: string,
    start :string,
    startRelative :string,
    global: string,
    priority:string
}
export function checkIfFilterValid(filter: TaskFilter): {status: boolean, message : errorMessageForFilterValidation}
{
    let errorMessages: errorMessageForFilterValidation = {due: "", dueRelative:"", label:"", logic:"", start:"", global:"", priority:"", startRelative:""}
    if(!filter.filter) {
        errorMessages.global="EMPTY_FILTER"
        return {status: false, message:errorMessages}
    }
    if(!(filter.logic=="or" || filter.logic=="and"))
    {
        errorMessages.global="ERROR_EMPTY_LOGIC"
        return {status: false, message: errorMessages}
    }
    let hasValidDueFilter=false
    let hasValidPriorityFilter = false
    let hasValidLabelFilter = false
    let hasValidStartRelative = false
    let hasValidStart = false
    let hasValidDueRelativeFilter = false

    if(filter.filter.due && Array.isArray(filter.filter.due) && filter.filter.due.length==2){
        const afterIsValid = filter.filter.due[0] ? moment(filter.filter.due[0]).isValid(): false
        const beforeIsValid = filter.filter.due[1] ? moment(filter.filter.due[1]).isValid() : false


        if( ( afterIsValid)|| beforeIsValid){
            // Filter has at least one valid due date.
            if(afterIsValid && beforeIsValid){
                //Since the filter has both dates, the before date > the after date
                const dateAfter =  moment(filter.filter.due[0])
                const dateBefore = moment(filter.filter.due[1])
                if(dateBefore.isAfter(dateAfter)){
                    hasValidDueFilter = true
                }else{
                    errorMessages.due= "ERROR_DUE_DATE_INVALID_DATE_COMPARE_FILTER"

                }
            }else{
                hasValidDueFilter = true
            }

        }else{
            errorMessages.due= "ERROR_DUE_DATE_INVALID_EMPTY_FILTER"
        }
        
    }
    
   
    if(filter.filter.dueRelative && filter.filter.dueRelative.value && filter.filter.dueRelative.unit && filter.filter.dueRelative.direction && !isNaN(filter.filter.dueRelative.value)){
        hasValidDueRelativeFilter = true

    }else{
        errorMessages.dueRelative= "ERROR_DUE_DATE_INVALID_EMPTY_FILTER"
        
    }
    if(filter.filter.label && Array.isArray(filter.filter.label) && filter.filter.label.length>0){
        let count = 0
        for(const i in filter.filter.label){
            if(filter.filter.label[i]){
                count ++
            }
        }
        if(count>0){
            hasValidLabelFilter = true
        }else{
            errorMessages.label= "ERROR_LABEL_EMPTY_LIST"

        }
    }else{
        errorMessages.label= "ERROR_LABEL_EMPTY_LIST"

    }
    if(filter.filter.priority && !isNaN(parseInt(filter.filter.priority.toString())) && filter.filter.priority!=0&& filter.filter.priority!="0")
    {
        // console.log("filter.filter.priority", filter.filter.priority)
        hasValidPriorityFilter=true
    }else{
        errorMessages.priority = "ERROR_MUST_SELECT_A_MIN_PRIORITY"
    }

  

    if(filter.filter.start ){
        const afterIsValid = filter.filter.start.after ? moment(filter.filter.start.after).isValid(): false
        const beforeIsValid = filter.filter.start.before ? moment(filter.filter.start.before).isValid() : false


        if( ( afterIsValid)|| beforeIsValid){
            // Filter has at least one valid due date.
            if(afterIsValid && beforeIsValid){
                //Since the filter has both dates, the before date > the after date
                const dateAfter =  moment(filter.filter.start.after)
                const dateBefore = moment(filter.filter.start.before)
                if(dateBefore.isAfter(dateAfter)){
                    hasValidStart = true
                }else{
                    errorMessages.start= "ERROR_START_DATE_INVALID_DATE_COMPARE_FILTER"

                }
            }else{
                hasValidStart = true
            }

        }else{
            errorMessages.start= "ERROR_START_DATE_INVALID_DATE_COMPARE_FILTER"
        }

    }
    if(filter.filter.startRelative && filter.filter.startRelative.value && filter.filter.startRelative.unit && filter.filter.startRelative.direction && !isNaN(filter.filter.startRelative.value)){
        hasValidStartRelative = true

    }else{
        errorMessages.startRelative= "ERROR_START_DATE_INVALID_EMPTY_FILTER"
        
    }

    // console.log("hasValidDueFilter || hasValidLabelFilter ||  hasValidPriorityFilter || hasValidStart || hasValidDueRelativeFilter",hasValidDueFilter , hasValidLabelFilter ,  hasValidPriorityFilter , hasValidStart , hasValidDueRelativeFilter)
    if(hasValidDueFilter || hasValidLabelFilter ||  hasValidPriorityFilter || hasValidStart || hasValidDueRelativeFilter || hasValidStartRelative)
    {
        return {status: true , message: errorMessages}
    }
    else{
        return {status: false , message: errorMessages}

    }
}

export function filterDueIsValid(due: any)
{
    let isValid = false
    if(!due) return false
    if(Array.isArray(due) && due.length==2 )
    {
        let dueFromValid=false
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

export function applyEventFilter(event: any, filter: TaskFilter)
{

//    console.log("filter",  filter.filter)
    if(!filter){
        //Filter is invalid.
        //Let all events through!!
        return true
    }

    if((!filter.filter)) return true
    
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

            // if ("rrule" in event && event.rrule ) {
            //     //Repeating Object
            //     var recurrenceObj = new RecurrenceHelper(event)
            //     dueDate= recurrenceObj.getNextDueDate()
            // }
    
            
            filterByDueResult = filterbyDue(filter.filter.due, dueDate)
            
            // console.log("filterbyDue 22", filter.filter.due, moment(dueDate).unix(), filterByDueResult)
        }

        if(!filterByDueResult && logic=="and"){
            return false
        }

        let filterbyPriorityResult =false
        // console.log(("priority" in filter.filter && filter.filter.priority!=null))
        if("priority" in filter.filter && filter.filter.priority!=null)
        {
            filterbyPriorityResult=filterbyPriority(filter.filter.priority,event.priority)
            // console.log(event.priority,filterbyPriorityResult)
            
           
        }

        if(!filterbyPriorityResult && logic=="and"){
            return false
        }

        let filterbyStartResult = false
        if("start" in filter.filter && filter.filter.start && "start" in event)
        {
            let startDate = event.start

            // if ("rrule" in event && event.rrule ) {
            //    //Recurring event.
            //    // We ignore the start date, because it can be way in the past.
            //    // We instead use the due date.
            //    var recurrenceObj = new RecurrenceHelper(event)
            //    startDate= recurrenceObj.getNextDueDate()

            // }

            filterbyStartResult = filterbyStart(filter.filter.start, startDate)
        }
        if(!filterbyStartResult && logic=="and"){
            return false
        }

        let filterbyDueRelativeResult = false
        if(filter.filter.dueRelative && filter.filter.dueRelative.value &&filter.filter.dueRelative.direction && filter.filter.dueRelative.unit){
            filterbyDueRelativeResult = filterbyDueRelative(filter.filter.dueRelative, event.due)
        }
        let filterbyStartRelativeResult = false
        if(filter.filter.startRelative && filter.filter.startRelative.value &&filter.filter.startRelative.direction && filter.filter.startRelative.unit ){
            filterbyStartRelativeResult = filterbyStartRelative(filter.filter.startRelative, event.start)
        }
        //if Logic is OR, we return true if any of the filters were true.
        return (filterbyPriorityResult  || filterByDueResult  || filterByLabelResult  || filterbyStartResult  || filterbyDueRelativeResult || filterbyStartRelativeResult )

 

}

/**
 * Counts the number of condition there are in a filter
 * @param {*} filter 
 */
function countConditionsinFilter(filter){

    let counter =0
    if(!checkIfFilterValid(filter)){
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
    if(filterData.dueRelative){
        counter++
    }

    if(filterData.startRelative){
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
            if(startUnix<=moment(filter_start.before).unix())
            {
                toReturn = true
            }

        }
        

        if("after" in filter_start && filter_start.after){
            if(startUnix>=moment(filter_start.after).unix())
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
            // console.log(moment(getTodaysDayEnd_ISOString()*1000).toISOString())
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

function filterbyDueRelative(dueRelativeObj, dueDate: string){
    if(!dueDate) return false
    const currentTime = moment()
    const toCompare = currentTime.add(dueRelativeObj.value, dueRelativeObj.unit.toLowerCase())
    const due =  moment(dueDate)
    if(dueRelativeObj.direction=="DUE_BEFORE"){
        return due.isBefore(toCompare)
    }else if(dueRelativeObj.direction=="DUE_AFTER"){
        return due.isAfter(toCompare)
    }
    return false
 
}
function filterbyStartRelative(startRelativeObj, startDate: string){
    if(!startDate) return false
    const currentTime = moment()
    const toCompare = currentTime.add(startRelativeObj.value, startRelativeObj.unit.toLowerCase())
    const start =  moment(startDate)
    if(startRelativeObj.direction=="TASK_STARTS_BEFORE"){
        return start.isBefore(toCompare)
    }else if(startRelativeObj.direction=="TASK_STARTS_AFTER"){
        return start.isAfter(toCompare)
    }
    return false
 
}