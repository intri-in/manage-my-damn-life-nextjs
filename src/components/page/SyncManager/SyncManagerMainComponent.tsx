import { TFunction, useTranslation } from "next-i18next"
import { useLiveQuery } from 'dexie-react-hooks';
import { db, SyncManagerDexie } from "@/helpers/frontend/dexie/dexieDB";
import { Badge, Button, Card, Col, Row, Stack } from "react-bootstrap";
import moment from "moment";
import { useAtomValue } from "jotai";
import { currentDateFormatAtom } from "stateStore/SettingsStore";
import { IS_SYNCING } from "@/helpers/frontend/localstorage";
import { SyncManager } from "@/helpers/frontend/SyncManager";
import { SYNCMANAGER_DEFAULT_MAX_RETRIES } from "@/config/constants";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { fetchLatestEventsV2 } from "@/helpers/frontend/sync";
import { useRouter } from "next/router";
import { MdOutlineDelete } from "react-icons/md";
import { deleteSyncTaskinDexie } from "@/helpers/frontend/dexie/dexie_sync_manager";
const SyncManagerMainComponent = () =>{
const {t} = useTranslation()
const syncTasks = useLiveQuery(() => db.sync_manager.toArray());
const deleteWithError = async()=>{

    db.sync_manager.filter(item => item.status=="error").filter(item=>item.type!=SyncManager.SYNC_ADD_TASK).filter(item=>item.type!=SyncManager.SYNC_EDIT_TASK).delete().catch(e =>{
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

const SyncTaskTable = ({syncTasks, t}:{syncTasks: SyncManagerDexie[] | undefined, t:TFunction}) =>{
    const dateFormat = useAtomValue(currentDateFormatAtom)
    const deleteTask = (id:string | number | undefined) =>{
        if(id) deleteSyncTaskinDexie(id)
    }
    if(!syncTasks) return <></>
    if(!Array.isArray(syncTasks)) return <></>
    if(syncTasks.length==0) return <>{t("NOTHING_TO_SHOW")}</>
    let toReturn: JSX.Element[] = []
    for(const i in syncTasks){
        const badgeColor = (syncTasks[i].status=="error") ? "danger" : "primary"
        if(!syncTasks[i].id) continue
        toReturn.push(
            <Card key={syncTasks[i].id} style={{ padding:30, width: '100%' }}>
                <Row>
                    <Col>
                    <Stack gap={2} direction="vertical">

                        <h4>{`#${syncTasks[i].id} ${syncTasks[i].summary}`}</h4> 
                        <b>{`${t("TYPE")}: `}</b>{t(syncTasks[i].type)}<br/>
                         <b>{`${t("CREATED_ON")}: `}</b>{`${moment(Number(syncTasks[i].created)).format(dateFormat)}`}<br />
                         <b>{`${t("LAST_UPDATED")}: `}</b>{`${moment(Number(syncTasks[i].updated)).format(dateFormat)}`}<br />
                         <NoOfTriesOutput type={syncTasks[i].type} retryNumber={syncTasks[i].retryNumber} t={t} />
                         <b>{`${t("DETAILS")}: `}</b><br />
                         {`${(syncTasks[i].message)}`}
                         <ResolveConflictButton id={syncTasks[i].id} type={syncTasks[i].type}  t={t} message={syncTasks[i].message}/>
                    </Stack>

                    </Col>
                    <Col  style={{ textAlign:"right"}} xs={3}>
                        <Badge bg={badgeColor}>{syncTasks[i].status}</Badge> &nbsp;
                        <MdOutlineDelete onClick={()=>deleteTask(syncTasks[i].id)} style={{color: 'red'}} />
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

const NoOfTriesOutput= ({type, retryNumber, t}:{type:string, retryNumber: string | undefined, t:TFunction}) =>{
    if(type != SyncManager.SYNC_ADD_TASK && type != SyncManager.SYNC_EDIT_TASK) return <></>
    const noOfTries = (retryNumber && !isNaN(Number(retryNumber))) ? Number(retryNumber) : 0
    const tryMessage = (noOfTries>SYNCMANAGER_DEFAULT_MAX_RETRIES) ? `(${t("TRIES_EXCEEDED_MAX_AMOUNT")})` :""
    return(
        <>
         <b>{`${t("NO_OF_TRIES")}: `}</b> {retryNumber?.toString()} {tryMessage} <br />
        </>
    )

}

const ResolveConflictButton = ({type,  t, message, id}:{type:string, t:TFunction, message? : string, id: string | number | undefined}): JSX.Element =>{
    const router = useRouter()
    const onClick = () =>{
            router.push(`sync-manager/conflict?id=${id}`)

    }
    if(!message)  return (<></>)
    if(type != SyncManager.SYNC_ADD_TASK && type != SyncManager.SYNC_EDIT_TASK) return (<></>)
    let parsedMessage
    try{
        parsedMessage = JSON.parse(message)
    }catch(e){
    }
    // console.log("parsedMessage", parsedMessage)
    if(!parsedMessage) return (<></>)
    const messageFromAPI: string = getMessageFromAPIResponse(parsedMessage)
    if(messageFromAPI.toLowerCase()=="precondition failed") return (<Button onClick={onClick} style={{maxWidth:"50%", marginTop:3}}  variant="warning">{t("RESOLVE_CONFLICT")}</Button>)
    return(<></>)

}