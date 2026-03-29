import { Button, Col, Form, Row } from "react-bootstrap"
import { Loading } from "../../Loading"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { deleteOAuthSetupInfoFromStorage, getOAuthSetupInfoFromStorage, OAuthTemporaryStorageType } from "@/helpers/frontend/caldav_OAuth"
import { useSearchParams } from "next/navigation"
import { toast } from "react-toastify"
import { registerCalDAVAccountonServer } from "@/helpers/frontend/apiCalls/caldav"
import { CALDAV_OAUTH_SERVER_URL } from "@/config/constants"
import { useRouter } from "next/navigation"
import { OAuthStepTwo } from "./OAuthStepTwo"

export const ProcessOAuthInfoCaldav = () =>{
    const {t} = useTranslation()
    const [infoFromLocalStorage, setInfoFromLocalStorage] = useState<OAuthTemporaryStorageType | undefined>()
    const [output, setOutput] = useState(<div style={{display:"flex", justifyContent:"center", alignItems:"center", height:"90vh", width:"100%"}}>
                    <Loading />
                </div>)
    const searchParams = useSearchParams();
    const code = searchParams?.get("code") 
    const router = useRouter()
    useEffect (()=>{
        setInfoFromLocalStorage(getOAuthSetupInfoFromStorage())

    },[])

    const backClicked = () =>{
        router.push("/accounts/caldav")
    }
    const ErrorMessageOutput = ({errorMessage}: {errorMessage: string}): React.JSX.Element =>{

        return(
            <>
                <p>{t(errorMessage)}</p>
                <br />
                <Button onClick={backClicked} variant="outline-danger">{t("BACK")}</Button>
            </>
        )

    }
    
    useEffect(()=>{
        let isMounted =true
        if(isMounted){
            if(infoFromLocalStorage && infoFromLocalStorage.name && infoFromLocalStorage.provider && infoFromLocalStorage.username && code){
                setOutput(< OAuthStepTwo code={code} name={infoFromLocalStorage.name} username={infoFromLocalStorage.username} provider={infoFromLocalStorage.provider} />)
               
            }else{
                setOutput( <ErrorMessageOutput errorMessage="ERROR_GENERIC"  />)
            }
        
        }

        return ()=>{
            isMounted=false
        }

    },[code, infoFromLocalStorage])

    // const showForm = (infoFromLocalStorage && infoFromLocalStorage.client_id && infoFromLocalStorage.client_secret)
    return(
        <>
            <Row>
                <Col>
                <h1>{t("ADD_CALDAV_ACCOUNT")}</h1>
                </Col>
            </Row>
            {output}
        </>
    )

}

