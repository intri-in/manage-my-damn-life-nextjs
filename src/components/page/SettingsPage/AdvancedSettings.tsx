import SettingsHelper from "@/helpers/frontend/classes/SettingsHelper"
import { deleteAllEventsFromDexie } from "@/helpers/frontend/dexie/events_dexie"
import { SETTING_NAME_NUKE_DEXIE_ON_LOGOUT } from "@/helpers/frontend/settings"
import { fetchLatestEventsV2 } from "@/helpers/frontend/sync"
import { useEffect, useState } from "react"
import { Button, Col, Form, Row } from "react-bootstrap"
import { useTranslation } from "next-i18next"
import { toast } from "react-toastify"

const AdvancedSettings = () =>{

    const [nukeDexie, setNukeDexie] = useState(false)
    const {t} = useTranslation()
    const valueChanged = (e) =>{
        setNukeDexie(e.target.checked)
        const toSave = e.target.checked.toString().toUpperCase()
        SettingsHelper.setKeyOnServer(SETTING_NAME_NUKE_DEXIE_ON_LOGOUT, toSave).then((response: {
            status: number,
            success: boolean,
            data: any
        })=>{
            if(response && response.status  && response.status==200){
                toast.success(t("UPDATE_OK"))
                localStorage.setItem(SETTING_NAME_NUKE_DEXIE_ON_LOGOUT, toSave)
            }else{
                console.error(response)
                toast.error(t("ERROR_GENERIC"))
            }
        })

    }
    useEffect(()=>{
        let isMounted =true
        if(isMounted){
            SettingsHelper.getFromServer(SETTING_NAME_NUKE_DEXIE_ON_LOGOUT).then((response)=>{
                // console.log("response", response)
                if(response){
                    localStorage.setItem(SETTING_NAME_NUKE_DEXIE_ON_LOGOUT, response)
                    if(response.toUpperCase()=="TRUE"){

                        setNukeDexie(true)
                    }else{
                        setNukeDexie(false)
                    }
                }

            })

        }
        return ()=>{
            isMounted=false
        }


    },[])


    return(
        <>
            <h2>{t("ADVANCED_SETTINGS")}</h2>
            <Row>
                <Col>
                {t("NUKE_DEXIE_ON_LOGOUT")}<br/>
                </Col>
                <Col>
                <Form.Check // prettier-ignore
            type="switch"
            style={{border: "black"}}
            checked={nukeDexie}
            onChange={valueChanged}
            id={`default-nukedexie_checkbox`}
            
          />                
                          <small>{t("NUKE_DEXIE_ON_LOGOUT_DESC")}</small>
</Col>
            </Row>
        </>
    )
}

export default AdvancedSettings