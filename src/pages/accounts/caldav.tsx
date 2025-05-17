import Head from 'next/head'
import Container from 'react-bootstrap/Container';
import AppBarGeneric  from "@/components/common/AppBar"
import CaldavAccounts from '@/components/common/calendars/caldavAccounts/CaldavAccounts'
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { nextAuthEnabled } from '@/helpers/thirdparty/nextAuth';
import { useRouter } from 'next/router';
import { checkLogin_InBuilt } from '@/helpers/frontend/user';
import { getThemeMode, isDarkModeEnabled, useCustomTheme } from '@/helpers/frontend/theme';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Caldav() {
  const { data: session, status } = useSession() 
  const router = useRouter()
  const {t} = useTranslation()
  useCustomTheme()
  useEffect(() =>{

    let isMounted =true
    async function checkAuth(){
      
      if(await nextAuthEnabled()){
        if (status=="unauthenticated" ) {
          signIn()
        }
      }else{
        // Check login using inbuilt function.
        checkLogin_InBuilt(router,"/accounts/caldav")
      }
    }

    if(isMounted){

      checkAuth()
    }
    return () =>{
      isMounted = false
  }
}, [status, router])

    return (
    <>
        <Head>
          <title>{t("APP_NAME_TITLE")} - {t("CALDAV_ACCOUNTS")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric  />

        <Container fluid >
             <div  style={{marginTop: 20}}><CaldavAccounts   /></div>
        </Container>
    </>
    )
}


export async function getStaticProps({ locale}) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], null, ["en","de"])),
      // Will be passed to the page component as props
    },
  }
}