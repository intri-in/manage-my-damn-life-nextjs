import { Toastify } from "@/components/Generic";
import Head from "next/head";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { Loading } from "@/components/common/Loading";
import { getAPIURL } from "@/helpers/general";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AVAILABLE_LANGUAGES } from "@/config/constants";

const ResetPassword = () => {
    const [username, setUsername] = useState("");
    const [isWaiting, setIsWaiting] = useState(false);
    const [reqid, setReqid] = useState(null);
    const [userhash, setUserhash] = useState(null);
    const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const router = useRouter();
    const {t} = useTranslation()
    const makeGetOTPRequest = async () => {
        let isValid = true;
        setIsWaiting(true);

        if (!username.trim()) {
            toast.error(t("INVALID_USERNAME"));
            isValid = false;
            setIsWaiting(false);
        }

        if (isValid) {
            const url_api = `${getAPIURL()}users/requestotp?username=${username}`;
            try {
                const response = await fetch(url_api, { method: 'GET' });
                const body = await response.json();

                if (body?.success) {
                    const message = getMessageFromAPIResponse(body);
                    if (message?.userhash && message?.reqid) {
                        setReqid(message.reqid);
                        setUserhash(message.userhash);
                        setShowNewPasswordForm(true);
                        toast.success(t("OTP_SENT_TO_EMAIL"));
                    } else {
                        toast.error(t("ERROR_GENERIC"));
                    }
                } else {
                    const message = getMessageFromAPIResponse(body);
                    toast.error(t(message.toString()));
                }
            } catch (error) {
                console.error("makeGetOTPRequest", error);
                toast.error(t("ERROR_GENERIC"));
            } finally {
                setIsWaiting(false);
            }
        }
    };

    const makePassResetRequest = async () => {
        let isValid = true;

        if (!passwordConfirm.trim()) {
            toast.error(t("REENTER_PASSWORD"));
            isValid = false;
            return;
        }

        if (!password.trim()) {
            toast.error(t("ENTER_A_PASSWORD"));
            isValid = false;
            return;
        }

        if (!otp.trim()) {
            toast.error(t("ENTER_OTP"));
            isValid = false;
            return;
        }

        if (passwordConfirm !== password) {
            toast.error(t("PASSWORD_DONT_MATCH"));
            isValid = false;
        }

        if (isValid) {
            setIsWaiting(true);
            const url_api = `${getAPIURL()}users/modifypassword`;
            const requestOptions = {
                method: 'POST',
                body: JSON.stringify({ otp, reqid, userhash, password }),
                mode: 'cors',
                headers: new Headers({ 'Content-Type': 'application/json' }),
            };

            try {
                const response = await fetch(url_api, requestOptions as RequestInit);
                const body = await response.json();

                if (body?.success) {
                    const message = getMessageFromAPIResponse(body);
                    router.push(`/login?message=${message}`);
                } else {
                    const message = getMessageFromAPIResponse(body);
                    toast.error(t(message));
                }
            } catch (error) {
                console.error("makePassResetRequest", error);
                toast.error(error.message);
            } finally {
                setIsWaiting(false);
            }
        }
    };

    const getUsernameForm = () => (
        <div>
            <Form.Control
                maxLength={40}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("ENTER_USERNAME")}
            />
            <br />
            <br />
            {isWaiting ? (
                <div style={{ textAlign: 'center' }}><Loading /></div>
            ) : (
                <div style={{ textAlign: 'center' }}>
                    <Button onClick={makeGetOTPRequest}>{t("SUBMIT")}</Button>
                </div>
            )}
        </div>
    );

    const getNewPasswordForm = () => (
        <div>
            <Form.Control
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t("ENTER_OTP")}
            />
            <br />
            <Form.Control
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                maxLength={40}
                placeholder={t("ENTER_A_PASSWORD")}
            />
            <br />
            <Form.Control
                onChange={(e) => setPasswordConfirm(e.target.value)}
                value={passwordConfirm}
                type="password"
                maxLength={40}
                placeholder={t("REENTER_PASSWORD")}
            />
            <br />
            {isWaiting ? (
                <div style={{ textAlign: 'center' }}><Loading /></div>
            ) : (
                <div style={{ textAlign: 'center' }}>
                    <Button onClick={makePassResetRequest}>{t("SUBMIT")}</Button>
                </div>
            )}
        </div>
    );

    return (
        <>
            <Head>
                <title>{t("APP_NAME_TITLE") + " - " + t("RESET_PASSWORD")}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Container fluid>
                <div style={{
                    margin: "0",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <Image alt='Logo' src="/logo.png" width={100} height={100} />
                    </div>
                    <h2 style={{ textAlign: 'center' }}>{t("APP_NAME")}</h2>
                    <br />
                    <h1>{t("RESET_PASSWORD")}</h1>
                    <br />
                    {showNewPasswordForm ? getNewPasswordForm() : getUsernameForm()}
                    <br />
                    <div style={{ textAlign: "center" }}>
                        <Link href="/login">{t("CANCEL")}</Link>
                    </div>
                </div>
            </Container>
        </>
    );
};

export default ResetPassword;

export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"], null, AVAILABLE_LANGUAGES)),
        },
    };
}