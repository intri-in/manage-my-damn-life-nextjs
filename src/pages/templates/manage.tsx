
import { useCustomTheme } from "@/helpers/frontend/theme";
import { checkLogin_InBuilt } from "@/helpers/frontend/user";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from 'next/head'
import Container from 'react-bootstrap/Container';
import AppBarGeneric  from "@/components/common/AppBar"
import { getI18nObject } from "@/helpers/frontend/general";
import TemplateManager from "@/components/templates/TemplateManager";

const i18next = getI18nObject()

export default function ManageTemplates(){
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
  
          checkLogin_InBuilt(router, "/labels/manage")
        }
        
      }
      checkAuth()
    }, [status, router])
    

     
  
    
    return(
        <>
        <Head>
          <title>{i18next.t("APP_NAME_TITLE")+" - "+i18next.t("LABEL_MANAGER")}</title>
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