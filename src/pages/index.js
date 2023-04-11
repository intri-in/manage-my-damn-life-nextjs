import Head from 'next/head'
import TaskList from '@/components/tasks/TaskList'
import  AppBarGeneric  from '@/components/common/AppBarGeneric'
import { Col, Row } from 'react-bootstrap'
import { getTodaysDateUnixTimeStamp } from '@/helpers/general'
import DashboardView from '@/components/fullcalendar/DashboardView'
import AddTask from '@/components/common/AddTask'
import { SECONDARY_COLOUR } from '@/config/style'

export default function Home() {
  const events = [
    { title: 'Meeting', start: new Date() }
  ]
  function renderEventContent(eventInfo) {
    return (
      <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </>
    )
  }

  var borderRight="2px solid "+SECONDARY_COLOUR
  return (
    <>
      <Head>
        <title>MMDM - Tasks</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppBarGeneric />
      <div className='container-fluid'>

        <Row style={{}}>
          <Col sm={4} style={{paddingTop: 20, borderRight:borderRight}} >
          <AddTask  />

          <h3 style={{marginTop: 30}}>My Day</h3>
            <TaskList view="tasklist" caldav_accounts_id={null} calendars_id={null} filter={{logic: "or", filter: {due:[0, getTodaysDateUnixTimeStamp()], label: ["mmdm-myday"]}}} />
          </Col>
          <Col sm={8} style={{paddingTop: 20, }}>
          <DashboardView />
          </Col>
        </Row> 
               

      </div>
                
    </>
  )
}