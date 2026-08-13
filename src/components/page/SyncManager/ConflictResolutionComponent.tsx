import { Loading } from "@/components/common/Loading"
import { returnGetParsedVTODO } from "@/helpers/frontend/calendar"
import { changeSyncTaskStatusinDexie, deleteSyncTaskinDexie, getSyncTaskByIdFromDexie } from "@/helpers/frontend/dexie/dexie_sync_manager"
import { db, SyncManagerDexie } from "@/helpers/frontend/dexie/dexieDB"
import { getEventbyURLFromDexie, saveEventToDexie } from "@/helpers/frontend/dexie/events_dexie"
import { getParsedEvent } from "@/helpers/frontend/events"
import { fetchLatestEventsFromCalendar, fetchLatestEventsV2 } from "@/helpers/frontend/sync"
import { SyncManager, SyncManagerAddTaskInput } from "@/helpers/frontend/SyncManager"
import { useLiveQuery } from "dexie-react-hooks"
import { useAtomValue } from "jotai"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { Fragment, useEffect, useState } from "react"
import { Alert, Button, Col, Row, Stack } from "react-bootstrap"
import { toast } from "react-toastify"
import { updateViewAtom } from "stateStore/ViewStore"

const ConflictResolutionComponent =({id}:{id: string | undefined})=>{
    const {t} = useTranslation()
    const router = useRouter()
    /**
     * Jotai
     */
    const updated = useAtomValue(updateViewAtom)

    /**
     * Local state
     */
    const [hasResolved, setHasResolved] = useState(false)
    const [output, setOutput] = useState(<Fragment key="empty"><Loading centered={true} /></Fragment>)
    const [userChanges, setUserChanges] = useState(<Fragment key="emptyuserChanges"><Loading centered={true} /></Fragment>)
    const [isLoading, setIsLoading] = useState(false)
    const [summary, setSummary] = useState("")
    const [updatedEtag, setUpdatedEtag] = useState<string | undefined>("")
    const [editEtag, setEditEtag] = useState<string | undefined>("")
    const [syncTaskFromDexie, setSyncTaskFromDexie] = useState<SyncManagerDexie[] | void | null>()
    const syncTasks = useLiveQuery(() =>  db.sync_manager.where("status").anyOf(["pending"]).count().catch(e=>{
        console.error("ConflictResolutionComponent useLiveQuery",e )
    }))

    useEffect(()=>{
        fetchConflictDataFromDB(id).then(tasks =>{
            // console.log("tasks", tasks , Array.isArray(tasks) , tasks ? tasks.length : "" , "calendars_id" in tasks[0].input )
            if(tasks && Array.isArray(tasks) && tasks.length>0 && "calendar_id" in tasks[0].input){
                fetchLatestEventsFromCalendar(tasks[0].input.calendar_id)
            }else{
                toast.error(t("ERROR_GENERIC"))
            }
        })
    },[id])
    useEffect(()=>{
        fetchConflictDataFromDB(id)
    },[updated])

    const keepServerVersion = async () =>{
        // We only delete the conflicting sync task.
        if(id){
            setIsLoading(true)
            await deleteSyncTaskinDexie(id)
            setHasResolved(true)

        }else{
            toast.error(t("ERROR_GENERIC"))
        }
    }

    const keepYourVersion = async () =>{
        if(id && syncTaskFromDexie && Array.isArray(syncTaskFromDexie) && syncTaskFromDexie.length>0 && updatedEtag){
            setIsLoading(true)
            //We push our version, but first sneakily update its etag -- even though we don't have the changes.
            //This will replace the version on the server.
            let  oldInput = syncTaskFromDexie[0].input as SyncManagerAddTaskInput
            oldInput.etag = updatedEtag
            // We also change its status to "pending" to fire it
            const res = await db.sync_manager.update(Number(id), {input: oldInput})
            if(res && res>0){
                await SyncManager.executeTask(id)
                //We also update the task/event in dexie
                await saveEventToDexie(oldInput.calendar_id, oldInput.eventURL, updatedEtag, oldInput.newData, oldInput.type)
                await deleteSyncTaskinDexie(id)
                
                // fetchConflictDataFromDB(id)
                setHasResolved(true)
            }else{
                toast.error(t("ERROR_GENERIC"))

            }
        }else{
            toast.error(t("ERROR_GENERIC"))
        }
    }
    const fetchConflictDataFromDB = async (id) =>{
        if(id){
            const task = await getSyncTaskByIdFromDexie(id)
            setSyncTaskFromDexie(task)
            if(task && Array.isArray(task) && task.length>0){
                setSummary(task[0].summary)
                if(task[0].type && task[0].type==SyncManager.SYNC_EDIT_TASK){
                    if(task[0].input && "eventURL" in task[0].input){
                        const input = task[0].input
                        const event = await getEventbyURLFromDexie(input.eventURL)
                        setUpdatedEtag(event?.etag)
                        setEditEtag(input.etag)
                        const parsedData =  (input.type=="VTODO") ? returnGetParsedVTODO(input.newData) : getParsedEvent(input.newData)
                        setUserChanges(<>{JSON.stringify(parsedData, null, 20)}</>)
                        setOutput(<>{JSON.stringify(event?.parsedData, null, 20)}</>)
                    }
                }
            return task

            }else{
                setHasResolved(true)
                setUserChanges(<></>)
                setOutput(<></>)
            }
        }

        return null
    }
    const backClicked = ()=>{
        router.push("/sync-manager")
    }
    useEffect(()=>{
        
    },[updated])
    if(!id || hasResolved) return (
        <Stack gap={3} direction="vertical">
            {t("NOTHING_TO_SHOW")}
            <Button onClick={backClicked} style={{width: "30%", alignSelf:"end"}} variant="secondary">{t("BACK")}</Button>
        </Stack>
    )
    
    return (
        <>
         {(syncTasks &&  syncTasks>0) ? <Alert variant={"warning"}>{t("SYNC_IN_PROGRESS_WAIT_FOR_CONFLICT_MANAGEMENT")}</Alert> : <></>}
         <h3>{`#${id} ${summary}`}</h3>
         <br />
         <Row>
            <Col sm={6}>
                <Stack direction="vertical">
                    <h5>{t("YOUR_EDIT_VERSION")}</h5>
                    <b>{editEtag}</b>
                    <pre>{userChanges}</pre>
                    {!isLoading ? <Button onClick={keepYourVersion}>{t("KEEP_THIS_VERSION")}</Button> : <></>}
                </Stack>
            </Col>

            <Col sm={6}>
                <Stack direction="vertical">
                    <h5>{t("SERVER_VERSION")}</h5>
                    <b>{updatedEtag}</b>
                    <pre>{output}</pre>
                    {!isLoading ? <Button onClick={keepServerVersion}>{t("KEEP_THIS_VERSION")}</Button> : <></>}
                </Stack>
            </Col>
         </Row>
        </>
    )
}

export default ConflictResolutionComponent