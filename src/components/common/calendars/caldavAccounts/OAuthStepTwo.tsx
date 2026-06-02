import { CALDAV_OAUTH_SERVER_URL } from "@/config/constants"
import { registerCalDAVAccountonServer } from "@/helpers/frontend/apiCalls/caldav"
import { deleteOAuthSetupInfoFromStorage } from "@/helpers/frontend/caldav_OAuth"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Alert, Button, Col, Form, Row, Spinner } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"

export const OAuthStepTwo = ({provider, username, name, code}:{provider: string, username: string, name:string, code: string}) =>{
    const {t} = useTranslation()
    const router =  useRouter()
    const [clientId, setClientId] = useState("")
    const [password, setPassword] = useState("");
    const [requestPending, setRequestPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")
    const onClientIdChanged =(e)=>{
        setClientId(e.target.value)
    }

        const serverPasswordValueChanged = (event) => {
        setPassword(event.target.value);
    };

    const backButtonClicked = () => {
        router.push("/accounts/caldav/")
    };
    const addAccountButtonClicked = () => {
        if (formisValid()) {
            setRequestPending(true)
            const url = CALDAV_OAUTH_SERVER_URL[provider]
            registerCalDAVAccountonServer(url, username, password, name, "OAUTH", {client_id:clientId, auth_code: code, provider:provider, client_secret:password,}).then((response)=>{
                if(response && response.success){

                    deleteOAuthSetupInfoFromStorage()
                    toast.success(t("DONE"))
                    router.push("/accounts/caldav/")
                }else{
                    (t("ERROR_GENERIC)"))
                    if(response.error && response.error.message){
                        let output = t("ERROR_GENERIC)") + "\n"
                        output+= JSON.stringify(response.error.message)
                        console.error("/accounts/caldav/oauth/register:", output)

                    }
                    const errorMessageToDisplay = `${t("ERROR_GENERIC")} ${t("ERROR_SINGLE_USE_OAUTH_CODE")} `
                    setErrorMessage(errorMessageToDisplay)
                    setRequestPending(false)
                    deleteOAuthSetupInfoFromStorage()
                }
            })

        }
    }
    const formisValid = () => {
           
        if(!clientId.trim()){
        toast.error(t("CLIENT_ID_PLACEHOLDER"));
        return false;

        }

        if (!password?.trim()) {
            toast.error(t("CLIENT_SECRET_PLACEHOLDER"));
            return false;
        
        }
        
        return true
    }

    return(
        <>
            {!errorMessage ? <Alert variant="success">{t("CALDAV_OAUTH_FIRST_STEP_COMPLETED")}</Alert> :
            <Alert variant="danger">{errorMessage}</Alert>
            }
            <Form.Group className="mb-3">
                <Row>
                    <Col>
                        <Form.Label  style={{ marginTop: 30, }}>
                        {t("AUTHENTICATION_PROVIDER")} 
                        </Form.Label>
                    </Col>
                    <Col>
                    <Form.Label  style={{ marginTop: 30, }}>
                        {t(provider)} 
                    </Form.Label>
                    </Col>
                </Row>
             
                <Row>
                    <Col>
                        <Form.Label  style={{ marginTop: 30, }}>
                        {t("CALDAV_USERNAME")} 
                        </Form.Label>
                    </Col>
                    <Col>
                    <Form.Label  style={{ marginTop: 30, }}>
                        {username} 
                    </Form.Label>
                    </Col>
                </Row>

              <Form.Label style={{ marginTop: 30 }}>
                {t("CLIENT_ID")} 
              </Form.Label>
              <Form.Control
                disabled={requestPending || (errorMessage!="")}
                value={clientId}
                onChange={onClientIdChanged}
                type="URL"
                placeholder={t("CLIENT_ID_PLACEHOLDER")}
              />
              <Form.Label style={{ marginTop: 30 }}>
                {t("CLIENT_SECRET_PLACEHOLDER")}
              </Form.Label>
              <Form.Control
                disabled={requestPending || (errorMessage!="")}
                onChange={serverPasswordValueChanged}
                type="password"
                value={password}
                placeholder={t("CLIENT_SECRET_PLACEHOLDER")}
              />
              
            <div style={{ marginTop: 30, textAlign: "center" }}>
            {!requestPending ? (
                <>
                <Button onClick={backButtonClicked} variant="secondary">
                    {t("BACK")}
                </Button>{" "}
                <Button onClick={addAccountButtonClicked}>
                    {t("ADD")}
                </Button>
                </>
            ) : (
                <Spinner animation="grow" variant="success" />
            )}
            </div>

            </Form.Group>
        </>
    )

            
}