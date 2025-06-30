import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { Loading } from "../common/Loading";
import { Button, Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import validator from "validator";
import { addTrailingSlashtoURL, getAPIURL } from "@/helpers/general";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";

export default function AddWebcalForm({closeAddForm}:{closeAddForm: Function}){
    const {t} = useTranslation()

    const [name, setName] = useState('')
    const [link, setLink] = useState('')
    const [updateInterval, setUpdateInterval] = useState(24)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const nameChanged = (e) =>{
        setName(e.target.value)
    }
    const linkChanged = (e) =>{
        setLink(e.target.value)
    }

    const updateIntervalChanged =(e) =>{
        // console.log(e.target.value, !isNaN(e.target.value))
        setUpdateInterval(e.target.value)
        
    }

    const isFormValid  = () =>{

        if(!name){
            toast.error(t("ENTER_ACCOUNT_NAME"));
            return false
            
        }
        if(!link){
            toast.error(t("ERROR_LINK_EMPTY"));
            return false
        }
        console.log("validator.isURL(link)", validator.isURL(link))
        if (!validator.isURL(link)) {
            
            const isLocalHostLink = (link.startsWith("http://localhost")|| link.startsWith("https://localhost"))
            if(!isLocalHostLink){

                toast.warn(t("ERROR_LINK_LOOKS_INVALID"));
            }
            
        }
        if(isNaN(updateInterval)){
            toast.error(t("ERROR_INVALID_UPDATE_INTERVAL"))

            return false
        }
        
        return true
    }
    const onSave = async () =>{
        if(isFormValid()){
            setIsSubmitting(true)
            const url_api=getAPIURL()+"webcal/create"
            const authorisationData=await getAuthenticationHeadersforUser()
        
            const requestOptions =
            {
                method: 'POST',
                body: JSON.stringify({
                    name: name,
                    link: link,
                    updateInterval: updateInterval,
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
                                toast.success(t("DONE"))
                                closeAddForm()
        
                            }else{
                                toast.error(t(body.data.message))
                                setIsSubmitting(false)

                            }
                        }
                        else
                        {
                            toast.error(t("ERROR_GENERIC"))
                            setIsSubmitting(false)
                        }
                        
            
                    }).catch(e =>{
                        console.error(e, "AddWebcalForm onSave:")
                        toast.error(e.message)
                        setIsSubmitting(false)
                    })
                
            })
    
        }
        setIsSubmitting(false)

    }
    
    const buttons = (
    <p style={{marginTop: 40, textAlign:"center"}}>
        <Button onClick={() =>closeAddForm()} style={{marginRight:"20px"}} variant="secondary">{t("CLOSE")}</Button>
        <Button onClick={onSave} variant="primary">{t("ADD")}</Button>
    </p>
)

    return(
        <Card>
            <div style={{padding:40}} className='container-fluid'>
            <h2>{t("ADD")}</h2>
            <br />
            <Form.Label>{`${t("NAME")}`}</Form.Label>
            <Form.Control maxLength={50} onChange={nameChanged} value={name}  />
            <br />
            <Form.Label>{`${t("LINK")}`}</Form.Label>
            <Form.Control maxLength={1000} onChange={linkChanged} value={link}  />
            <br/>
            <Form.Label>{`${t("UPDATE_INTERVAL")}`}</Form.Label>
            <Form.Control type="number" maxLength={50} onChange={updateIntervalChanged} value={updateInterval}  />
            <br/>
            <br />
            {isSubmitting ? <Loading centered={true} /> :  buttons}
            </div>


        </Card>
    )


}