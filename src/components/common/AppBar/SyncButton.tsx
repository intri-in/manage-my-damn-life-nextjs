import { fetchLatestEventsV2 } from "@/helpers/frontend/sync";
import { useSetAtom } from "jotai";
import {  ContextMenu, ContextMenuItem, ContextMenuTrigger } from 'rctx-contextmenu';
import { Spinner } from "react-bootstrap"
import { IoSyncCircleOutline } from "react-icons/io5"
import { updateCalendarViewAtom, updateViewAtom } from "stateStore/ViewStore";

export const SyncButton = ({isSyncing}) =>{

    const setUpdated = useSetAtom(updateViewAtom)
    const setUpdatedCalendarView = useSetAtom(updateCalendarViewAtom)

    const syncButtonClicked = async () => {
        await fetchLatestEventsV2()
        setUpdated(Date.now())
        setUpdatedCalendarView(Date.now())
     
    };
    if(isSyncing) return <Spinner animation="border" size="sm" role="status" aria-hidden="true" />

    if(typeof(window)!="undefined"){
        return(
            <>
            <ContextMenuTrigger id="RIGHTCLICK_MENU_SYNC_BUTTON_TRIGGER" >
                <div>
                <IoSyncCircleOutline size={24} onClick={syncButtonClicked} />
                </div>
            </ContextMenuTrigger>
            <ContextMenu id="RIGHTCLICK_MENU_SYNC_BUTTON" key={"RIGHTCLICK_MENU_SYNC_BUTTON"} >
                <ContextMenuItem>sad</ContextMenuItem>
            </ContextMenu>
            </>
        
        )
    }
   

}