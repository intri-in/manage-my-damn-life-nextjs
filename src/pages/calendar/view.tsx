'use client'
import AppBarGeneric from "@/components/common/AppBar";
import { GlobalViewManager } from "@/components/common/GlobalViewManager/GlobalViewManager";
import { EventEditorViewManager } from "@/components/events/EventEditorViewManager";
import { CalendarViewWithStateManagement } from "@/components/fullcalendar/CalendarViewWithStateManagement";
import CalendarView from "@/components/page/CalendarViewPage/CalendarView";
import { AVAILABLE_LANGUAGES } from "@/config/constants";
import { useCustomTheme } from "@/helpers/frontend/theme";
import { checkLogin_InBuilt } from "@/helpers/frontend/user";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { signIn, useSession } from "next-auth/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";

export default function CalendarViewPage(){
    const { data: session, status } = useSession()
    const router = useRouter()
    const {t} = useTranslation()
    useCustomTheme()

    useEffect(() =>{
      async function checkAuth(){
        
        if(await nextAuthEnabled()){
          if (status=="unauthenticated" ) {
            signIn()
          }
        }else{
          // Check login using inbuilt function.
  
          checkLogin_InBuilt(router, "/calendar/view")
        }
      }
      checkAuth()
    }, [status,router])
    

     
  
    
    return(
        <>
        <Head>
        <title>{t("APP_NAME_TITLE")} - {t("TASKS")}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric />
        <div className='container-fluid'>
        <CalendarViewWithStateManagement calendarAR={1} />
        <EventEditorViewManager />
        <GlobalViewManager />         
        </div>
        </>)
}

export async function getStaticProps({ locale}) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], null, AVAILABLE_LANGUAGES)),
      // Will be passed to the page component as props
    },
  }
}