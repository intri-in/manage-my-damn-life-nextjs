import AppBarGeneric from "@/components/common/AppBar";
import { AVAILABLE_LANGUAGES } from "@/config/constants";
import { useCustomTheme } from "@/helpers/frontend/theme";
import { checkLogin_InBuilt } from "@/helpers/frontend/user";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { signIn, useSession } from "next-auth/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { EmptyPageBeforeLogin } from "@/components/common/EmptyPageBeforeLogin";
import SettingsPage from "@/components/page/SettingsPage/SettingsPageFunctional";


export default function Settings({registrationDisabledFromEnv}:{registrationDisabledFromEnv:boolean}){
  const { data: session, status } = useSession() 
  const [isloggedIn, setIsloggedIn] = useState(false)
  const router = useRouter()
  const {t} = useTranslation()
  useCustomTheme()
  useEffect(() =>{

    let isMounted =true
    async function checkAuth(){
      
        if(await nextAuthEnabled()){
          if (status=="unauthenticated" ) {
            signIn()
          }else{
              setIsloggedIn(true)
          }
        }else{
          // Check login using inbuilt function.
          setIsloggedIn(await checkLogin_InBuilt(router,"/accounts/caldav"))
        }
      }

      if(isMounted){

        checkAuth()
      }
      return () =>{
        isMounted = false
    }
  }, [status, router])

    if(!isloggedIn) return (<EmptyPageBeforeLogin />)     
  
    
    return(
        <>
            <Head>
              <title>{t("APP_NAME_TITLE") + " - " + t("SETTINGS")}</title>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <AppBarGeneric />

            <SettingsPage registrationDisabledFromEnv={registrationDisabledFromEnv} i18next={t}  />
        </>
    )
}

export async function getServerSideProps({ locale }) {
    return {
        props: {
            registrationDisabledFromEnv: process.env.DISABLE_USER_REGISTRATION ? true: false, // or fetch from DB, etc.
            ...(await serverSideTranslations(locale, ["common"], null, AVAILABLE_LANGUAGES)),
        },
    };
}