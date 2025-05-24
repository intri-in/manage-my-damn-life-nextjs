import SettingsHelper from "@/helpers/frontend/classes/SettingsHelper"
import { SETTING_NAME_TOAST_LOCATION } from "@/helpers/frontend/settings"
import { useEffect, useState } from "react"
import { Col, Form, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"

const ToastSettings = () =>{

    const [locationValue, setLocationValue] = useState("BOTTOM-CENTER")
    const {t} = useTranslation()
    useEffect(()=>{
        let isMounted =true
        if(isMounted){
            SettingsHelper.getFromServer(SETTING_NAME_TOAST_LOCATION).then((response)=>{
                // console.log("response", response)
                if(response){
                    localStorage.setItem(SETTING_NAME_TOAST_LOCATION, response)
                    setLocationValue(response)
                    
                }

            })

        }
        return ()=>{
            isMounted=false
        }


    },[])

    const valueChanged = (e) =>{
        setLocationValue(e.target.checked)
        const toSave = e.target.value
        SettingsHelper.setKeyOnServer(SETTING_NAME_TOAST_LOCATION, toSave).then((response: {
            status: number,
            success: boolean,
            data: any
        })=>{
            if(response && response.status  && response.status==200){
                console.log("UPDATE_OK")
                localStorage.setItem(SETTING_NAME_TOAST_LOCATION, toSave)
            }else{
                console.error(response)
                toast.error(t("ERROR_GENERIC"))
            }
        })

    }

    return(
        <>

        <Row>
            <Col md={6}>
                {t("TOAST_POSITION")}
            </Col >
            <Col md={6}>
                <Form.Select onChange={valueChanged} value={locationValue}>
                    <option value="TOP-RIGHT">{t("TOP-RIGHT")}</option>
                    <option value="TOP-LEFT">{t("TOP-LEFT")}</option>
                    <option value="TOP-CENTER">{t("TOP-CENTER")}</option>
                    <option value="BOTTOM-RIGHT">{t("BOTTOM-RIGHT")}</option>
                    <option value="BOTTOM-LEFT">{t("BOTTOM-LEFT")}</option>
                    <option value="BOTTOM-CENTER">{t("BOTTOM-CENTER")}</option>
                    <option value="DISABLE">{t("DISABLE")}</option>

                </Form.Select>
            </Col >
        </Row>
        </>
    )
}
export default ToastSettings