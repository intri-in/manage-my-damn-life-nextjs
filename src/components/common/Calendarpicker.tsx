import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie"
import { isValidResultArray } from "@/helpers/general"
import { useEffect, useState } from "react"
import { Form } from "react-bootstrap"

export const CalendarPicker = ({calendar_id, disabled, onSelectedHook}:{calendar_id:string | number,disabled?: boolean,onSelectedHook: Function}) =>{
    const [finalOutput, setFinalOutput] = useState<JSX.Element[]>([])
    useEffect(()=>{
        let isMounted =true
        if(isMounted){
            generateCalendarDDL()
        }
        return ()=>{
            isMounted=false
        }

    },[])


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
        let calendarsFromServer = await getCalDAVSummaryFromDexie()
      
        if (isValidResultArray(calendarsFromServer)) {
            calendarOutput = []
            calendarOutput.push(<option key="calendar-select-empty" ></option>)

            for (let i = 0; i < calendarsFromServer.length; i++) {
                let tempOutput: JSX.Element[] = []
                if(!isValidResultArray(calendarsFromServer[i].calendars)){
                    continue
                }
                for (let j = 0; j < calendarsFromServer[i].calendars.length; j++) {
                    const value: string = calendarsFromServer[i].calendars[j].calendars_id.toString()
                    // console.log(calendarsFromServer[i].calendars[j].calendars_id)
                    const key = j + "." + value
                    tempOutput.push(<option  key={key} style={{ background: calendarsFromServer[i].calendars[j].calendarColor }} value={value}>{calendarsFromServer[i].calendars[j].displayName}</option>)
                }
                calendarOutput.push(<optgroup key={`${calendarsFromServer[i].name}_group_${i}`} label={calendarsFromServer[i].name}>{tempOutput}</optgroup>)
                
            }
        }
        
        setFinalOutput([<Form.Select key="calendarOptions" onChange={calendarSelected} value={calendar_id} disabled={disabled} >{calendarOutput}</Form.Select>])
    }

    return(
        <div key="calendar_menu">
            {finalOutput}
        </div>
    )
}