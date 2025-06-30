import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { Loading } from "../common/Loading";
import { Button, Card, Col, Row } from "react-bootstrap";
import AddWebcalForm from "./AddWebcalForm";
import { isDarkModeEnabled } from "@/helpers/frontend/theme";
import { getWebCalsFromServer } from "@/helpers/frontend/webcals";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import { getAPIURL } from "@/helpers/general";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";

export default function WebcalManager(){

    const {t} = useTranslation()
    const [showAddForm, setShowAddForm] = useState(false)
    const [finalOutput, setFinalOutput] = useState([<p>{t("NOTHING_TO_SHOW")}</p>])
    const [isFetching, setIsFetching] = useState(false)
    useEffect(()=>{
        let isMounted =true
        if(isMounted){
            getAllWebCalsFromServer()
        }
        return ()=>{
            isMounted=false
        }
    },[])
    
    const addButtonClicked = () =>{
        setShowAddForm(true)
    }
    const closeAddForm =() =>{
        getAllWebCalsFromServer()

        setShowAddForm(false)
    }

    const deleteWebCal = async (id) =>{
        const url_api = getAPIURL() + "webcal/delete?id=" + id

        const authorisationData = await getAuthenticationHeadersforUser()
        const requestOptions ={
            method: 'DELETE',
            mode: 'cors',
            headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        }
        const response = await fetch(url_api, requestOptions as RequestInit)
        .then(response => response.json())
        .then((body) => {
            // console.log("body", body)
            if (body != null && body.success != null) {
                var message = getMessageFromAPIResponse(body)

                if (body.success == true) {
                    //Delete CalDavFromDexie
                    toast.success(t(message))

                } else {

                    toast.error(t(message))

                }
            } else {
                toast.error(t("ERROR_GENERIC"))
            }


        }).catch(e => {
            console.log(e)
        })
        getAllWebCalsFromServer()

    }
const getAllWebCalsFromServer = async() =>{

    const finalOutput: JSX.Element[] = []
    const response = await getWebCalsFromServer()
    const borderColor = isDarkModeEnabled() ? "white" : "#F1F1F1"
    // console.log("response", response)
    if(response && Array.isArray(response)){
        for(const i in response){
            let row=(
                <>
                <div className="card" key={i+"_"+"templateName"} style={{border:`1px solid ${borderColor}`, padding: 20, marginBottom:20, borderRadius: 20}}>
                <Row>
                <Col lg={10}>
                    <h3>{response[i]["name"]}</h3>
                    <br />
                    <p>{`${t("LINK")}: ${response[i]["link"]}`}</p>
                    <p>{`${t("UPDATE_INTERVAL")}: ${response[i]["updateInterval"]}`}</p>
                </Col>
                <Col style={{textAlign:"right"}} lg={2}>
                <AiOutlineDelete onClick={() =>deleteWebCal(response[i]["id"])}  color="red" />
                </Col>
                </Row>
                
                </div>
                
                
                </>
            )
            finalOutput.push(row)
        }
        if(finalOutput.length>0){

            setFinalOutput(finalOutput)
        }   else{
            setFinalOutput([<p>{t("NOTHING_TO_SHOW")}</p>])
        }     
    }
    setIsFetching(false)


}
    return(
        <div >
        <div style={{border: 2, padding:40}} className='container-fluid'>
        <h1>{t("WEBCAL_MANAGER")}</h1>
        {!showAddForm? <div style={{textAlign: "right"}}><Button size="sm" onClick={addButtonClicked} >{t("ADD")}</Button></div> : <AddWebcalForm closeAddForm={closeAddForm} />}
        <div style={{padding:40}}>
            {isFetching ? <Loading centered ={true} /> : finalOutput}
        </div>
        </div>
    
        </div>
    )
    
}