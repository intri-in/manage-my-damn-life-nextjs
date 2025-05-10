'use client'
import AppBarGeneric from "@/components/common/AppBar";
import { GlobalViewManager } from "@/components/common/GlobalViewManager/GlobalViewManager";
import { EventEditorViewManager } from "@/components/events/EventEditorViewManager";
import { CalendarViewWithStateManagement } from "@/components/fullcalendar/CalendarViewWithStateManagement";
import CalendarView from "@/components/page/CalendarViewPage/CalendarView";
import { getI18nObject } from "@/helpers/frontend/general";
import { useCustomTheme } from "@/helpers/frontend/theme";
import { checkLogin_InBuilt } from "@/helpers/frontend/user";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

const i18next = getI18nObject()
export default function CalendarViewPage(){
    const { data: session, status } = useSession()
    const router = useRouter()
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
        <title>{i18next.t("APP_NAME_TITLE")} - {i18next.t("TASKS")}</title>
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