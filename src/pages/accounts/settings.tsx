import AppBarGeneric from "@/components/common/AppBar";
import SettingsPage from "@/components/page/SettingsPage/SettingsPage";
import { getI18nObject } from "@/helpers/frontend/general";
import { checkLogin_InBuilt, logoutUser_withRedirect } from "@/helpers/frontend/user";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";


export default function Settings(){
    const { data: session, status } = useSession()
    const router = useRouter()
    const i18next = getI18nObject()
    useEffect(() =>{
      async function checkAuth(){
        if(await nextAuthEnabled()){
          if (status=="unauthenticated" ) {
            signIn()
          }
        }else{
          // Check login using inbuilt function.
  
          checkLogin_InBuilt(router, '/accounts/settings')
        }

      }
      checkAuth()
    }, [status,router])
    

     
  
    
    return(
        <>
            <Head>
              <title>{i18next.t("APP_NAME_TITLE") + " - " + i18next.t("SETTINGS")}</title>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <AppBarGeneric />

            <SettingsPage  />
        </>
    )
}