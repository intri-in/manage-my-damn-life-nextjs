import { fetchLatestEventsV2 } from "@/helpers/frontend/sync";
import { useSetAtom } from "jotai";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "next-i18next";
import { IoSyncCircleOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { updateCalendarViewAtom, updateViewAtom } from "stateStore/ViewStore";

export const SyncButton = ({isSyncing}) =>{

    const setUpdated = useSetAtom(updateViewAtom)
    const setUpdatedCalendarView = useSetAtom(updateCalendarViewAtom)
    const {t} = useTranslation()
    const syncButtonClicked = async () => {
        await fetchLatestEventsV2()
        setUpdated(Date.now())
        setUpdatedCalendarView(Date.now())
     
    };

    const handleRightClick = (e) =>{
        e.preventDefault()
        toast.info(t("FORCE_SYNC_REQUESTED"))
        fetchLatestEventsV2(true)
        setUpdated(Date.now())
        setUpdatedCalendarView(Date.now())

    }
    if(isSyncing) return <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                
    
    return <IoSyncCircleOutline onContextMenu={handleRightClick} size={24} onClick={syncButtonClicked} />


}