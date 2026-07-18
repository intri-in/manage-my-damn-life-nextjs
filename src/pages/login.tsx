import { Toastify } from '@/components/Generic';
import { PRIMARY_COLOUR, SECONDARY_COLOUR } from '@/config/style';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import { getAuthenticationHeadersforUser, setLoginCookie } from '@/helpers/frontend/user';
import { getMessageFromAPIResponse } from '@/helpers/frontend/response';
import { getAPIURL, logVar } from '@/helpers/general';
import { getErrorResponse } from '@/helpers/errros';
import { fetchLatestEvents, fetchLatestEventsV2, refreshCalendarListV2 } from '@/helpers/frontend/sync';
import { setUserNameCookie } from '@/helpers/frontend/cookies';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { AVAILABLE_LANGUAGES } from '@/config/constants';
import { RequestOptions } from 'https';
import { installCheck_Cookie } from '@/helpers/install';
import { userRegistrationAllowed } from '@/helpers/api/settings';
import { isInstalled_CheckWithSequelize, isInstalled_CheckWithSequelizeForFrontEnd, testDBConnection } from '@/helpers/api/install';

const Login = ({showRegistrationLink, installed}) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const {t} = useTranslation()
    // const [showRegistrationLink, setShowRegistrationLink] = useState(false);
    const router = useRouter();

   

    useEffect(() => {

        let isMounted = true
        if (isMounted) {

            if (typeof window !== 'undefined') {
                const queryString = window.location.search;
                const params = new URLSearchParams(queryString);
                const message = params.get('message');
                if (message) {
                    toast.info(t(message));
                }
            }

        }
        return () => {
            isMounted = false
        }
    }, []);
 
    
    const loginButtonClicked = async () => {
        let isValid = true;

        if (!username.trim()) {
            toast.error(t("INVALID_USERNAME"));
            isValid = false;
        }

        if (!password.trim()) {
            toast.error(t("ENTER_A_PASSWORD"));
            isValid = false;
        }

        if (isValid) {
            const url_api = getAPIURL() + "login/";

            const requestOptions = {
                method: 'POST',
                body: JSON.stringify({ password, username }),
                mode: 'cors',
                headers: new Headers({ 'Content-Type': 'application/json' }),
            };

            try {
                const response = await fetch(url_api, requestOptions as RequestInit);
                const body = await response.json();
                processReponse(body);
            } catch (e) {
                console.error("loginButtonClicked", e);
                processReponse(getErrorResponse(e));
            }
        }
    };

    const processReponse = (body) => {
        if (body && body.success === "true") {
            const message = getMessageFromAPIResponse(body);
            if (message && message.userhash && message.ssid) {
                setUserNameCookie(username);
                setLoginCookie(message.userhash, message.ssid);

                let redirectURL = `/setup`;
                if (typeof window !== 'undefined') {
                    const queryString = window.location.search;
                    const params = new URLSearchParams(queryString);
                    const redirectTo = params.get('redirect');
                    if (redirectTo) {
                        redirectURL += `?redirect=${redirectTo}`;
                    }
                }
                router.push(redirectURL);
            } else {
                toast.error(t("ERROR_GENERIC"));
            }
        } else {
            const message = getMessageFromAPIResponse(body);
            toast.error(t(message?.toString() || "ERROR_GENERIC"));
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            loginButtonClicked();
        }
    };
    const notInstalledBannerClicked = () =>{
        router.push("/install")
    }
    
    const registrationLink = showRegistrationLink ? (
        <div style={{ textAlign: 'center', color: "blue" }}>
            <Link href="accounts/register">{t("REGISTER")}</Link>
        </div>
    ) : null;
    let notInstalledBanner: JSX.Element | null = null;
    if (!installed) {
      notInstalledBanner = (
        <div onClick={notInstalledBannerClicked} style={{ background: "darkred", textAlign: "center", color: "white" }}>{t("MMDL_NOT_INSTALLED")}</div>
      );
    }
  
    return (
        <>
            <Head>
                <title>{t("APP_NAME_TITLE") + " - " + t("LOGIN")}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {notInstalledBanner}

            <Container fluid>
                <div style={{ margin: "0", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                    <div style={{ textAlign: 'center' }}>
                        <Image alt='Logo' src="/logo.png" width={100} height={100} />
                    </div>
                    <h2 style={{ textAlign: 'center' }}>{t("APP_NAME")}</h2>
                    <br />
                    <h1>{t("LOGIN")}</h1>
                    <Form.Control onKeyDown={onKeyDown} maxLength={40} value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t("ENTER_USERNAME")} />
                    <br />
                    <Form.Control onKeyDown={onKeyDown} onChange={(e) => setPassword(e.target.value)} value={password} type="password" maxLength={40} placeholder={t("ENTER_A_PASSWORD")} />
                    <br />
                    <div style={{ textAlign: 'center' }}>
                        <Button onClick={loginButtonClicked}> {t("LOGIN")}</Button>
                    </div>
                    <div style={{ marginBottom: 20 }} />
                    <div style={{ textAlign: 'center', color: "blue" }}>
                        <Link href="/accounts/resetpassword">{t("RESET_PASSWORD")}</Link>
                    </div>
                    <br />
                    {registrationLink}
                </div>
                {/*  <Toastify /> */}
            </Container>
        </>
    );
};

export default Login;

export async function getServerSideProps({ locale }) {
    return {
        props: {
        installed : await isInstalled_CheckWithSequelizeForFrontEnd(), 
        showRegistrationLink: await userRegistrationAllowed().catch(e =>{
               console.error("userRegistrationAllowed", e)
            }), // or fetch from DB, etc.
            ...(await serverSideTranslations(locale, ["common"], null, AVAILABLE_LANGUAGES)),
        },
    };
}