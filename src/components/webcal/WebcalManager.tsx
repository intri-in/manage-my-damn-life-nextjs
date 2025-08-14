import { useTranslation } from "next-i18next";
import { useEffect, useRef, useState } from "react";
import { Loading } from "../common/Loading";
import { Button, Card, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import AddWebcalForm from "./AddWebcalForm";
import { isDarkModeEnabled } from "@/helpers/frontend/theme";
import { getWebCalsFromServer, setupWebCalDataFromServer } from "@/helpers/frontend/webcals";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import { getAPIURL } from "@/helpers/general";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import moment from "moment";
import { useAtomValue } from "jotai";
import { currentDateFormatAtom } from "stateStore/SettingsStore";
import { IoSyncCircleOutline } from "react-icons/io5";
import { deleteEventsFromWebCal_Dexie, deleteWebCalbyWebCalIdFromDexie, getAllWebcalsforCurrentUserfromDexie, getPrimaryKeyFromWebCalId_Dexie, getWebCalIDFromPrimaryID_Dexie, updateEventsinWebcal_Dexie, updateWebCalLastFetched_Dexie } from "@/helpers/frontend/dexie/webcal_dexie";
import ColourPicker from "../common/ColourPIcker";

export default function WebcalManager(){

    const {t} = useTranslation()
    const [showAddForm, setShowAddForm] = useState(false)
    const [finalOutput, setFinalOutput] = useState([<p>{t("NOTHING_TO_SHOW")}</p>])
    const [isFetching, setIsFetching] = useState(false)
    const dateFormat = useAtomValue(currentDateFormatAtom)
    const ref = useRef(null);
    const effectRan = useRef(false);
    useEffect(()=>{
        getAllWebCalsFromDexie()
        if (!effectRan.current) {
            
            setupWebCalDataFromServer().then( () =>{
                getAllWebCalsFromDexie()
    
            })
            
        }
        return () => {effectRan.current = true;}
    },[])
    
    const addButtonClicked = () =>{
        setShowAddForm(true)
    }
    const closeAddForm =() =>{
        getAllWebCalsFromDexie()

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
                    deleteWebCalbyWebCalIdFromDexie(id)
                    deleteEventsFromWebCal_Dexie(id)

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
        getAllWebCalsFromDexie()

}
const syncWebCal = async (id) =>{
    const url_api = getAPIURL() + "webcal/sync?id=" + id

    const authorisationData = await getAuthenticationHeadersforUser()
    const requestOptions ={
        method: 'GET',
        mode: 'cors',
        headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
    }
    const response = await fetch(url_api, requestOptions as RequestInit)
    .then(response => response.json())
    .then(async (body) => {
        // console.log("body", body)
        if (body != null && body.success != null) {
            const message = getMessageFromAPIResponse(body)
            // console.log(body.success, message)

            if (body.success == true) {
                toast.success(`${t("SYNC")} ${t("DONE").toLowerCase()}`)
                //We also need to update the WebCal in dexie.
                if("data" in body && body.data){
                    const data = body.data
                    if("lastFetched" in data && "parsedCal" in data){
                        await updateWebCalLastFetched_Dexie(id, data.lastFetched)
                        console.log("data.parsedCal", data.parsedCal)
                        await updateEventsinWebcal_Dexie(id, data.parsedCal)
                        getAllWebCalsFromDexie()
                    }

                }


            }else {

                toast.error(t("ERROR_GENERIC"))

            }
        } else {
            toast.error(t("ERROR_GENERIC"))
        }


    }).catch(e => {
        console.log(e)
    })

}

const renderToolTipForSyncButton  = (props) => (
 
        <Tooltip  {...props} id={`SYNC_KEY_toolTip`}>
          {t("SYNC")}
        </Tooltip>
   
)

const webcalColourChanged = async (newColour, webcal_id) =>{
    const url_api = getAPIURL() + "webcal/updateColour";
    const authorisationData = await getAuthenticationHeadersforUser();

    // console.log("webcal_id", webcal_id, await getWebCalIDFromPrimaryID_Dexie(webcal_id))
    const requestOptions = {
      method: "POST",
      body: JSON.stringify({
        id: await getWebCalIDFromPrimaryID_Dexie(webcal_id),
        colour:newColour
      }),
      headers: new Headers({
        authorization: authorisationData,
        "Content-Type": "application/json",
      }),
    };

    fetch(url_api, requestOptions)
    .then(response =>{
        return response.json()
    })
    .then((body) =>{

        if(!body){
            toast.error(t("ERROR_GENERIC"))
        }
        if(!("success" in body) || !body.success){
            toast.error(t("ERROR_GENERIC"))
        }
        toast.success(t("UPDATE_OK"))


    }).catch(e =>{
        console.error("webcalColourChanged", e)
        toast.error(t("ERROR_GENERIC"))

    })



    
}
const getAllWebCalsFromDexie = async() =>{

    const finalOutput: JSX.Element[] = []
    const response = await getAllWebcalsforCurrentUserfromDexie()
    const borderColor = isDarkModeEnabled() ? "white" : "#F1F1F1"
    console.log("getAllWebCalsFromDexie", response)
    if(response && Array.isArray(response)){
        for(const i in response){
            if(!response[i]["id"]){
                continue;
            }
            let row=(
                <div ref={ref} className="card" key={i+"_"+response[i]["link"]} style={{border:`1px solid ${borderColor}`, padding: 20, marginBottom:20, borderRadius: 20}}>
                <Row>
                <Col lg={10}>
                    <h3>{response[i]["name"]}</h3>
                    <br />
                    <ColourPicker onChange={webcalColourChanged} colour={response[i]["colour"]?.toString()} keyName={response[i]["id"]?.toString()}/>
                    <p>{`${t("LINK")}: ${response[i]["link"]}`}</p>
                    <p>{`${t("UPDATE_INTERVAL")}: ${response[i]["updateInterval"]}`}</p>
                    <p>{`${t("LAST_SYNCED")}: ${moment(response[i]["lastFetched"]).format(dateFormat)}`}</p>

                </Col>
                <Col style={{textAlign:"right"}} lg={2}>
                <OverlayTrigger key={`SYNC_KEY_${i}`} placement='right'
                  overlay={renderToolTipForSyncButton}>
                    <div ref={ref} id={`syncButton_${i}`}>
                        <IoSyncCircleOutline onClick={() =>syncWebCal(parseInt(response[i]["webcals_id"]!))} color="blue"  />
                    </div>
                </OverlayTrigger>
                <AiOutlineDelete  onClick={() =>deleteWebCal(parseInt(response[i]["webcals_id"]!))}  color="red" />
                </Col>
                </Row>
                
                </div>
                
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