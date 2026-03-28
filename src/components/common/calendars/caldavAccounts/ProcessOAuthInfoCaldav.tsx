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

export const ProcessOAuthInfoCaldav = () =>{
    const {t} = useTranslation()
    const [infoFromLocalStorage, setInfoFromLocalStorage] = useState<OAuthTemporaryStorageType | undefined>()
    const [errorMessage, setShowErrorMessage] = useState("")
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
            if(infoFromLocalStorage && infoFromLocalStorage.client_id && infoFromLocalStorage.client_secret && code){
                //Make API Call to save data to the server.
                const url = CALDAV_OAUTH_SERVER_URL[infoFromLocalStorage.provider]
                registerCalDAVAccountonServer(url, infoFromLocalStorage.username, infoFromLocalStorage.client_secret, infoFromLocalStorage.name, "OAUTH", {client_id:infoFromLocalStorage.client_id, auth_code: code, provider:infoFromLocalStorage.provider}).then((response)=>{
                    if(response && response.success){

                        router.push("/accounts/caldav/")
                        deleteOAuthSetupInfoFromStorage()
                    }else{
                        if(response.error && response.error.message){
                            let output = t("ERROR_GENERIC)") + "\n"
                            output+= JSON.stringify(response.error.message)
                            deleteOAuthSetupInfoFromStorage()
                        }else{
                            setShowErrorMessage(t("ERROR_GENERIC)"))
                            deleteOAuthSetupInfoFromStorage()
                        }
                    }
                })

                
            }else{
                setShowErrorMessage("ERROR_GENERIC")
            }
        
        }

        return ()=>{
            isMounted=false
        }

    },[code, infoFromLocalStorage])

    // const showForm = (infoFromLocalStorage && infoFromLocalStorage.client_id && infoFromLocalStorage.client_secret)
    let output = (<div style={{display:"flex", justifyContent:"center", alignItems:"center", height:"90vh", width:"100%"}}>
                    <Loading />
                </div>)
    // if(!showForm ){
    //     output = (<div style={{display:"flex", justifyContent:"center", alignItems:"center", height:"90vh", width:"100%"}}>
    //                 <Loading />
    //             </div>)
    // }
    if(!code){
        output = <ErrorMessageOutput errorMessage="ERROR_GENERIC"  />
    }

    if(errorMessage){
        output = <ErrorMessageOutput errorMessage="ERROR_GENERIC"  />
    }
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

