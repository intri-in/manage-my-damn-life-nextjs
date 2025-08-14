
import { useCustomTheme } from "@/helpers/frontend/theme";
import { checkLogin_InBuilt } from "@/helpers/frontend/user";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from 'next/head'
import Container from 'react-bootstrap/Container';
import AppBarGeneric  from "@/components/common/AppBar"
import TemplateManager from "@/components/templates/TemplateManager";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AVAILABLE_LANGUAGES } from "@/config/constants";
import { EmptyPageBeforeLogin } from "@/components/common/EmptyPageBeforeLogin";


export default function ManageTemplates(){
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

    if(!isloggedIn) (<EmptyPageBeforeLogin />)   
    return(
        <>
        <Head>
          <title>{t("APP_NAME_TITLE")+" - "+t("TEMPLATE_MANAGER")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric />

        <Container fluid >
             <div style={{marginTop: 20}}>
              <TemplateManager />
             </div>
        </Container>
    </>
    )
}

export async function getStaticProps({ locale}) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], null, AVAILABLE_LANGUAGES )),
      // Will be passed to the page component as props
    },
  }
}