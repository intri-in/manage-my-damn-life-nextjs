import Head from 'next/head'
import Container from 'react-bootstrap/Container';
import AppBarGeneric  from "@/components/common/AppBarGeneric"
import CaldavAccounts from '@/components/common/calendars/caldavAccounts/CaldavAccounts'

export default function Caldav() {

    return (
    <>
        <Head>
          <title>MMDM - Task View - List</title>
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