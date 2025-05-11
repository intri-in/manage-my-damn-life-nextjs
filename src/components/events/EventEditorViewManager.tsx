import { useAtomValue, useSetAtom } from "jotai"
import { useState } from "react"
import { Offcanvas } from "react-bootstrap"
import { eventEditorInputAtom, showEventEditorAtom } from "stateStore/EventEditorStore"
import { EventEditorWithStateManagement } from "./EventEditorWithStateManagement"
import { DeleteEventConfirmation } from "../tasks/DeleteEventConfirmation"
import { getEventFromDexieByID } from "@/helpers/frontend/dexie/events_dexie"
import { returnGetParsedVTODO } from "@/helpers/frontend/calendar"
import { getCalDAVAccountIDFromCalendarID_Dexie } from "@/helpers/frontend/dexie/calendars_dexie"
import { EventEditorExitModal } from "../tasks/EventEditorExitModal"
import { onServerResponse_UI } from "@/helpers/frontend/TaskUI/taskUIHelpers"
import { updateCalendarViewAtom, updateViewAtom } from "stateStore/ViewStore"
import { handleDeleteEventUI } from "@/helpers/frontend/events"
import { useTranslation } from "next-i18next"

export const EventEditorViewManager =() =>{

    /**
     * Jotai
     */
    const show = useAtomValue(showEventEditorAtom)
    const setShow = useSetAtom(showEventEditorAtom)
    const setUpdateViewTime = useSetAtom(updateCalendarViewAtom)

    const eventEditorInput = useAtomValue(eventEditorInputAtom)
    const setEventEditorInput = useSetAtom(eventEditorInputAtom)
    const [changed, setChanged] = useState(false)
    const [showConfirmDialog, setShowConfimDialog] = useState(false)
    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false)
    const {t} = useTranslation()
    const eventEditorClosed = () =>{
        if(!changed){
            setShow(false)
        }else{
            setShowConfimDialog(true)
        }
    }

    
    const onChange = () =>{
        setChanged(true)
    }

    const destroy = () =>{
        setChanged(false)
        setShow(false)
        setEventEditorInput({id: null})
        setUpdateViewTime(Date.now())
    }

    const onServerResponse = (body, taskName) =>{
        onServerResponse_UI(body, taskName)
        setUpdateViewTime(Date.now())

    }
    const onDismissDeleteDialog = () =>{
        setShowConfirmDeleteDialog(false)
    }
    const eventEditModalDiscardChanges = () =>{
        setShow(false)
        setChanged(false)
        setShowConfimDialog(false)
    }

    const deleteEventFromServer = async () =>{

        if(eventEditorInput.id){

            const event = await getEventFromDexieByID(parseInt(eventEditorInput.id.toString()))
            if(event && event.length>0){
                const calendar_id = event[0].calendar_id
                const url = event[0].url
                const etag = event[0].etag
                const parsedTask = returnGetParsedVTODO(event[0].data)

                if(calendar_id){

                    const caldav_accounts_id = await getCalDAVAccountIDFromCalendarID_Dexie(calendar_id)
                    console.log("caldav_accounts_id", caldav_accounts_id)
                handleDeleteEventUI(caldav_accounts_id, calendar_id, url, etag, parsedTask?.summary, onServerResponse)
                    setShowConfirmDeleteDialog(false)
                    destroy()

                }
            }
        }


    }
    const eventEditModalDismissed = () =>{
        setShowConfimDialog(false)
        setChanged(false)
        
    }

    return(
        <>
        <Offcanvas placement='start' show={show} onHide={eventEditorClosed}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{t("EDIT_EVENT")}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
            <EventEditorWithStateManagement closeEditor={()=>destroy()} onServerResponse={onServerResponse} showDeleteDailog={()=>setShowConfirmDeleteDialog(true)} onChange={onChange} input={eventEditorInput} />
            </Offcanvas.Body>
        </Offcanvas>
        {showConfirmDialog ? <EventEditorExitModal
                            show={showConfirmDialog}
                            onHide={eventEditModalDismissed}
                            onDiscardTaskChanges={eventEditModalDiscardChanges}
                        /> : null}
        {showConfirmDeleteDialog ? <DeleteEventConfirmation
                    show={showConfirmDeleteDialog}
                    onHide={onDismissDeleteDialog}
                    onDismissDeleteDialog={onDismissDeleteDialog}
                    onDeleteOK={deleteEventFromServer}

                />
                : null}
        </>
        )

}