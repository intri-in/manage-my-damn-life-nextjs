import Head from 'next/head'
import TaskList from '@/components/tasks/TaskList'
import  AppBarGeneric  from '@/components/common/AppBarGeneric'
import { Col, Row } from 'react-bootstrap'
import { getTodaysDateUnixTimeStamp, varNotEmpty } from '@/helpers/general'
import DashboardView from '@/components/fullcalendar/DashboardView'
import AddTask from '@/components/common/AddTask/AddTask'
import { PRIMARY_COLOUR, SECONDARY_COLOUR } from '@/config/style'
import { Component } from 'react'
import { getI18nObject } from '@/helpers/frontend/general'
import { MYDAY_LABEL } from '@/config/constants'
import Offcanvas from 'react-bootstrap/Offcanvas';
import { AiOutlineMenuUnfold } from 'react-icons/ai'
import Script from 'next/script'
import HomeTasks from '@/components/Home/HomeTasks/HomeTasks'

export default class CombinedView extends Component {
  constructor(props)
  {
    super(props)
    this.i18next = getI18nObject()
    this.state = {updated: props.updated, scheduleItem: null ,showListColumn: true, calendarAR: 1.35}
    this.fetchEvents = this.fetchEvents.bind(this)
    this.scheduleItem = this.scheduleItem.bind(this)
    this.updateDimensions = this.updateDimensions.bind(this)
    this.showListColumnButtonClicked = this.showListColumnButtonClicked.bind(this)
    this.handleCloseOffcanvas = this.handleCloseOffcanvas.bind(this)
    this.onSynComplete = this.onSynComplete.bind(this)
  }

  componentDidMount(){
    if (window != undefined) {
     // window.addEventListener('resize', this.updateDimensions);

      if (window.innerWidth < 900) {
        this.setState({ showListColumn: false })

      } else {
        this.setState({ showListColumn: true })

      }
    }


  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.updated!=this.props.updated)
    {
        this.setState({updated: this.props.updated})
    }
  }

  updateDimensions = () => {
    if (window.innerWidth < 700) {
      
      this.setState({ showListColumn: false, calendarAR: 0.3 })

    } else {
      this.setState({ showListColumn: true })

    }
  };

  showListColumnButtonClicked() {
    this.setState({ showLeftColumnOffcanvas: true, })
  }
  handleCloseOffcanvas() {
    this.setState({ showLeftColumnOffcanvas: false })
  }


  onSynComplete(){
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
    var borderLeft = this.state.showListColumn ? '3px solid ' + SECONDARY_COLOUR : ""
    var leftColumnMatter = ( <><AddTask onSuccessAddTask={this.fetchEvents} />
    <HomeTasks scheduleItem={this.scheduleItem} updated={this.state.updated} fetchEvents={this.fetchEvents} view="tasklist" caldav_accounts_id={null} calendars_id={null} filter={{}} />
    
{/*       
    <h3 style={{marginTop: 30}}>My Day</h3>
<TaskList scheduleItem={this.scheduleItem} updated={this.state.updated} fetchEvents={this.fetchEvents} view="tasklist" caldav_accounts_id={null} calendars_id={null} filter={{logic: "or", filter: {due:[0, getTodaysDateUnixTimeStamp()], label: [MYDAY_LABEL]}}} />
 */}      </>)
      var listColumn = !this.state.showListColumn ? null : (
        <Col lg={4} style={{ paddingTop: 30 }} >
          {leftColumnMatter}
        </Col>
      )
      var expandColButton = this.state.showListColumn ? null : <div style={{ marginTop: 20 }}><AiOutlineMenuUnfold color={PRIMARY_COLOUR} onClick={this.showListColumnButtonClicked} size={24} /></div>

    return (
      <>
        
  
          <Row style={{}}>
            {listColumn}
            <Col lg={8} style={{paddingTop: 20, borderLeft: borderLeft}}>
            {expandColButton}

            <DashboardView calendarAR={this.state.calendarAR} scheduleItem={this.state.scheduleItem} />
            </Col>
          </Row> 
          <Offcanvas placement='start' show={this.state.showLeftColumnOffcanvas} onHide={this.handleCloseOffcanvas}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title></Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {leftColumnMatter}
          </Offcanvas.Body>
        </Offcanvas>

        </>
        
    )
    }


}