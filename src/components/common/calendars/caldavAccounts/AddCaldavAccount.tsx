import React, { useState } from "react";
import { Button, Col, Dropdown, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import validator from "validator";
import { toast } from "react-toastify";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import Spinner from "react-bootstrap/Spinner";
import {
  addTrailingSlashtoURL,
  getAPIURL,
  getBaseURL,
  logVar,
} from "@/helpers/general";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import {
  saveCaldavAccountToDexie,
} from "@/helpers/frontend/dexie/caldav_dexie";
import { insertCalendarsIntoDexie } from "@/helpers/frontend/dexie/calendars_dexie";
import { dummyTranslationFunction } from "@/helpers/frontend/translations";
import { getUserIDForCurrentUser_Dexie } from "@/helpers/frontend/dexie/users_dexie";
import { useTranslation } from "next-i18next";
import { fetchLatestEventsV2 } from "@/helpers/frontend/sync";
import { CalDAVOAuthProvidersList } from "./CalDAVOAuthProvidersList";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import { encodeURL } from "js-base64";
import { getOAuthScopesforProvider, OAuthTemporaryStorageType, saveOAuthSetupInfoLocally } from "@/helpers/frontend/caldav_OAuth";
import { CalDAVAuthObject } from "@/helpers/api/tsdav";

const AddCaldavAccount = ({ onAddAccountDismissed, onAccountAddSuccess }) => {
  const [serverURL, setServerURL] = useState("");
  const [accountName, setAccountName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [requestPending, setRequestPending] = useState(false);
  const [authType, setAuthType] = useState("BASIC")
  const [authProvider, setAuthProvider] = useState("GOOGLE")
  const [clientId, setClientId] = useState("")
  const {t} = useTranslation()
  const router =  useRouter()
  const serverURLValueChanged = (event) => {
    setServerURL(event.target.value);
  };

  const accountNameValueChanged = (event) => {
    setAccountName(event.target.value);
  };

  const serverUsernameValueChanged = (event) => {
    setUsername(event.target.value);
  };

  const serverPasswordValueChanged = (event) => {
    setPassword(event.target.value);
  };

  const backButtonClicked = () => {
    onAddAccountDismissed();
  };

  const onAuthTypeChanged = (e) =>{
    setAuthType(e.target.value)
  }

  const formisValid = () => {
    if (!serverURL?.trim()) {
      if(authType!="OAUTH"){
        toast.error(t("ENTER_A_SERVER_NAME"));
        return false;

      }
    }

    // if (!validator.isURL(addTrailingSlashtoURL(serverURL))) {
    //   if (
    //     !serverURL.startsWith("https://localhost") &&
    //     !serverURL.startsWith("http://localhost")
    //   ) {
    //     toast.warn(t("ENTER_A_SERVER_NAME"));
    //   }
    // }

    if (!accountName?.trim()) {
      toast.error(t("ENTER_ACCOUNT_NAME"));
      return false;
    }
    
    if (!username?.trim()) {
      toast.error(t("CALDAV_USERNAME_PLACEHOLDER"));
      return false;
    }
    if(authType=="OAUTH"){
      if(!clientId.trim()){
        toast.error(t("CLIENT_ID_PLACEHOLDER"));
        return false;

      }
    }
    if (!password?.trim()) {
        if (authType!="OAUTH"){
          toast.error( (authType!="OAUTH") ? t("ENTER_CALDAV_PASSWORD"): t("CLIENT_SECRET_PLACEHOLDER"));
          return false;
        }

    }

    return true;
  };

  const makeServerRequest = async () => {
    setRequestPending(true);
    const url_api = getAPIURL() + "v2/caldav/register";
    const authorisationData = await getAuthenticationHeadersforUser();

    const requestOptions = {
      method: "POST",
      body: JSON.stringify({
        url: serverURL,
        username,
        password,
        accountname: accountName,
        authType: authType
      }),
      headers: new Headers({
        authorization: authorisationData,
        "Content-Type": "application/json",
      }),
    };

    try {
      const response = await fetch(url_api, requestOptions);
      const body = await response.json();
      

      if (body?.success) {
        if (
          body.data &&
          body.data["caldav_accounts_id"] &&
          body.data["calendars"] &&
          body.data["url"]
        ) {
          console.log("body", body)
          await saveCaldavAccountToDexie(body.data, username);
          await insertCalendarsIntoDexie(body.data);
          fetchLatestEventsV2(true)
          setRequestPending(false);
          onAccountAddSuccess();
        }else{
          console.error(body, "AddCaldavAccount:makeServerRequest"); 
          setRequestPending(false);
   
        }
      } else {
        setRequestPending(false);

        toast.error(t(body.data.message));
      }
    } catch (e) {
      console.error(e, "AddCaldavAccount:makeServerRequest");
      setRequestPending(false);

      toast.error(e.message);
    }
  };

  const makeOAuthRequest = () =>{
    if(typeof(window)!=="undefined"){
      const redirect_uri = addTrailingSlashtoURL(window.location.origin)


      if(authType=="OAUTH"){
        const saveObject: OAuthTemporaryStorageType = {
          provider:authProvider,
          name: accountName,
          username: username
        }
        saveOAuthSetupInfoLocally(saveObject)
        if(authProvider=="GOOGLE"){
          router.push(` https://accounts.google.com/o/oauth2/v2/auth?scope=${encodeURIComponent(getOAuthScopesforProvider("GOOGLE").trim())}&client_id=${encodeURIComponent(clientId)}&&redirect_uri=${redirect_uri}accounts/caldav/oauth/register&&response_type=code&&access_type=offline&&prompt=consent`)
        }
      }

    }
  }
  const addAccountButtonClicked = () => {
    if (formisValid()) {
        if(authType!="OAUTH"){
            makeServerRequest();
        }else{
          makeOAuthRequest()
        }
    }
  };

  const onAuthProviderChanged = (e: any)=>{
    // // console.log("e.target.value", e.target.value)
    // if(e.target.value=="GOOGLE"){
    //   setServerURL("https://apidata.googleusercontent.com/caldav/v2")
    // }

  }

  const onClientIdChanged =(e)=>{
    setClientId(e.target.value)
  }
  return (
    <>
      <Row>
        <Col>
          <h1>{t("ADD_CALDAV_ACCOUNT")}</h1>
        </Col>
      </Row>
      <br />
      <Form.Group className="mb-3">
        <Form.Label>{t("ACCOUNT_NAME")}</Form.Label>
        <Form.Control
          disabled={requestPending}
          onChange={accountNameValueChanged}
          placeholder={t("ENTER_ACCOUNT_NAME")}
        />
        <Form.Label style={{ marginTop: 30 }}>
          {t("AUTHENTICATION_TYPE")}
        </Form.Label>
        <Form.Select onChange={onAuthTypeChanged} value={authType} aria-label="auth-type">
          <option key="BASIC" value="BASIC">{t("BASIC")}</option>
          <option key="OAUTH" value="OAUTH">{t("OAUTH")}</option>
        </Form.Select>

        <Form.Label style={{ marginTop: 30 }}>
          {t("SERVER_URL")}
        </Form.Label>
        <Form.Control
          disabled={(requestPending || (authType =="OAUTH"))}
          onChange={serverURLValueChanged}
          type="URL"
          value={serverURL}
          placeholder={t("ENTER_A_SERVER_NAME")}
        />
        {
          authType =="OAUTH" ? (
            <>
             <Form.Label style={{ marginTop: 30 }}>
                {t("AUTHENTICATION_PROVIDER")}
              </Form.Label>
              <Form.Select onChange={onAuthProviderChanged} value={authProvider} aria-label="auth-type">
                <CalDAVOAuthProvidersList t={t} />
              </Form.Select>
            </>

          ):(<></>)
        }
       
        <Form.Label style={{ marginTop: 30 }}>
          {t("CALDAV_USERNAME")} 
        </Form.Label>
        <Form.Control
          disabled={requestPending}
          onChange={serverUsernameValueChanged}
          type="URL"
          placeholder={t("CALDAV_USERNAME_PLACEHOLDER")}
        />
          {(authType =="OAUTH") ?
            (<>
              <Form.Label style={{ marginTop: 30 }}>
                {t("CLIENT_ID")} 
              </Form.Label>
              <Form.Control
                disabled={requestPending}
                value={clientId}
                onChange={onClientIdChanged}
                type="URL"
                placeholder={t("CLIENT_ID_PLACEHOLDER")}
              />

            </>):(<></>)
          }
            {(authType !="OAUTH") ? (<>
              <Form.Label style={{ marginTop: 30 }}>
                {(authType !="OAUTH") ? t("CALDAV_PASSWORD"): t("CLIENT_SECRET_PLACEHOLDER")}
              </Form.Label>
              <Form.Control
                disabled={requestPending}
                onChange={serverPasswordValueChanged}
                type="password"
                placeholder={(authType !="OAUTH") ? t("CALDAV_PASSWORD_PLACEHOLDER") : t("CLIENT_SECRET_PLACEHOLDER")}
              />
            </>):<></>
            } 
            
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
  );
};

export default AddCaldavAccount;