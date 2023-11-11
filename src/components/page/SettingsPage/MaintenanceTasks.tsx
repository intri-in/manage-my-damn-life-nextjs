import { deleteAllEventsFromDexie } from "@/helpers/frontend/dexie/events_dexie"
import { getI18nObject } from "@/helpers/frontend/general"
import { fetchLatestEventsV2 } from "@/helpers/frontend/sync"
import { Button, Col, Row } from "react-bootstrap"
import { toast } from "react-toastify"

const MaintenanceTasks = () =>{

    const i18next = getI18nObject()

    const clearEventsFromDexie = () =>{
        toast.info(i18next.t("DELETING_AND_REFRESHING_EVENTS"))
        deleteAllEventsFromDexie().then((response) =>{
            if(response){
                fetchLatestEventsV2().then((result)=>{
                    toast.success(i18next.t("DONE"))
                })
            }else{
                toast.warn(i18next.t("ERROR_GENERIC"))
            }
        })
    }
    return(
        <>
            <h2>{i18next.t("MAINTENANCE_TASKS")}</h2>
            <Row>
                <Col>
                <Button onClick={clearEventsFromDexie} variant="outline-info">{i18next.t("REFETCH_EVENTS")}</Button>                </Col>
            </Row>
        </>
    )
}

export default MaintenanceTasks