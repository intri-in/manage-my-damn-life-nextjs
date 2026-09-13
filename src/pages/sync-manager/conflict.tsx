import { useCustomTheme } from "@/helpers/frontend/theme";
import { useRouter } from "next/router";
import Head from 'next/head'
import Container from 'react-bootstrap/Container';
import AppBarGeneric  from "@/components/common/AppBar"
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AVAILABLE_LANGUAGES } from "@/config/constants";
import { EmptyPageBeforeLogin } from "@/components/common/EmptyPageBeforeLogin";
import SyncManagerMainComponent from "@/components/page/SyncManager/SyncManagerMainComponent";
import { useAuthGuard } from "@/helpers/frontend/hooks/useAuthGuard";
import { useEffect, useState } from "react";
import ConflictResolutionComponent from "@/components/page/SyncManager/ConflictResolutionComponent";



const ConflictResolutionPage = () =>{
  const isLoggedIn = useAuthGuard("/sync-manager"); 
  const [id, setId] = useState("")

  const {t} = useTranslation()
  
  useCustomTheme()

  useEffect(()=>{

    if(typeof(window)!=="undefined"){
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id'); // "shoes"
        if(id) setId(id)
    }

  },[])
    if(!isLoggedIn) return (<EmptyPageBeforeLogin />)   
    return(
        <>
        <Head>
          <title>{t("APP_NAME_TITLE")+" - "+t("CONFLICT_MANAGER")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric />

        <Container fluid >
             <div style={{marginTop: 20}}>
                <div style={{padding:40}} className='container-fluid'>
                  <h1>{t("CONFLICT_MANAGER")}</h1>
                  <br />
                    <ConflictResolutionComponent id={id} />
                </div>

             </div>
        </Container>
    </>
    )

}

export default ConflictResolutionPage


export async function getStaticProps({ locale}) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], null, AVAILABLE_LANGUAGES )),
      // Will be passed to the page component as props
    },
  }
}