import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Loading } from "@/components/common/Loading";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { getUserDataFromCookies } from "@/helpers/frontend/user";
import { getAPIURL, logVar, varNotEmpty } from "@/helpers/general";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import Head from "next/head";
import Image from "next/image";
import { Container, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AVAILABLE_LANGUAGES } from "@/config/constants";

const StartInstall = () => {
  const [output, setOutput] = useState<JSX.Element | JSX.Element[]>([<></>]);
  const router = useRouter();
  const {t} = useTranslation()
  const checkifInstalled = useCallback(async () => {
    const url_api = getAPIURL() + "install/check";

    const requestOptions = {
      method: "GET",
    };

    fetch(url_api, requestOptions)
      .then((response) => response.json())
      .then((body) => {
        if (varNotEmpty(body) && varNotEmpty(body.success)) {
          if (body.success === true) {
            // Already installed.
            setOutput(
              <Alert variant="success">
                {t("ALREADY_INSTALLED")}
              </Alert>
            );
            router.push("/");
          } else {
            const message = getMessageFromAPIResponse(body);
            if (message === "ERROR_DB_CON_ERROR") {
              setOutput(
                <Alert variant="danger">
                  {t("ERROR_DB_CON_ERROR")}
                  <br />
                  <br />
                  {JSON.stringify(body.data.details)}
                </Alert>
              );
            } else if (message === "NOT_INSTALLED") {
              setOutput(getInstallForm());
            }else{
              setOutput(
                <Alert variant="danger">{t("ERROR_GENERIC")}</Alert>
              );
    
            }
          }
        } else {
          setOutput(
            <Alert variant="danger">{t("ERROR_GENERIC")}</Alert>
          );
        }
      })
      .catch((e) => {
        console.error("checkifInstalled", e);
        setOutput(
          <Alert variant="danger">{t("ERROR_GENERIC")}</Alert>
        );
      });
  }, [router]);

  useEffect(() => {
    checkifInstalled();
  }, [checkifInstalled]);

  const continueClicked = async () => {
    // if ((await nextAuthEnabled()) === false) {
    //   if (typeof window !== "undefined") {
    //     const userDataFromCookies = getUserDataFromCookies();
    //     if (userDataFromCookies && userDataFromCookies.ssid && userDataFromCookies.userhash) {
    //       router.push("/");
    //     } else {
    //       router.push("/accounts/register");
    //     }
    //   } else {
    //     router.push("/accounts/register");
    //   }
    // } else {
    //   router.push("/");
    // }

    router.push("/");
  };
 
  const createAccountClicked = () =>{
    router.push("/accounts/register");

  }
  const getInstallFinishedOKForm = () => (
    <>
      <Alert variant="success">{t("INSTALL_SUCESSFUL")}</Alert>
      <Row style={{textAlign:"center"}}>
        <Col>
      <Button onClick={createAccountClicked}>{t("CREATE_ACCOUNT")}</Button>
        </Col>
        <Col>
      <Button onClick={continueClicked}>{t("CONTINUE")}</Button>
        </Col>
      </Row>
    </>
  );

  const installButtonClicked = () => {
    setOutput(<Loading centered={true} />);
    const url_api = getAPIURL() + "install/go";

    const requestOptions = {
      method: "GET",
    };

    fetch(url_api, requestOptions)
      .then((response) => response.json())
      .then((body) => {
        console.log("MMDL INSTALL RESPONSE:", body);
        if (varNotEmpty(body) && varNotEmpty(body.success)) {
          if (body.success === true) {
            setOutput(getInstallFinishedOKForm());
          } else {
            const message = getMessageFromAPIResponse(body);
            setOutput(
              <Alert variant="danger">
                {t(message)}
                <br />
                <br />
                {t("ERROR_GENERIC")}
              </Alert>
            );
          }
        } else {
          setOutput(
            <Alert variant="danger">{t("ERROR_GENERIC")}</Alert>
          );
        }
      })
      .catch((e) => {
        console.error("installButtonClicked", e);
        setOutput(
          <Alert variant="danger">{t("ERROR_GENERIC")}</Alert>
        );
      });
  };

  const getInstallForm = () => (
    <>
      <Alert variant="success">{t("READY_TO_INSTALL")}</Alert>
      <br />
      <Button onClick={installButtonClicked}>{t("INSTALL")}</Button>
    </>
  );

  return (
    <>
      <Head>
        <title>
          {t("APP_NAME_TITLE") + " - " + t("INSTALL")}
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container fluid>
        <div
          style={{
            margin: "0",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Image alt="Logo" src="/logo.png" width={100} height={100} />
          </div>
          <h2 style={{ textAlign: "center" }}>{t("APP_NAME")}</h2>
          <br />
          <h1>{t("Install")}</h1>
          <br />
          {output}
        </div>
      </Container>
    </>
  );
};

export default StartInstall;

export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"], null, AVAILABLE_LANGUAGES)),
        },
    };
}