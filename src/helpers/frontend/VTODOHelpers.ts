
import { vAlarm } from '@/types/valarm';

function parseVAlarmTime(time:string){
    if(time){
        if(!isNaN(parseInt(time))){
            return time
        }
        const match = time.match(/-?\d+/);
        let multiplier = (time.startsWith("-")) ? -1 : 1
        // console.log("match", match)
        if(time.endsWith("D")){
            multiplier= 1440*multiplier
        }
        if(time.endsWith("S")){
            multiplier= multiplier/60
        }
        return (match!=null) ? (multiplier * parseInt(match[0], 10)) : "";
    }

    return ""
}

export function getParsedAlarmsFromTodo(parsedDataRow): vAlarm[]{
    let toReturn: vAlarm[] = []
    try{
        // console.log("parsedDataRow type", parsedDataRow.type)
        if(parsedDataRow && "type" in parsedDataRow){
            for(const k in parsedDataRow){
                if(parsedDataRow[k].type=="VALARM") {
                    if("action" in parsedDataRow[k]){
                        let trigger =("trigger" in parsedDataRow[k] ) ? parsedDataRow[k].trigger: null
                        // console.log("trigger", trigger)
                        if(trigger){
                            let value: string| number =""
                            let relatedTo = "END" 
                            if(typeof(trigger)==="string"){
                                //Assume it is of the type PTM
                                value=parseVAlarmTime(trigger)
                                //Thunderbird does this when the trigger is related to the start time.
                                relatedTo="START"
                            }else{
                                if("val" in trigger){
                                    value = parseVAlarmTime(trigger.val!)
                                }
                                if("relatedto" in trigger["params"]){
                                    relatedTo = trigger.relatedTo.toUpperCase()
                                }

                                if("related" in trigger["params"]){
                                    relatedTo = trigger.relatedTo.toUpperCase()
                                }

                            }
                            // console.log("value", value, (value!=""))
                            toReturn.push({
                                action:parsedDataRow[k]["action"].toString(),
                                trigger:{isRelated:true, value:value, relatedTo:relatedTo},
                                description:("description" in parsedDataRow[k]) ? parsedDataRow[k].description : "",
                                summary:("summary" in parsedDataRow[k]) ? parsedDataRow[k].summary : "",

    
                            })

                        }
                      
                    // console.log("input", input[i])
                    // let trigger =input[i].trigger 
                    // let value ="" 
                    // if(typeof(input[i].trigger)==="string"){
                    //     //Assume it is of the type PTM
                    // }else{
                    //     if("val" in input[i].trigger){
                    //         value = parseInt(input[i].trigger.val!)
                    //     }
                    // }

                    // toReturn.push(parsedDataRow[k])
                    }    
                }
            }
        }
    }catch(e){
        console.error("getParsedAlarmsFromTodo", e)
    }
    // console.log('toReturn', toReturn)
    return toReturn
}