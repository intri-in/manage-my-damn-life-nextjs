
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


const SyncManagerPage = () =>{
  const isLoggedIn = useAuthGuard("/sync-manager");
  const router = useRouter()
  const {t} = useTranslation()
  useCustomTheme()

    if(!isLoggedIn) return (<EmptyPageBeforeLogin />)   
    return(
        <>
        <Head>
          <title>{t("APP_NAME_TITLE")+" - "+t("SYNC_MANAGER")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric />

        <Container fluid >
             <div style={{marginTop: 20}}>
              <SyncManagerMainComponent />
             </div>
        </Container>
    </>
    )

}

export default SyncManagerPage


export async function getStaticProps({ locale}) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], null, AVAILABLE_LANGUAGES )),
      // Will be passed to the page component as props
    },
  }
}