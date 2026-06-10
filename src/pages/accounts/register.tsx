import { Toastify } from '@/components/Generic';
import { AVAILABLE_LANGUAGES } from '@/config/constants';
import { getMessageFromAPIResponse } from '@/helpers/frontend/response';
import { getAPIURL } from '@/helpers/general';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { useTranslation } from 'next-i18next';
import { MdArrowBack } from 'react-icons/md';
import { toast } from 'react-toastify';
import validator from 'validator';
import { userRegistrationAllowed } from '@/helpers/api/settings';
import { isInstalled_CheckWithSequelize } from '@/helpers/api/install';

const Register = ({registrationAllowed, installed}) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [email, setEmail] = useState("");
    const router = useRouter();
    const [allowedAccess, setAllowedAccess] = useState(true);
    
    const {t} = useTranslation()
    
    const goBackClicked = () => {
        router.push("/login");
    };

    const registerButtonClicked = () => {
        let isValid = true;

        if (!username.trim()) {
            toast.error(t("INVALID_USERNAME"));
            isValid = false;
            return;
        }

        if (!email.trim() || !validator.isEmail(email)) {
            toast.error(t("INVALID_EMAIL"));
            isValid = false;
            return;
        }

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

        if (passwordConfirm !== password) {
            toast.error(t("PASSWORD_DONT_MATCH"));
            isValid = false;
            return;
        }

        if (isValid) {
            makeRequestToServer();
        }
    };
    const notInstalledBannerClicked = () =>{
        router.push("/install")
    }

    const makeRequestToServer = async () => {
        const url_api = `${getAPIURL()}users/register`;

        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({ password, username, email }),
            mode: 'cors',
            headers: new Headers({ 'Content-Type': 'application/json' }),
        };

        try {
            const response = await fetch(url_api, requestOptions as RequestInit);
            const body = await response.json();

            if (body?.success) {
                const message = getMessageFromAPIResponse(body);

                if (message === "USER_INSERT_OK") {
                    router.push("/login?message=USER_INSERT_OK");
                } else if (message === "ERROR_LOGIN_WITH_PASSWORD") {
                    router.push("/login?message=ERROR_LOGIN_WITH_PASSWORD");
                } else {
                    toast.error(t(message));
                }
            } else {
                toast.error(t("ERROR_GENERIC"));
            }
        } catch (e) {
            toast.error(t("ERROR_GENERIC"));
            console.error("makeRequestToServer", e);
        }
    };
    let notInstalledBanner;
    if (!installed) {
      notInstalledBanner = (
        <div onClick={notInstalledBannerClicked} style={{ background: "darkred", textAlign: "center", color: "white" }}>{t("MMDL_NOT_INSTALLED")}</div>
      );
    }


    return (
        <>
            <Head>
                <title>{t("APP_NAME_TITLE") + " - " + t("REGISTER")}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {notInstalledBanner}
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
                    { 
                    (registrationAllowed) ? 
                        (
                            <>
                            
                                <div onClick={goBackClicked}>
                                    <MdArrowBack size={24} />
                                </div>
                                <br />
                                <h1>{t("REGISTER")}</h1>
                                <Form.Control
                                    maxLength={40}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder={t("ENTER_USERNAME")}
                                />
                                <br />
                                <Form.Control
                                    maxLength={40}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("ENTER_EMAIL")}
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
                                <Button onClick={registerButtonClicked}>
                                    {t("REGISTER")}
                                </Button>
                        </>
                        ):(
                            <>

                            <Alert variant='danger'>{t("USER_REG_DISABLED")}</Alert>
                            </>
                        )
                   }
                </div>
            </Container>
            {/* <Toastify /> */}
        </>
    );
};

export default Register;

// export async function getStaticProps({ locale }) {
//     return {
//         props: {
//             ...(await serverSideTranslations(locale, ["common"], null, AVAILABLE_LANGUAGES)),
//         },
//     };
// }

export async function getServerSideProps({ locale }) {
    return {
        props: {
            installed: await isInstalled_CheckWithSequelize(),
            registrationAllowed: await userRegistrationAllowed(), // or fetch from DB, etc.
            ...(await serverSideTranslations(locale, ["common"], null, AVAILABLE_LANGUAGES)),
        },
    };
}