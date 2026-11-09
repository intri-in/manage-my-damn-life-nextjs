import { VAlarmTrigger, VAlarmType } from "src/types/valarm";
import { getRandomString } from "./crypto";
import { parseRFCDuration, RFCValidActions } from "./frontend/rfc";
import { RFCDuration, RFCDurationUnit } from "src/types/rfc";
const VALID_ALARM_UNITS=["minutes", "hours", "days", "weeks"]
export function getFormattedAlarm(alarm: any): VAlarmType | null{
    if(!alarm) return null
    // console.log("isValidAlarmObject(alarm)", alarm, isValidAlarmObject(alarm))
    if(isValidAlarmObject(alarm)) return alarm // Probably an alarm in the correct format. we just return the alarm.
    let toReturn: VAlarmType ={
        action: "DISPLAY",
        trigger: {
            isRelated: true,
            value: 0,
            unit: "minutes",
            relatedTo: "START"
        },
        description: "Reminder!",
        summary:"",
        attendees: [],
    }
   
    if("trigger" in alarm && alarm.trigger){
        if(typeof(alarm.trigger)==="object"){
            let data: RFCDuration | null = null
            if(("val" in alarm.trigger)){
                
                data = getValueAndUnit(alarm.trigger.val, alarm.trigger)
                if(data){
                    toReturn.trigger.unit=data.unit
                    toReturn.trigger.value=data.value
                }
                // console.log("val typeof(alarm.trigger.val", typeof(alarm.trigger.val), data)
            }else if("value" in alarm.trigger){
                let value = (typeof(alarm.trigger.val)==="string") ? Number(alarm.trigger.value) : alarm.trigger.value
                data = getValueAndUnit(value, alarm.trigger)
                // console.log("val typeof(alarm.trigger.val", typeof(alarm.trigger.val), data)
                
            }
            if(data){
                    toReturn.trigger.unit=data.unit
                    toReturn.trigger.value=data.value
                    return toReturn
            }
        }else if(typeof(alarm.trigger)==="string"){
            const possibleDuration =  parseRFCDuration(alarm.trigger)
            // console.log("possibleDuration", possibleDuration)
            if(possibleDuration && possibleDuration.value){
                toReturn.trigger.value = possibleDuration.value
                toReturn.trigger.unit = possibleDuration.unit
            }
        }
    }else{
        return null
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

function getValueAndUnit(input: string | number, trigger: VAlarmTrigger): RFCDuration | null {
    if(!input) return null
    let value = (typeof(input)==="string") ? Number(input) : input
    let toReturn: RFCDuration = {unit: "minutes", value : 0}

    if(!isNaN(value))
    {   
        toReturn.value = value
        if("unit" in trigger){
            toReturn.unit = trigger.unit
        }else{
            toReturn.unit = "minutes"
        }
        return toReturn
    }else{
        //We first assume the value is a string consistent with RFC Format.
        if(typeof(input)==="string"){
            const possibleDuration =  parseRFCDuration(input)
            // console.log("possibleDuration", possibleDuration)
            if(possibleDuration && possibleDuration.value){
                toReturn.value = possibleDuration.value
                toReturn.unit = possibleDuration.unit
                return toReturn
            }else{
                return null
            }
        }else{
            // No idea what the object is. We skip the alarm.
            return null
        }
    }
}
function isValidAlarmObject(alarm: any): boolean{
    if(!alarm) return false
    if(!("description" in alarm)) return false
    
    if(!("trigger" in alarm)) return false

    if(typeof(alarm.trigger)!=="object") return false
    if(!("value" in alarm.trigger)) return false
    if(!alarm.trigger.value) return false
    if(!(typeof(alarm.trigger.value)==="string" || typeof(alarm.trigger.value)==="number")) return false
    if(typeof(alarm.trigger.value)==="string" && isNaN(Number(alarm.trigger.value))) return false    
    if(!("unit" in alarm.trigger)) return false
    if(!alarm.trigger.unit) return false
    if(!VALID_ALARM_UNITS.includes(alarm.trigger.unit.toLowerCase())) return false

    return true
}

type AlarmTypeForICSLibrary = {action: string, description: string, trigger: {weeks?: number, hours?: number, minutes?: number, days?: number, before: boolean}}
export function formatAlarmArrayForICSGeneration(alarms: VAlarmType[]): AlarmTypeForICSLibrary[]{
    let finalAlarmArray:AlarmTypeForICSLibrary[] = []
    if(!alarms) return []
    if(!Array.isArray(alarms)) return []
    if(alarms.length==0) return []
    for(const i in alarms){
        try{
            const action = (alarms[i].action && RFCValidActions.includes(alarms[i].action.toLowerCase())) ? alarms[i].action.toLowerCase() : "display"
            let finalAlarm: AlarmTypeForICSLibrary = {
                action: action, 
                description: alarms[i].description ?? "", 
                trigger:{
                    before: (Number(alarms[i].trigger.value) <0),
                } 
            }
            
            switch(alarms[i].trigger.unit as RFCDurationUnit){
                case "minutes":
                    finalAlarm.trigger.minutes = alarms[i].trigger.value ? Math.abs(Number(alarms[i].trigger.value)): 0
                    break;
                case "hours":
                    finalAlarm.trigger.hours = alarms[i].trigger.value ? Math.abs(Number(alarms[i].trigger.value)): 0
                    break;
                case "days":
                    finalAlarm.trigger.days = alarms[i].trigger.value ? Math.abs(Number(alarms[i].trigger.value)): 0
                    break;
                case "weeks":
                    finalAlarm.trigger.weeks = alarms[i].trigger.value ? Math.abs(Number(alarms[i].trigger.value)): 0
                    break;
            }
            finalAlarmArray.push(finalAlarm)

        }catch(e){
            console.warn("formatAlarmArrayForICSGeneration: ", e)
        }
    }

    return finalAlarmArray
}

export function getAlarmsFromParsedEvent(parsedEvent: any): VAlarmType[]{
    let toReturn: VAlarmType[] = []
    if(!parsedEvent) return toReturn
    for (const k  of Object.keys(parsedEvent)){
        if(parsedEvent[k] && typeof(parsedEvent[k])==="object"){
            if("type" in parsedEvent[k] && parsedEvent[k].type && parsedEvent[k].type=="VALARM"){
                const newAlarm =  getFormattedAlarm(parsedEvent[k])
                if(newAlarm){
                    toReturn.push(newAlarm)
                }
            } 
        }
    }
    return toReturn

}