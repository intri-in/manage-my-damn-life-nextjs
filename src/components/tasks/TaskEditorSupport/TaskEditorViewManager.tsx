import { useAtomValue, useSetAtom } from "jotai"
import { Offcanvas } from "react-bootstrap"
import { showTaskEditorAtom, taskEditorInputAtom } from "stateStore/TaskEditorStore"
import { TaskEditorWithStateManagement } from "./TaskEditorWithStateManagement"
import { useState } from "react"
import { TaskEditorExitModal } from "../TaskEditorExitModal"
import { TaskDeleteConfirmation } from "../TaskDeleteConfirmation"
import { getMessageFromAPIResponse } from "@/helpers/frontend/response"
import { toast } from "react-toastify"
import { getI18nObject } from "@/helpers/frontend/general"
import { updateViewAtom } from "stateStore/ViewStore"
import { handleDeleteEventUI } from "@/helpers/frontend/events"
import { getCaldavAccountIDFromCalendarID } from "@/helpers/api/cal/calendars"
import { getCalDAVAccountIDFromCalendarID_Dexie } from "@/helpers/frontend/dexie/calendars_dexie"
import { getEventFromDexieByID } from "@/helpers/frontend/dexie/events_dexie"
import { returnGetParsedVTODO } from "@/helpers/frontend/calendar"

/**
 * This is the common view manager for Task manager.
 * This will manage whether task editor is being shown or not, and what task is being
 * edited
 */
const i18next = getI18nObject()
export const TaskEditorViewManager = () =>{
    /**
     * Jotai
     */
    const show = useAtomValue(showTaskEditorAtom)
    const taskEditorInput = useAtomValue(taskEditorInputAtom)
    
    const setShow = useSetAtom(showTaskEditorAtom)
    const setTaskEditorInput = useSetAtom(taskEditorInputAtom)
    const setUpdateViewTime = useSetAtom(updateViewAtom)
    /**
     * Local State
    */
    const [changed, setChanged] = useState(false)
    const [showConfirmDialog, setShowConfimDialog] = useState(false)
    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false)

   
    const taskEditorClosed = () =>{
        if(!changed){
            setShow(false)
        }else{
            setShowConfimDialog(true)
        }
    }

    
    const onChange = () =>{
        setChanged(true)
    }
    const taskEditModalDismissed = () =>{
        setShowConfimDialog(false)
        setChanged(false)
        
    }
    const taskEditModalDiscardChanges = () =>{
        setShow(false)
        setChanged(false)
        setShowConfimDialog(false)
    }
    const onDismissDeleteDialog = () =>{
        setShowConfirmDeleteDialog(false)
    }
    const deleteTheTaskFromServer = async () =>{

        if(taskEditorInput.id){

            const event = await getEventFromDexieByID(parseInt(taskEditorInput.id.toString()))
            if(event && event.length>0){
                const calendar_id = event[0].calendar_id
                const url = event[0].url
                const etag = event[0].etag
                const parsedTask = returnGetParsedVTODO(event[0].data)

                if(calendar_id){

                    const caldav_accounts_id = await getCalDAVAccountIDFromCalendarID_Dexie(calendar_id)
                    // console.log("caldav_accounts_id", caldav_accounts_id)
                    handleDeleteEventUI(caldav_accounts_id, calendar_id, url, etag, parsedTask?.summary, onServerResponse)
                    setShowConfirmDeleteDialog(false)
                    destroy()

                }
            }
        }


    }
    const destroy = () =>{
        setChanged(false)
        setShow(false)
        setTaskEditorInput({id: null})
        setUpdateViewTime(Date.now())
    }
    const onServerResponse = (body, taskName) =>{
        let message= getMessageFromAPIResponse(body)
        // console.log("body and message", body, message, taskName)
        const finalToast = taskName ? taskName+": ": ""
        if (body != null) {
            if (body.success == true) {
                if(typeof(message)==="string"){

                    toast.success(finalToast+i18next.t(message))
                }else{
                    toast.success(finalToast+i18next.t("Done")+"!")
                }
            }
            else {
                if(message){

                    toast.error(message)
                }else{
                    toast.error(finalToast+i18next.t("ERROR_GENERIC"))
                }
                
            }
        }
    }
    
    return(
    <>
    <Offcanvas placement='end' show={show} onHide={taskEditorClosed}>
        <Offcanvas.Header closeButton>
            <Offcanvas.Title>Edit Task</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
        <TaskEditorWithStateManagement closeEditor={()=>destroy()} onServerResponse={onServerResponse} showDeleteDailog={()=>setShowConfirmDeleteDialog(true)} onChange={onChange} input={taskEditorInput} />
        </Offcanvas.Body>
    </Offcanvas>
    {showConfirmDialog ? <TaskEditorExitModal
                        show={showConfirmDialog}
                        onHide={taskEditModalDismissed}
                        onDiscardTaskChanges={taskEditModalDiscardChanges}
                    /> : null}
    {showConfirmDeleteDialog ? <TaskDeleteConfirmation
                    show={showConfirmDeleteDialog}
                    onHide={onDismissDeleteDialog}
                    onDismissDeleteDialog={onDismissDeleteDialog}
                    onDeleteOK={deleteTheTaskFromServer}

                />
            : null}
    </>
    )
}