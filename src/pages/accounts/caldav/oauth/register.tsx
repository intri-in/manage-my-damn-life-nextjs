import Head from 'next/head'
import Container from 'react-bootstrap/Container';
import AppBarGeneric  from "@/components/common/AppBar"
import CaldavAccounts from '@/components/common/calendars/caldavAccounts/CaldavAccounts'
import { useCustomTheme } from '@/helpers/frontend/theme';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AVAILABLE_LANGUAGES } from '@/config/constants';
import { EmptyPageBeforeLogin } from '@/components/common/EmptyPageBeforeLogin';
import { useAuthGuard } from '@/helpers/frontend/hooks/useAuthGuard';
import { ProcessOAuthInfoCaldav } from '@/components/common/calendars/caldavAccounts/ProcessOAuthInfoCaldav';

export default function Caldav() {
  const isLoggedIn = useAuthGuard("/accounts/caldav");

  const {t} = useTranslation()
  useCustomTheme()


    if(!isLoggedIn) return(<EmptyPageBeforeLogin />)

    return (
    <>
        <Head>
          <title>{t("APP_NAME_TITLE")} - {t("CALDAV_ACCOUNTS")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric  />

        <Container fluid >
             <div  style={{marginTop: 20}}><ProcessOAuthInfoCaldav /></div>
        </Container>
    </>
    )
}


export async function getStaticProps({ locale}) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], null, AVAILABLE_LANGUAGES)),
      // Will be passed to the page component as props
    },
  }
}