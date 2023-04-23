import Head from 'next/head'
import Container from 'react-bootstrap/Container';
import AppBarGeneric  from "@/components/common/AppBarGeneric"
import CaldavAccounts from '@/components/common/calendars/caldavAccounts/CaldavAccounts'
import LabelManager from '@/components/LabelManager';
import { makeUpdateLabelRequest } from '@/helpers/frontend/labels';
import { getAuthenticationHeadersforUser } from '@/helpers/frontend/user';
import { getI18nObject } from '@/helpers/frontend/general';

export default function ManageLables({reply}) {

  var i18next = getI18nObject()
    return (
    <>
        <Head>
          <title>{i18next.t("APP_NAME_TITLE")+" - "+i18next.t("LABEL_MANAGER")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric />

        <Container fluid >
             <div style={{marginTop: 20}}>
                <LabelManager />
             </div>
        </Container>
    </>
    )
}

