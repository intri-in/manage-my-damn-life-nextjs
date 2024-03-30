import { useAtomValue, useSetAtom } from "jotai"
import { MoveEventModal } from "./MoveEventModal"
import { moveEventModalInput, showMoveEventModal } from "stateStore/MoveEventStore"
import { toast } from "react-toastify"
import { getI18nObject } from "@/helpers/frontend/general"
import { getMessageFromAPIResponse } from "@/helpers/frontend/response"
import { updateViewAtom } from "stateStore/ViewStore"

const i18next = getI18nObject()
export const MoveEventModalViewManager = () =>{

    /**
     * Jotai
     */
    const show = useAtomValue(showMoveEventModal)
    const moveEventInput = useAtomValue(moveEventModalInput)
    const setShow = useSetAtom(showMoveEventModal)
    const setMoveEventInput = useSetAtom(moveEventModalInput)
    const setUpdateViewTime = useSetAtom(updateViewAtom)

    const handleClose =() =>{
        setShow(false)
        setMoveEventInput({id: null})
    }
    const onServerResponse = (body, taskName) =>{
        let message= getMessageFromAPIResponse(body)
        // console.log("body and message", body, message, taskName)
        const finalToast = taskName ? taskName+": ": ""
        if (body != null) {
            if (body.success == true) {

                toast.success(finalToast+i18next.t("Done")+"!")
                // if(typeof(message)==="string"){

                //     toast.success(finalToast+i18next.t(message))
                // }else{
                // }
                setUpdateViewTime(Date.now())

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
        <MoveEventModal onServerResponse={onServerResponse}  show={show} handleClose={handleClose} />
        </>
    )
}