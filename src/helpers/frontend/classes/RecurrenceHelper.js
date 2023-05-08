import { varNotEmpty } from "@/helpers/general";
import { RRuleHelper } from "./RRuleHelper";
import moment from "moment";
import * as _ from 'lodash'
export class RecurrenceHelper extends RRuleHelper{

    constructor(todo)
    {
        super()
        this.todo = todo
        var newObj ={}
        var newRecurrence = RecurrenceHelper.cloneRecurrence(todo.recurrences)
        this.newRecurrence = newRecurrence
        if (todo.rrule != "" && varNotEmpty(todo.rrule)) {
            var rObj = RRuleHelper.rruleToObject(todo.rrule)
            //console.log("rObj", rObj)
            var firstInstance =  _.cloneDeep(todo)
            firstInstance.due = new Date(Date.parse(todo.start))

            var key = (moment.unix(moment(firstInstance.due).unix())).format("YYYY-MM-DD")
            if(this.recurrenceHasKey(key))
            {
                
                newObj[key]=newRecurrence[key]

            }else{
                newObj[key]=this.removeRecurrenceKey(firstInstance)

            }

            if (rObj.FREQ != "" && varNotEmpty(rObj.FREQ)) {
                if (rObj.UNTIL != "" && varNotEmpty(rObj.UNTIL)) {

                    var until = new Date(moment(rObj.UNTIL).unix()*1000)

                } else {
                    var untilDays = 365
                    if (rObj.FREQ == "MONTHLY") {
                        untilDays = untilDays*2
                    } else if (rObj.FREQ === "YEARLY") {
                        untilDays = untilDays * 10
                    }



                    var until = new Date(Date.now()+86400*1000*untilDays)
                }

                var nextDue = new Date(Date.parse(todo.start))
                //nextDue.setDate(nextDue.getDate() - 1)

                while(Date.parse(nextDue)<Date.parse(until)){
                    if (rObj.FREQ == "DAILY") {
                        nextDue.setDate(nextDue.getDate() + 1)
    
                    } else if (rObj.FREQ == "WEEKLY") {
                        nextDue.setDate(nextDue.getDate() + 7)
    
                    } else if (rObj.FREQ == "MONTHLY") {
                        nextDue.setMonth(nextDue.getMonth() + 1)
    
                    } else if (rObj.FREQ === "YEARLY") {
                        nextDue.setFullYear(nextDue.getYear() + 1)
    
                    }

                    var newInstance = _.cloneDeep(todo)
                    newInstance.due = new Date(Date.parse(nextDue))
                    var key = moment(newInstance.due).format("YYYY-MM-DD")
                    if(this.recurrenceHasKey(key))
                    {
                        newObj[key]=newRecurrence[key]

                    }else{
                        newObj[key]=this.removeRecurrenceKey(newInstance)

                    }
  
                }
            }
        }

        //console.log(newObj)
        this.newObj=newObj
    }

    recurrenceHasKey(key)
    {
        var found = false
        for (const i in this.newRecurrence)
        {
            if(i==key)
            {
                return true
            }
        }

        return found
    }

    removeRecurrenceKey(instance)
    {
        var final = {}
        for (const i in instance)
        {
            if(i!="recurrences")
            {
                final[i]=instance[i]
            }
        }
        return final
    }

    getNextDueDate()
    {
        for(const i in this.newObj)
        {
           // console.log(i, this.state.data.recurrences[i])
            if(this.newObj[i].completed==null || (varNotEmpty(this.newObj[i].completed!=null) && this.newObj[i].completed==""))
            {
                return this.newObj[i].due
            }
        }

    }

    setPropertyOfInstance(property, value, instanceKey)
    {
        var editedObj = _.cloneDeep(this.newObj)
        editedObj[instanceKey][property]=value

        this.newObj = editedObj

    }

    /**
     * VTODO parser assigns wrong date (1 day lesser than it should be) in keys to recurrence object.
     * We copy the recurrence object, but add 1 day to all they keys.
     * @param {*} recurrences 
     */
    static cloneRecurrence(recurrences)
    {
        var newObject = {}
        for(const i in recurrences)
        {
            var newDate = new Date(i)
            newDate.setDate(newDate.getDate() + 1)
            var newKey = moment(newDate).format("YYYY-MM-DD")

            newObject[newKey]=_.cloneDeep(recurrences[i])
        }
        return newObject
    }

    static subtractDayFromKey(key)
    {
        var newDate = new Date(key)
        newDate.setDate(newDate.getDate() + 1)
        var keyToCheck = moment(newDate).format("YYYY-MM-DD")
        return keyToCheck
    }

}