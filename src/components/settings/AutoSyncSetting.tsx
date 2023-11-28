import { SYNC_DEFAULT_TIMEOUT } from "@/config/constants";
import SettingsHelper from "@/helpers/frontend/classes/SettingsHelper";
import { getI18nObject } from "@/helpers/frontend/general";
import { USER_SETTING_SYNCTIMEOUT, getSyncTimeout } from "@/helpers/frontend/settings";
import { varIsANumber } from "@/helpers/general";
import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { toast } from "react-toastify";

const i18next = getI18nObject()
export function AutoSyncSetting(){
    const [value, setValue] = useState(SYNC_DEFAULT_TIMEOUT/1000/60)
    useEffect(()=>{
        SettingsHelper.getFromServer(USER_SETTING_SYNCTIMEOUT).then((response)=>{
            // console.log("response", response)
            if(response){
                if(!isNaN(Number(response))){
                    setValue(Number(response)/1000/60)
                    localStorage.setItem(USER_SETTING_SYNCTIMEOUT, (Number(response)).toString())
                }
            }
        })
    },[])


    const formValChanges =(e) =>{
        setValue(e.target.value)
    }
    const saveSetting = () =>{
        if(varIsANumber(value)){
            SettingsHelper.setKeyOnServer(USER_SETTING_SYNCTIMEOUT, (value*1000*60).toString()).then((response: {
                status: number,
                success: boolean,
                data: any
            })=>{
                if(response && response.status  && response.status==200){
                    toast.success(i18next.t("UPDATE_OK"))
                }else{
                    console.error(response)
                    toast.error(i18next.t("ERROR_GENERIC"))
                }
            })
        }
    }

    return(
        <Row style={{display: "flex", flexWrap:"wrap", alignItems: "center"}}>
        <Col  xs={3}>
            {i18next.t("AUTO_SYNC_TIME_SETTING")}
        </Col>
        <Col  xs={6}>
        <Form.Control onChange={formValChanges} value={value} />
        </Col>
        <Col  xs={1}>
            min
        </Col>
        <Col xs={2}>
        <Button onClick={saveSetting}>Save</Button>
        </Col>
    </Row>
    )
}