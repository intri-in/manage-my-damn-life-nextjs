import Head from 'next/head'
import Container from 'react-bootstrap/Container';
import AppBarGeneric  from "@/components/common/AppBar"
import CaldavAccounts from '@/components/common/calendars/caldavAccounts/CaldavAccounts'
import { getI18n } from 'react-i18next';
import { getI18nObject } from '@/helpers/frontend/general';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { nextAuthEnabled } from '@/helpers/thirdparty/nextAuth';
import { useRouter } from 'next/router';
import { checkLogin_InBuilt } from '@/helpers/frontend/user';
import { getThemeMode, isDarkModeEnabled, useCustomTheme, useTheme } from '@/helpers/frontend/theme';

export default function Caldav() {
  const { data: session, status } = useSession() 
  const router = useRouter()
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

  var i18next = getI18nObject()
    return (
    <>
        <Head>
          <title>{i18next.t("APP_NAME_TITLE")} - {i18next.t("CALDAV_ACCOUNTS")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric  />

        <Container fluid >
             <div  style={{marginTop: 20}}><CaldavAccounts  /></div>
        </Container>
    </>
    )
}