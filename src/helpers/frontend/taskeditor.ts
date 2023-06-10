import { toast } from "react-toastify"
import { getI18nObject } from "./general"

export function taskSubmitted(body: {success: boolean, data: {message: string }} | null, fetchEvents: Function) {
    const i18next = getI18nObject()

    if (body != null) {
        if (body.success == true) {
            toast.success(i18next.t(body.data.message))
            fetchEvents()
        }
        else {
            toast.error(i18next.t(body.data.message))

        }
    }
    else {
        toast.error(i18next.t("ERROR_GENERIC"))

    }
}