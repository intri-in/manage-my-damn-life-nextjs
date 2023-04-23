import Head from 'next/head'
import Container from 'react-bootstrap/Container';
import AppBarGeneric  from "@/components/common/AppBarGeneric"
import CaldavAccounts from '@/components/common/calendars/caldavAccounts/CaldavAccounts'
import { getI18n } from 'react-i18next';
import { getI18nObject } from '@/helpers/frontend/general';

export default function Caldav() {

  var i18next = getI18nObject()
    return (
    <>
        <Head>
          <title>{i18next.t("APP_NAME_TITLE")} - {i18next.t("CALDAV_ACCOUNTS")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric />

        <Container fluid >
             <div style={{marginTop: 20}}><CaldavAccounts  /></div>
        </Container>
    </>
    )
}