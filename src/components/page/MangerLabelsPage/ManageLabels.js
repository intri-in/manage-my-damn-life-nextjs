import Head from 'next/head'
import Container from 'react-bootstrap/Container';
import AppBarGeneric  from "@/components/common/AppBar"
import { withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import LabelManager from '../../LabelManager';

function ManageLabels() {
  const {t} = useTranslation()
    return (
    <>
        <Head>
          <title>{t("APP_NAME_TITLE")+" - "+t("LABEL_MANAGER")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric />

        <Container fluid >
             <div style={{marginTop: 20}}>
                <LabelManager  />
             </div>
        </Container>
    </>
    )
}

export default withRouter(ManageLabels)

