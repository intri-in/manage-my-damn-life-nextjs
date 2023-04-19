import Head from 'next/head'
import TaskList from '@/components/tasks/TaskList'
import  AppBarGeneric  from '@/components/common/AppBarGeneric'
import { Col, Row } from 'react-bootstrap'
import { getTodaysDateUnixTimeStamp, varNotEmpty } from '@/helpers/general'
import DashboardView from '@/components/fullcalendar/DashboardView'
import AddTask from '@/components/common/AddTask'
import { SECONDARY_COLOUR } from '@/config/style'
import { Component } from 'react'
import { getI18nObject } from '@/helpers/frontend/general'
import { MYDAY_LABEL } from '@/config/constants'

export default class Home extends Component {
  constructor(props)
  {
    super(props)
    this.i18next = getI18nObject()
    this.state = {updated: "", scheduleItem: null}
    this.fetchEvents = this.fetchEvents.bind(this)
    this.scheduleItem = this.scheduleItem.bind(this)

  }


  fetchEvents() {
    var updated = Math.floor(Date.now() / 1000)
    this.setState({updated: updated})
  }

  scheduleItem(data)
  {
    console.log(data)
    if(varNotEmpty(data) && varNotEmpty(data.summary) && varNotEmpty(data.calendar_id))
    {
      this.setState({scheduleItem : data})
    }
  }
  render(){
    var borderRight="2px solid "+SECONDARY_COLOUR

    return (
      <>
        <Head>
          <title>{this.i18next.t("APP_NAME_TITLE")} - {this.i18next.t("TASKS")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric />
        <div className='container-fluid'>
  
          <Row style={{}}>
            <Col sm={4} style={{paddingTop: 20, borderRight:borderRight}} >
            <AddTask  />
  
            <h3 style={{marginTop: 30}}>My Day</h3>
              <TaskList scheduleItem={this.scheduleItem} updated={this.state.updated} fetchEvents={this.fetchEvents} view="tasklist" caldav_accounts_id={null} calendars_id={null} filter={{logic: "or", filter: {due:[0, getTodaysDateUnixTimeStamp()], label: [MYDAY_LABEL]}}} />
            </Col>
            <Col sm={8} style={{paddingTop: 20, }}>
            <DashboardView scheduleItem={this.state.scheduleItem} />
            </Col>
          </Row> 
                 
  
        </div>
                  
      </>
    )
    }


}