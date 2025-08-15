import { useEffect, useState } from "react"
import { Button, Col, Row } from "react-bootstrap"
import { GlobalViewManager } from "../common/GlobalViewManager/GlobalViewManager"
import AddTemplateForm from "./AddTemplateForm"
import { getTemplatesFromServer } from "@/helpers/frontend/templates"
import { Loading } from "../common/Loading"
import { isDarkModeEnabled } from "@/helpers/frontend/theme"
import { AiOutlineDelete } from "react-icons/ai"
import { getAPIURL } from "@/helpers/general"
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user"
import { toast } from "react-toastify"
import { useTranslation } from "next-i18next"

export default function TemplateManager(){

const {t} = useTranslation()
const [showAddForm, setShowAddForm] = useState(false)
const [finalOutput, setFinalOutput] = useState([<p>{t("NOTHING_TO_SHOW")}</p>])
const [isFetching, setIsFetching] = useState(false)
useEffect(()=>{
    let isMounted =true
    if(isMounted){

        getAllTemplatesFromServer()
    }
    return ()=>{
        isMounted=false
    }
},[])

const deleteFromServer = async (id) =>{
    const url_api=getAPIURL()+"templates/delete?id="+id
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'DELETE',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }

    return new Promise( (resolve, reject) => {
            const response =  fetch(url_api, requestOptions as RequestInit)
            .then(response => response.json())
            .then((body) =>{
                toast.success(t("DELETE_OK"))
                getAllTemplatesFromServer()
                }
            ).catch(e =>{
            console.error("AddTemplateForm deleteFromServer",e)
                toast.error(e.message)
            })
    });
  

}

const getAllTemplatesFromServer = async() =>{

    const finalOutput: JSX.Element[] = []
    const response = await getTemplatesFromServer()
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
                <p>{t("TYPE")}:{response[i]["type"]}</p>
                <pre>
                    <code>
                    {JSON.stringify(JSON.parse(response[i]["data"]), null, 4)}
                    </code>
                </pre>
                </Col>
                <Col style={{textAlign:"right"}} lg={2}>
                <AiOutlineDelete onClick={()=> deleteFromServer(response[i]["id"])} color="red" />
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

const addButtonClicked = () =>{
    setShowAddForm(true)
}
const closeAddForm =() =>{
    getAllTemplatesFromServer()
    setShowAddForm(false)
}


return(
    <>
    <div style={{padding:40}} className='container-fluid'>
    <h1>{t("TEMPLATE_MANAGER")}</h1>
    {!showAddForm? <div style={{textAlign: "right"}}><Button size="sm" onClick={addButtonClicked} >{t("ADD")}</Button></div> : <AddTemplateForm closeAddForm={closeAddForm} />}
    <div style={{padding:40}}>
        {isFetching ? <Loading centered ={true} /> : finalOutput}
    </div>
    </div>
    <GlobalViewManager />

    </>
)
}
