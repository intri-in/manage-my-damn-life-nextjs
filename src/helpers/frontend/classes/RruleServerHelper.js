import { getAPIURL, logError, logVar, varNotEmpty } from "@/helpers/general"
import { RRuleHelper } from "./RRuleHelper"
import { getAuthenticationHeadersforUser } from "../user"
import moment from "moment"
import * as _ from 'lodash'
import { getMessageFromAPIResponse } from "../response"
import axios from "axios"
import { headers } from "../../../../next.config"
import { getErrorResponse } from "@/helpers/errros"


const default_RepeatMeta_instance = { done: false, due: "" }

export default class RruleServerHelper extends RRuleHelper {

    constructor(startDate, rrule) {
        super()
        
        var serverObj = []
        if (rrule != "" && varNotEmpty(rrule)) {
            var rObj = RruleServerHelper.rruleToObject(rrule)
            //console.log("rObj", rObj)
            var firstInstance =  _.cloneDeep(default_RepeatMeta_instance)
            firstInstance.due = new Date(Date.parse(startDate))

            serverObj.push(firstInstance)

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

                var nextDue = new Date(Date.parse(startDate))
 
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

                    var newInstance = _.cloneDeep(default_RepeatMeta_instance)
                    newInstance.due = new Date(Date.parse(nextDue))
                    serverObj.push(newInstance)
  
                }
            }
        }
        //console.log(serverObj)
        this.serverObj = serverObj
    }

    static async getRepeatRuleFromServer(calendar_event_id) {
        const url_api = getAPIURL() + "tasks/rrule/getrepeatobj?calendar_event_id=" + calendar_event_id
        const authorisationData = await getAuthenticationHeadersforUser()

        const requestOptions =
        {
            method: 'GET',
            mode: 'cors',
            headers: new Headers({ 'authorization': authorisationData }),

        }

        return new Promise((resolve, reject) => {
                const response = fetch(url_api, requestOptions)
                .then(response => {
                    return response.json()
                })
                .then((body) => {
                    throw new Error("asdasd")
                    return resolve(body)
                }).catch(e =>{
                console.error("getRepeatRuleFromServer", e)
                return resolve(getErrorResponse(e))
                })

        })


    }

    static async postRepeatRule(calendar_event_id, value)
    {
        const url_api = getAPIURL() + "tasks/rrule/postrepeatobj"

        const authorisationData = await getAuthenticationHeadersforUser()
        var updated = Math.floor(Date.now() / 1000)
        /*
        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({ "calendar_event_id": calendar_event_id, "value": value}),
            mode: 'cors',
            headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        }
        try {
            fetch(url_api, requestOptions)
                .then(response => response.json())
                .then((body) => {
                    //console.log(body)
                    var message = getMessageFromAPIResponse(body)
                    logVar(message,"RruleServerHelper.postRepeatRule")
                });
        }
        catch (e) {
            logError(e, "RruleServerHelper.postRepeatRule")
        }


        */
        axios({
            method: 'post',
            url: getAPIURL() + "tasks/rrule/postrepeatobj",
            data: {
                calendar_event_id: calendar_event_id,
              value: value
            },
            headers: { 'authorization': authorisationData, 'Content-Type': 'application/json' }
          }).then(function (response) {
          
            return(response)
         }).catch(function (error) {
            console.error("postRepeatRule", error);
            return (getErrorResponse(e))

          });

     

    }



}