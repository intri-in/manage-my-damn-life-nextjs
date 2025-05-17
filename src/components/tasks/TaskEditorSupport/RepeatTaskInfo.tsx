import { Loading } from "@/components/common/Loading";
import i18next from "i18next";
import { useAtomValue } from "jotai";
import moment from "moment";
import { Alert, Button } from "react-bootstrap";
import { currentSimpleDateFormatAtom } from "stateStore/SettingsStore";


export default function RepeatTaskInfo({recurrenceObj, dateFormat, onSaveClick, isLoading}){
    const button = !isLoading ?<Button size="sm" onClick={onSaveClick} >{i18next.t("SAVE_THIS_INSTANCE")}</Button>: <Loading centered={true} />
    return (
        (<Alert variant="warning">
            <p>{i18next.t("REPEAT_TASK_MESSAGE")}</p> 
            <p>{i18next.t("CURRENT_INSTANCE_BEING_EDITED")+moment(recurrenceObj.getNextDueDate()).format(dateFormat)}</p>
            <p style={{textAlign:"end"}}>

            {button}
            </p>
        </Alert>)
    )
}