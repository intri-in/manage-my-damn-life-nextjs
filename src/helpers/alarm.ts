import { VAlarmType } from "src/types/valarm";
import { getRandomString } from "./crypto";

export function getFormattedAlarm(alarm: any): VAlarmType | null{
    if(!alarm) return null
    if(isValidAlarmObject(alarm)) return alarm // Probably an alarm in the correct format. we just return the alarm.
    let toReturn: VAlarmType ={
        action: "DISPLAY",
        trigger: {isRelated: true,
            value: 0,
            relatedTo: "END"
        },
        description: "Reminder!",
        summary:"",
        attendees: [],
    }
   
    if("action" in alarm){
        toReturn.action=alarm.action
    }
    if("VALUE" in alarm) toReturn.trigger.value = alarm.VALUE
    if("value" in alarm) toReturn.trigger.value = alarm.value
    if("RELATED" in alarm) {
        toReturn.trigger.relatedTo = alarm.RELATED
        toReturn.trigger.isRelated = true
    }
    if("related" in alarm) {
        toReturn.trigger.relatedTo = alarm.related
        toReturn.trigger.isRelated = true
    }

    return toReturn
}

function isValidAlarmObject(alarm: any): boolean{
    if(!alarm) return false
    if(!("trigger" in alarm)) return false
    if(!("value" in alarm.trigger)) return false
    return true
}

type AlarmTypeForICSLibrary = {action: string, description: string, trigger: {minutes: number, before: boolean}}
const validActions = ["audio", "display", "email"]
export function formatAlarmArrayForICSGeneration(alarms: VAlarmType[]): AlarmTypeForICSLibrary[]{
    let finalAlarmArray:AlarmTypeForICSLibrary[] = []
    if(!alarms) return []
    if(!Array.isArray(alarms)) return []
    if(alarms.length==0) return []

    for(const i in alarms){
        try{
            const action = (alarms[i].action && validActions.includes(alarms[i].action.toLowerCase())) ? alarms[i].action.toLowerCase() : "display"
            finalAlarmArray.push({action: action, description: alarms[i].description ?? "", trigger:{
                before: (Number(alarms[i].trigger.value) <0),
                minutes: Math.abs(Number(alarms[i].trigger.value))
            } })

        }catch(e){
            console.warn("formatAlarmArrayForICSGeneration: ", e)
        }
    }

    return finalAlarmArray
}