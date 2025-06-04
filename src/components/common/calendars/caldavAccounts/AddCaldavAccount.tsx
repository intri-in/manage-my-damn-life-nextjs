import React, { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import validator from "validator";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import Spinner from "react-bootstrap/Spinner";
import {
  addTrailingSlashtoURL,
  getAPIURL,
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

const AddCaldavAccount = ({ onAddAccountDismissed, onAccountAddSuccess }) => {
  const [serverURL, setServerURL] = useState("");
  const [accountName, setAccountName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [requestPending, setRequestPending] = useState(false);
  const {t} = useTranslation()
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

  const formisValid = () => {
    if (!serverURL) return false;

    // if (!validator.isURL(addTrailingSlashtoURL(serverURL))) {
    //   if (
    //     !serverURL.startsWith("https://localhost") &&
    //     !serverURL.startsWith("http://localhost")
    //   ) {
    //     toast.error(t("ENTER_A_SERVER_NAME"));
    //     return false;
    //   }
    // }

    if (!accountName?.trim()) {
      toast.error(t("ENTER_ACCOUNT_NAME"));
      return false;
    }

    if (!password?.trim()) {
      toast.error(t("ENTER_CALDAV_PASSWORD"));
      return false;
    }

    if (!username?.trim()) {
      toast.error(t("ENTER_CALDAV_USERNAME"));
      return false;
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
          await fetchLatestEventsV2(true)
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

  const addAccountButtonClicked = () => {
    if (formisValid()) {
      makeServerRequest();
    }
  };

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
          {t("SERVER_URL")}
        </Form.Label>
        <Form.Control
          disabled={requestPending}
          onChange={serverURLValueChanged}
          type="URL"
          placeholder={t("ENTER_A_SERVER_NAME")}
        />
        <Form.Label style={{ marginTop: 30 }}>
          {t("CALDAV_USERNAME")}
        </Form.Label>
        <Form.Control
          disabled={requestPending}
          onChange={serverUsernameValueChanged}
          type="URL"
          placeholder={t("CALDAV_USERNAME_PLACEHOLDER")}
        />
        <Form.Label style={{ marginTop: 30 }}>
          {t("CALDAV_PASSWORD")}
        </Form.Label>
        <Form.Control
          disabled={requestPending}
          onChange={serverPasswordValueChanged}
          type="password"
          placeholder={t("CALDAV_PASSWORD_PLACEHOLDER")}
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
  );
};

export default AddCaldavAccount;