import { varNotEmpty } from "@/helpers/general";
import {  getTomorrow, isValidTime } from "../general";
import moment from "moment";
import { QUICK_ADD_FORMATS, QUICK_ADD_OUTPUT_FORMATS } from "@/config/constants";

export default class QuickAdd{


    static parseSummary(taskSummary)
    {
        var toReturn={summary: taskSummary, due: "", label: [], priority: ""}

        if(varNotEmpty(taskSummary) && taskSummary!="")
        {
            
            var arrayOfWords = taskSummary.trim().split(' ')
            var valuetoRemove=""

            var parsedLabels=this.parseLabel(arrayOfWords)
            arrayOfWords= parsedLabels.arrayOfWords
            toReturn["label"]=parsedLabels.label
           
            valuetoRemove=""
            for (const i in arrayOfWords)
            {
                if(arrayOfWords[i].startsWith("!:"))
                {
                    //This is a label.

                    var possiblePriority = +arrayOfWords[i].substring(2,arrayOfWords[i].length)
                    console.log(possiblePriority)
                    if(!isNaN(possiblePriority))
                    {
                        if(possiblePriority>0 && possiblePriority<11) 
                        {
                            toReturn["priority"] =  possiblePriority.toString()
                            valuetoRemove = arrayOfWords[i]

                        }
                    }
                    continue;
                }
            }

            if(valuetoRemove!="" && varNotEmpty(valuetoRemove))
            {
                arrayOfWords = arrayOfWords.filter(function(item) {
                    return item != valuetoRemove
                })
    
            }
            valuetoRemove=""
            var parsedDue = this.parseDue(arrayOfWords)
            if(parsedDue.due!="")
            {
                toReturn["due"]=parsedDue["due"]
            }
            arrayOfWords=parsedDue.arrayOfWords

            var newSummary =""
            for(const k in arrayOfWords)
            {
                newSummary+=arrayOfWords[k]+" "
            }
            toReturn["summary"]=  newSummary.toString().trim()

        }
            
        return toReturn

    }


    /**
     * Parses user input and looks for a possible due date and time.
     * @param {*} arrayOfWords 
     * @returns Object containing due date, array of user Input (with or without due date removed)
     */
    static parseDue(arrayOfWords)
    {
        var toReturn={due: "", arrayOfWords: arrayOfWords}
        var valuetoRemove= ""
        for (let i=0; i<arrayOfWords.length; i++)
        {
            if(arrayOfWords[i]!=undefined && arrayOfWords[i]!=""&&arrayOfWords[i].startsWith("@:"))
            {
                //This is a due date.
                var possibleDue = arrayOfWords[i].substring(2,arrayOfWords[i].length)
                if(varNotEmpty(possibleDue) && possibleDue!="")
                {
                    if(possibleDue=="today" || possibleDue=="tomorrow")
                    {
                        var possibleTime=""
                        var dueDate=""
                        var dueDate=new Date(Date.now())
                        var step=0
                        if(possibleDue=="tomorrow")
                        {
                            step=1
                        }
                        dueDate.setDate(dueDate.getDate()+step)

                        dueDate=dueDate.getDate()+"/"+(dueDate.getMonth()+1)+"/"+dueDate.getFullYear()

                        //now we check if user give a time by looking at the next array element.
                        if(arrayOfWords.length>i+1)
                        {
                            if(isValidTime(arrayOfWords[i+1]))
                            {
                                possibleTime=arrayOfWords[i+1]
                                arrayOfWords= this.removeValueFromWordArray(arrayOfWords[i+1], arrayOfWords)

                            }else{
                                possibleTime="23:59"
                            }
                        }else{
                            possibleTime="23:59"

                        }

                        dueDate += " "+possibleTime
                        if(varNotEmpty(dueDate) && dueDate.toString().trim()!="")
                        {
                            toReturn["due"]= dueDate.toString().trim()
                        }

                        arrayOfWords= this.removeValueFromWordArray(arrayOfWords[i], arrayOfWords)
                        
                    }else
                    {
                        var date = moment(possibleDue, QUICK_ADD_FORMATS, true) 
                        if(date.isValid())
                        {
                            try{
                                possibleTime=""
                                date = new Date(date)
                                var dueDate=date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()
                                //now we check if user give a time by looking at the next array element.
                                if(arrayOfWords.length>i+1)
                                {
                                    if(isValidTime(arrayOfWords[i+1]))
                                    {
                                        possibleTime=arrayOfWords[i+1]
                                        arrayOfWords= this.removeValueFromWordArray(arrayOfWords[i+1], arrayOfWords)

                                    }else{
                                        possibleTime=new Date(Date.now())
                                        possibleTime=(possibleTime.getHours()+1)+":"+possibleTime.getMinutes()
                                    }
                                }else{
                                    possibleTime="23:59"

                                }
                                dueDate += " "+possibleTime
                                if(varNotEmpty(dueDate) && dueDate.toString().trim()!="")
                                {
                                    toReturn["due"]= dueDate.toString().trim()
                                }
        
                                arrayOfWords= this.removeValueFromWordArray(arrayOfWords[i], arrayOfWords)
                            }
                            catch(e)
                            {
                                console.log(e)
                                // Invalid date -- doesn't have month, or date
                                // Do nothing.
                            }

                           


                        }
                    }

        
                }
        
                continue;
            }
        }
        toReturn["arrayOfWords"]=arrayOfWords
        return toReturn
    }


    static removeValueFromWordArray(valuetoRemove, arrayOfWords)
    {
        if(valuetoRemove!="" && varNotEmpty(valuetoRemove))
        {
            arrayOfWords = arrayOfWords.filter(function(item) {
                return item != valuetoRemove
            })

        }

        return arrayOfWords

    }

    static parseLabel(arrayOfWords){
        var toReturn={label: [], arrayOfWords: arrayOfWords}


        var valuetoRemove = []
        for (const i in arrayOfWords)
        {
            if(arrayOfWords[i].startsWith("#:"))
            {
                //This is a label.
                var possibleLabel = arrayOfWords[i].substring(2,arrayOfWords[i].length)
                if(possibleLabel!="")
                {
                    toReturn["label"].push(possibleLabel)
                    valuetoRemove.push(arrayOfWords[i])

                }
            }
        }

        for (const k in valuetoRemove)
        {
            arrayOfWords = this.removeValueFromWordArray(valuetoRemove[k], arrayOfWords)
        }
        toReturn["arrayOfWords"]=arrayOfWords
        return toReturn



    }

}