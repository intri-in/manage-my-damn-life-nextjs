import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie"
import { isValidResultArray } from "@/helpers/general"
import { useEffect, useState } from "react"
import { Form } from "react-bootstrap"

type type = "event" | "task" 

export const CalendarPicker = ({calendar_id, disabled, onSelectedHook, type}:{calendar_id:string | number,disabled?: boolean,onSelectedHook: Function, type?: type}) =>{
    const [finalOutput, setFinalOutput] = useState<JSX.Element[]>([])
   

    useEffect(()=>{
        let isMounted =true
        if(isMounted){
            generateCalendarDDL()
        }
        return ()=>{
            isMounted=false
        }

    },[calendar_id])

    const calendarSelected = (e) =>{
        onSelectedHook(e.target.value)
    }
    const generateCalendarDDL = async() =>{
        let calendarOutput: JSX.Element[]= []
        let caldavSummary_fromDexie = await getCalDAVSummaryFromDexie()
        
        if (isValidResultArray(caldavSummary_fromDexie)) {

            for (let i = 0; i < caldavSummary_fromDexie.length; i++) {
                let tempOutput: JSX.Element[] = []
                if(!isValidResultArray(caldavSummary_fromDexie[i].calendars)){
                    continue
                }
                if(type=="task"){
                    //we must skip unsupported calendars.
                    if(caldavSummary_fromDexie[i].authMethod?.toUpperCase()=="OAUTH" && caldavSummary_fromDexie[i].provider?.toUpperCase()=="GOOGLE"){
                        continue
                    }
                }
                for (let j = 0; j < caldavSummary_fromDexie[i].calendars.length; j++) {
                    const value: string | undefined = caldavSummary_fromDexie[i]?.calendars[j]?.calendars_id?.toString()
                    // console.log(caldavSummary_fromDexie[i].calendars[j].calendars_id)
                    const key = j + "." + value
                    tempOutput.push(<option  key={key} style={{ background: caldavSummary_fromDexie[i].calendars[j].calendarColor }} value={value}>{caldavSummary_fromDexie[i].calendars[j].displayName}</option>)
                }
                calendarOutput.push(<optgroup key={`${caldavSummary_fromDexie[i].name}_group_${i}`} label={caldavSummary_fromDexie[i].name}>{tempOutput}</optgroup>)
                
            }
        }
        if (calendarOutput.length>0) calendarOutput = [<option key="calendar-select-empty" ></option>, ...calendarOutput]
        
        setFinalOutput([<Form.Select key="calendarOptions" onChange={calendarSelected} value={calendar_id} disabled={disabled} >{calendarOutput}</Form.Select>])
    }

    return(
        <div key="calendar_menu">
            {finalOutput}
        </div>
    )
}