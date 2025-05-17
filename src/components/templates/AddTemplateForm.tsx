import { getI18nObject } from "@/helpers/frontend/general"
import { MouseEventHandler, useEffect, useState } from "react"
import { Button, Form } from "react-bootstrap"
import { GlobalViewManager } from "../common/GlobalViewManager/GlobalViewManager"
import { showTaskEditorAtom, taskEditorInputAtom } from "stateStore/TaskEditorStore"
import { useSetAtom } from "jotai"
import { eventEditorInputAtom, showEventEditorAtom } from "stateStore/EventEditorStore"
import { getEventURLFromDexie } from "@/helpers/frontend/dexie/events_dexie"
import { getCalendarURLByID_Dexie } from "@/helpers/frontend/dexie/calendars_dexie"
import { toast } from "react-toastify"
import { getAPIURL } from "@/helpers/general"
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user"
import { Loading } from "../common/Loading"
import { RequestOptions } from "https"
import { getErrorResponse } from "@/helpers/errros"

export default function AddTemplateForm({closeAddForm}:{closeAddForm: Function}){

const i18next = getI18nObject()

/**
 * Jotai
 */

const showTaskEditor = useSetAtom(showTaskEditorAtom)
const setTaskInputAtom = useSetAtom(taskEditorInputAtom)

const showEventEditor = useSetAtom(showEventEditorAtom)
const setEventInputAtom = useSetAtom(eventEditorInputAtom)

/**
 * Local State
 */
const [name, setName] = useState('')
const [type, setType] = useState('TASK')
const [data, setData] = useState({calendar_id:"", data:""})
const [isSubmitting, setIsSubmitting] = useState(false)
const nameChanged = (e) =>{
    setName(e.target.value)
}
const typeChanged = (e) =>{
    setType(e.target.value)
}

const onTaskValueReturn = (dataFromEditor) =>{
    if(("calendar_id" in dataFromEditor) && dataFromEditor["calendar_id"])
    {
        getCalendarURLByID_Dexie(parseInt(dataFromEditor["calendar_id"])) .then(url =>{
            // console.log(dataFromEditor["calendar_id"],url)
            dataFromEditor["calendar_id"]=url
            setData(dataFromEditor)
        })
    }else{
        setData(dataFromEditor)

    }
}
const createDataClicked = () =>{
    if(type=="TASK"){
        setTaskInputAtom({
            id:null,
            isTemplate:true,
            templateReturn:onTaskValueReturn
        })
        showTaskEditor(true)
    }else{
        setEventInputAtom({
            id:null,
            isTemplate:true,
            templateReturn:onTaskValueReturn
        })
        showEventEditor(true)
    }
}

const isValid = () =>{

    if(!name.trim()){
        toast.error(i18next.t("ENTER_TEMPLATE_NAME"))
        return false
    }
    if(!("data in data"))
    {
        toast.error(i18next.t("ENTER_TEMPLATE_DATA"))
        return false

    }
    if(!data.data)
    {
        toast.error(i18next.t("ENTER_TEMPLATE_DATA"))
        return false

    }
    return true
}


const onSave = async () =>{

    if(isValid()){
        setIsSubmitting(true)
        const url_api=getAPIURL()+"templates/create"
        const authorisationData=await getAuthenticationHeadersforUser()
    
        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                data: data,
                type: type,
            }),
            headers: new Headers({'authorization': authorisationData, 'Content-Type':'application/json'}),
        }
    
        return new Promise( (resolve, reject) => {
           
                const response =  fetch(url_api, requestOptions)
                .then(response => response.json())
                .then((body) =>{
                    //Save the events to db.
                    if(body!=null)
                    {
                        if(body.success==true)
                        {
                            toast.success(i18next.t("DONE"))
                            closeAddForm()
    
                        }else{
                            toast.error(i18next.t(body.data.message))
                        }
                    }
                    else
                    {
                        toast.error(i18next.t("ERROR_GENERIC"))
    
                    }
                    
        
                }).catch(e =>{
                    console.error(e, "AddTemplate onSave:")
                    toast.error(e.message)
                })
            
        })

    }
}

const dataToShow = ("data" in data && data.data) ? <p>{JSON.stringify(data)}</p> : <Button onClick={createDataClicked}>{i18next.t("CREATE")}</Button>
const buttons =     <p style={{marginTop: 40, textAlign:"center"}}>
<Button onClick={() =>closeAddForm()} style={{marginRight:"20px"}} variant="secondary">{i18next.t("BACK")}</Button>
<Button onClick={onSave} variant="primary">{i18next.t("SAVE")}</Button>

</p>

return(
    <>
    <div style={{padding:40}} className='container-fluid'>
    <h2>{i18next.t("ADD")}</h2>
    <br />
    <Form.Label>{`${i18next.t("TEMPLATE")} ${i18next.t("NAME")}`}</Form.Label>
    <Form.Control maxLength={50} onChange={nameChanged} value={name}  />
    <br />
    <Form.Label>{`${i18next.t("TYPE")}`}</Form.Label>
    <Form.Select value={type} onChange={typeChanged} aria-label="Type Select">
      <option value="TASK">{i18next.t("TASK")}</option>
      <option value="EVENT">{i18next.t("EVENT")}</option>
    </Form.Select>
    <br/>
    <Form.Label>{`${i18next.t("TEMPLATE")} ${i18next.t("DATA")}`}</Form.Label>
    <br />
    {dataToShow}
    <br />
    {isSubmitting ? <Loading centered={true} /> :  buttons}
    </div>
    <GlobalViewManager />

    </>
)
}
