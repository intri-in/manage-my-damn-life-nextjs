import { deleteAllEventsFromDexie } from "@/helpers/frontend/dexie/events_dexie"
import { fetchLatestEventsV2 } from "@/helpers/frontend/sync"
import { Button, Col, Row } from "react-bootstrap"
import { useTranslation } from "next-i18next"
import { toast } from "react-toastify"

const MaintenanceTasks = () =>{
    const {t} = useTranslation()

    const clearEventsFromDexie = () =>{
        toast.info(t("DELETING_AND_REFRESHING_EVENTS"))
        fetchLatestEventsV2(true).then((result)=>{
            toast.success(t("DONE"))
        })
    }
    return(
        <>
            <h2>{t("MAINTENANCE_TASKS")}</h2>
            <Row>
                <Col>
                <Button onClick={clearEventsFromDexie} variant="outline-info">{t("REFETCH_EVENTS")}</Button>                </Col>
            </Row>
        </>
    )
}

export default MaintenanceTasks