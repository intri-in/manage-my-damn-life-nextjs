import SettingsHelper from "@/helpers/frontend/classes/SettingsHelper"
import { SETTING_NAME_DATE_FORMAT, SETTING_NAME_TIME_FORMAT } from "@/helpers/frontend/settings"
import { useSetAtom } from "jotai"
import moment from "moment"
import { useEffect, useState } from "react"
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap"
import { useTranslation } from "next-i18next"
import { toast } from "react-toastify"
import { currentSimpleDateFormatAtom, currentSimpleTimeFormatAtom } from "stateStore/SettingsStore"

export const TimeFormatSetting = () =>{

    /**
     * Jotai
     */
    const setTimeFormatJotai = useSetAtom(currentSimpleTimeFormatAtom)
    const setDateFormatJotai = useSetAtom(currentSimpleDateFormatAtom)

    const [dateFormat, setDateFormat] = useState('')
    const [timeFormat, setTimeFormat]= useState('')

    const{t} = useTranslation()
    useEffect(()=>{
        let isMounted =true
        if(isMounted){
            SettingsHelper.getFromServer(SETTING_NAME_DATE_FORMAT).then((response)=>{
                // console.log("response", response)
                if(response){
                    localStorage.setItem(SETTING_NAME_DATE_FORMAT, response)
                    setDateFormat(response)
                }else{
                    setDateFormat("DD/MM/YYYY")

                }
            })

            SettingsHelper.getFromServer(SETTING_NAME_TIME_FORMAT).then((response)=>{
                // console.log("response", response)
                if(response){
                    localStorage.setItem(SETTING_NAME_TIME_FORMAT, response)
                    setTimeFormat(response)
                }else{
                    setTimeFormat("HH:mm")

                }
            })
        }
        return ()=>{
            isMounted=false
        }


    },[])
    const dateFormatInputChanged = (e) =>{
        setDateFormat(e.target.value)
    }
    const saveDateTimeFormatSetting = () =>{
            SettingsHelper.setKeyOnServer(SETTING_NAME_DATE_FORMAT, dateFormat).then((response: {
                status: number,
                success: boolean,
                data: any
            })=>{
                if(response && response.status  && response.status==200){
                    toast.success(t("DATE_FORMAT")+": "+t("UPDATE_OK"))
                    setDateFormatJotai(dateFormat)
                    localStorage.setItem(SETTING_NAME_DATE_FORMAT, dateFormat)
                }else{
                    console.error(response)
                    toast.error(t("DATE_FORMAT")+": "+t("ERROR_GENERIC"))
                }
            })

            SettingsHelper.setKeyOnServer(SETTING_NAME_TIME_FORMAT, timeFormat).then((response: {
                status: number,
                success: boolean,
                data: any
            })=>{
                if(response && response.status  && response.status==200){
                    toast.success(t("TIME_FORMAT")+": "+t("UPDATE_OK"))
                    setTimeFormatJotai(timeFormat)
                    localStorage.setItem(SETTING_NAME_TIME_FORMAT, timeFormat)

                }else{
                    console.error(response)
                    toast.error(t("TIME_FORMAT")+": "+t("ERROR_GENERIC"))

                }
            })

    }

    return(
        <>
        <p style={{fontSize:15, textAlign: "center"}}>
            <b>{t("SAMPLE_CURRENT_TIME")}: </b>{moment().format(dateFormat+" "+timeFormat)}
        </p>
        <p>
           <a target="_blank" href="https://momentjs.com/docs/#/displaying/format/">Formatting Tips</a>
        </p>
        <Row style={{display: "flex", flexWrap:"wrap", alignItems: "center"}}>
            <Col  lg={6}>
            <InputGroup style={{display:"flex", justifyContent:"center", alignContent:"center"}} className="mb-3">
                <InputGroup.Text> {t("DATE_FORMAT")}</InputGroup.Text>
                <Form.Control onChange={dateFormatInputChanged} value={dateFormat} />
            </InputGroup>
            </Col>
            <Col  lg={6}>
            <InputGroup style={{display:"flex", justifyContent:"center", alignContent:"center"}} className="mb-3">
            <InputGroup.Text>{t("TIME_FORMAT")} </InputGroup.Text>
                <Form.Control onChange={(e)=>setTimeFormat(e.target.value)} value={timeFormat} />
            </InputGroup>

            </Col>
        </Row>
        <div style={{textAlign:"center"}}>
        <Button onClick={saveDateTimeFormatSetting}>Save</Button>
        </div>
        <br />
      
        </>
    )
}