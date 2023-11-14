import { toast } from "react-toastify"
import { getI18nObject } from "./general"
import { getMessageFromAPIResponse } from "./response"

export function taskSubmitted(body: {success: boolean, data: {message: string }} | null, fetchEvents: Function) {
    const i18next = getI18nObject()

    const message = getMessageFromAPIResponse(body)
    if (body != null) {
        if (body.success == true) {
            if(message){

                toast.success(i18next.t(message))
            }
            fetchEvents()
        }
        else {
            if(message){

                toast.error(i18next.t(message))
            }else{
                toast.error(i18next.t("ERROR_GENERIC"))
            }

        }
    }
   
}