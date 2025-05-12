import { varNotEmpty } from "@/helpers/general"
import moment from "moment"
import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { Button, Col, Form, Row } from "react-bootstrap"
import { AiOutlineDelete } from "react-icons/ai"
import { BsAlarm } from "react-icons/bs"
import { toast } from "react-toastify"

export interface AlarmType{
    RELATED: string,
    VALUE: number | string
}
export const AlarmForm = ({alarmsArray, onChange}: {alarmsArray:AlarmType[], onChange: Function}) =>{

    const [finalOutput, setFinalOutput] = useState<JSX.Element>(<></>)
    const [alarmValue, setAlarmValue] = useState("")
    const {t} = useTranslation()
    
    useEffect(()=>{
        let isMounted =true
        if(isMounted){
            
            const alarmForm = generateOutput()
            setFinalOutput(alarmForm)
                

        }
        return ()=>{
            isMounted=false
        }
    },[alarmsArray, alarmValue])

    const alarmValueChanged = (e) =>{
        setAlarmValue(e.target.value)
    }

    const newAlarmAdded = () =>{
        let valueinSeconds = -1*parseInt(alarmValue)*60

        let found = false
        let newAlarms=[...alarmsArray]
        for (const i in alarmsArray)
        {
            if(alarmsArray[i].VALUE==valueinSeconds)
            {
                found=true
            }
        }

        if(found==false)
        {
            newAlarms.push({"RELATED": "START", "VALUE": valueinSeconds})
            onChange(newAlarms)
            setAlarmValue('')
        }else{
            toast.error(t("ALARM_ALREADY_SET"))
        }

    }

    

    const removeAlarm = (alarmtoDelete) =>{
        // console.log("alarmtoDelete", alarmtoDelete, alarmsArray)
        let newAlarms: AlarmType[] = []
        for (const i in alarmsArray)
        {
            if(parseInt(alarmsArray[i].VALUE.toString()) != parseInt(alarmtoDelete.VALUE))
            {
                newAlarms.push(alarmsArray[i])
            }
        }
        onChange(newAlarms)
    }
    const generateOutput = () =>{
        let toReturn: JSX.Element[]=[]

        if(alarmsArray.length>0)
        {
            for(const i in alarmsArray)
            {
               
                let minuteValue = (parseInt(alarmsArray[i].VALUE.toString())/60).toString()
                if(minuteValue.startsWith("-"))
                {
                    minuteValue = minuteValue.substring(1,minuteValue.length)
                }
                toReturn.push(
                <Row style={{padding:10,}}>
                    <Col className="col-9" style={{  display: 'flex', alignItems: "center", }}><BsAlarm /> &nbsp; {minuteValue} {t("ALARM_DESCRIPTION_BEFORE_START")}
                    </Col>
                    <Col style={{  display: 'flex', alignItems: "center", justifyContent:"right" }} className="col-3" > <AiOutlineDelete style={{color: "red"}} onClick={()=>removeAlarm(alarmsArray[i])}  /> </Col></Row>)
               
               
            }
        }

        toReturn.push(
        <Row style={{justifyContent: 'center', display: 'flex', alignItems: "center", }}>
            <Col className="col-4">
            <Form.Control
                type="number"
                min={0}
                value={alarmValue}
                onChange={alarmValueChanged}
            />
            </Col>
            <Col className="col-8">
            {t("ALARM_DESCRIPTION_BEFORE_START")}
            </Col>
         
        </Row>)
        toReturn.push(
        <div style={{padding : 10, textAlign: "center"}}>
            <Button size="sm" onClick={newAlarmAdded}>{t("ADD")}</Button>
        </div>)

        return (<div style={{ border: "1px solid gray", padding: 10 }}>{toReturn}</div>)

    }
    return(
        <div key="alarmInfo">
        {finalOutput}
        </div>
    )

}