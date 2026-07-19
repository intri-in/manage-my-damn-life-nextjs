import { TFunction, useTranslation } from "next-i18next"
import { useLiveQuery } from 'dexie-react-hooks';
import { db, SyncManagerDexie } from "@/helpers/frontend/dexie/dexieDB";
import { Badge, Button, Card, Col, Row, Stack } from "react-bootstrap";
import moment from "moment";
import { useAtomValue } from "jotai";
import { currentDateFormatAtom } from "stateStore/SettingsStore";
import { IS_SYNCING } from "@/helpers/frontend/localstorage";
const SyncManagerMainComponent = () =>{
const {t} = useTranslation()
const syncTasks = useLiveQuery(() => db.sync_manager.toArray());
const deleteWithError =()=>{
    db.sync_manager.where('status').equals("error").delete().catch(e =>{
        console.error("SyncManagerMainComponent deleteWithError",e)
    })

}
const deleteAll =()=>{
    db.sync_manager.clear().catch(e =>{
        console.error("SyncManagerMainComponent deleteAll",e)
    }).then(
        output => localStorage.setItem(IS_SYNCING,"false")
    )

}
return(
<div style={{padding:40}} className='container-fluid'>
    <h1>{t("SYNC_MANAGER")}</h1>
    <div style={{width: "100%", marginBottom:10, display:"flex", justifyContent:"right"}}>
        <Stack gap={2} direction="horizontal">
            <Button onClick={deleteWithError} variant="danger">{t("REMOVE_ALL_TASKS_WITH_ERRORS")}</Button>
            <Button onClick={deleteAll} variant="danger">{t("CLEAR_QUEUE")}</Button>
        </Stack>

    </div>
    <SyncTaskTable t={t} syncTasks={syncTasks} />
   
</div>

)
}
export default SyncManagerMainComponent

const SyncTaskTable = ({syncTasks, t}:{syncTasks: SyncManagerDexie[] | undefined, t:any}) =>{
    const dateFormat = useAtomValue(currentDateFormatAtom)
    
    if(!syncTasks) return <></>
    if(!Array.isArray(syncTasks)) return <></>
    if(syncTasks.length==0) return <>{t("NOTHING_TO_SHOW")}</>
    let toReturn: JSX.Element[] = []
    for(const i in syncTasks){
        const badgeColor = (syncTasks[i].status=="error") ? "danger" : "primary"
        toReturn.push(
            <Card key={syncTasks[i].id} style={{ padding:30, width: '100%' }}>
                <Row>
                    <Col>
                        <h4>{`#${syncTasks[i].id} ${syncTasks[i].summary}`}</h4> 
                        <b>{`${t("TYPE")}: `}</b>{syncTasks[i].type}<br/>
                         <b>{`${t("CREATED_ON")}: `}</b>{`${moment(Number(syncTasks[i].created)).format(dateFormat)}`}

                    </Col>
                    <Col xs={3}>
                        <Badge bg={badgeColor}>{syncTasks[i].status}</Badge>
                    </Col>

                </Row>
            </Card>
        )
    }

    return (
        <Stack gap={3}>
            {toReturn}
        </Stack>
        )
}