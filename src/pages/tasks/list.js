import Head from 'next/head'
import TaskList from '@/components/tasks/TaskList'
import AppBarGeneric from '@/components/common/AppBarGeneric'
import '@/../bootstrap/dist/css/bootstrap.min.css'
import GenericLists from '@/components/common/GenericLists'
import { Component } from 'react'
import { PRIMARY_COLOUR, SECONDARY_COLOUR } from '@/config/style'
import { getTodaysDateUnixTimeStamp } from '@/helpers/general'
import { Col, Row } from 'react-bootstrap'
import AddTask from '@/components/common/AddTask'
import { Toastify } from '@/components/Generic'
import TaskViewOptions from '@/components/common/TaskViewOptions'
import moment from 'moment'
import { AiOutlineMenuUnfold } from 'react-icons/ai'
import { TbLayoutSidebarLeftCollapse } from 'react-icons/tb'
import Offcanvas from 'react-bootstrap/Offcanvas';
import { withRouter } from 'next/router'
import { MYDAY_LABEL } from '@/config/constants'
import { getI18nObject } from '@/helpers/frontend/general'

class TaskViewList extends Component {

  constructor(props) {
    super(props)
    this.i18next = getI18nObject()
    this.state = { showTaskEditor: true, caldav_accounts_id: null, calendars_id: null, filter: { logic: "or", filter: { due: [0, getTodaysDateUnixTimeStamp()], label: [MYDAY_LABEL] } }, title: "My Day", updated: "", isSyncing: false, taskView: "tasklist", showLeftColumnOffcanvas: false, showListColumn: true }
    this.getParamsFromURL = this.getParamsFromURL.bind(this)
    this.calendarNameClicked = this.calendarNameClicked.bind(this)
    this.labelClicked = this.labelClicked.bind(this)
    this.myDayClicked = this.myDayClicked.bind(this)
    this.dueTodayClicked = this.dueTodayClicked.bind(this)
    this.dueThisWeek = this.dueThisWeek.bind(this)
    this.allTasksClicked = this.allTasksClicked.bind(this)
    this.taskEditorShown = this.taskEditorShown.bind(this)
    this.taskEditorHidden = this.taskEditorHidden.bind(this)
    this.onSynComplete = this.onSynComplete.bind(this)
    this.highPriorityClicked = this.highPriorityClicked.bind(this)
    this.taskViewChanged = this.taskViewChanged.bind(this)
    this.filterClicked = this.filterClicked.bind(this)
    this.showListColumnButtonClicked = this.showListColumnButtonClicked.bind(this)
    this.handleCloseOffcanvas = this.handleCloseOffcanvas.bind(this)
  }

  componentDidMount() {
    //this.getParamsFromURL()
    //  this.setState({ caldav_accounts_id: '', calendars_id: '', filter: {}, title: "" })
    if (window != undefined) {
      window.addEventListener('resize', this.updateDimensions);

      if (window.innerWidth < 900) {
        this.setState({ showListColumn: false })

      } else {
        this.setState({ showListColumn: true })

      }
    }

  }
  updateDimensions = () => {
    if (window.innerWidth < 700) {
      this.setState({ showListColumn: false })

    } else {
      this.setState({ showListColumn: true })

    }
  };

  getParamsFromURL() {
    if (typeof window !== 'undefined') {
      var url = new URL(window.location.href);
      var caldav_accounts_id = url.searchParams.get("caldav_accounts_id");
      var calendars_id = url.searchParams.get("calendars_id");

      this.setState({ caldav_accounts_id: caldav_accounts_id, calendars_id: calendars_id, filter: { due: [0, getTodaysDateUnixTimeStamp()] }, title: "Due Today" })

    }

  }
  showListColumnButtonClicked() {
    this.setState({ showLeftColumnOffcanvas: true, })
  }
  calendarNameClicked(caldav_accounts_id, calendars_id) {
    this.setState({ filter: {}, title: null, caldav_accounts_id: caldav_accounts_id, calendars_id: calendars_id, showLeftColumnOffcanvas: false })
  }
  handleCloseOffcanvas() {
    this.setState({ showLeftColumnOffcanvas: false })
  }

  labelClicked(e) {
    var labelName = e.target.textContent
    var currentFilter = {}
    currentFilter["label"] = [labelName]
    this.setState({ filter: { filter: currentFilter }, caldav_accounts_id: null, calendars_id: null, title: "Label: " + labelName, showLeftColumnOffcanvas: false })
  }
  myDayClicked() {
    var filter = { logic: "or", filter: { due: [0, getTodaysDateUnixTimeStamp()], label: [MYDAY_LABEL] } }
    this.setState({ filter: filter, title: "My Day", caldav_accounts_id: '', calendars_id: null, showLeftColumnOffcanvas: false })

  }
  dueTodayClicked() {
    var filter = { filter: { due: [0, getTodaysDateUnixTimeStamp()] } }
    this.setState({ filter: filter, title: "Due Today", caldav_accounts_id: '', calendars_id: null, showLeftColumnOffcanvas: false })

  }
  dueThisWeek() {
    var filter = { filter: { due: [0, getTodaysDateUnixTimeStamp() + 604800] } }
    this.setState({ filter: filter, title: "Due in Next Seven Days", caldav_accounts_id: '', calendars_id: null, showLeftColumnOffcanvas: false })

  }
  allTasksClicked() {
    this.setState({ filter: {}, title: "All Tasks", caldav_accounts_id: '', calendars_id: null, showLeftColumnOffcanvas: false })

  }
  highPriorityClicked() {
    this.setState({ title: "High Priority", filter: { filter: { priority: 4 } }, caldav_accounts_id: '', calendars_id: null, showLeftColumnOffcanvas: false })
  }
  taskEditorShown() {
    this.setState({ showTaskEditor: true })
  }
  taskEditorHidden() {
    this.setState({ showTaskEditor: false })
  }
  async onSynComplete(toFetch) {
    this.setState({ isSyncing: true })

    var updated = Math.floor(Date.now() / 1000)
    this.setState({ updated: updated, isSyncing: false });


  }
  taskViewChanged(view) {
    this.setState({ taskView: view })
  }
  filterClicked(filter, name) {

    var newFilter = filter
    console.log(newFilter)
    if (newFilter.filter.due != null && newFilter.filter.due != undefined && newFilter.filter.due.length > 1) {
      //newFilter.due[0] = moment(new Date(filter.due[0])).unix().toString()
      //newFilter.due[1] = moment(new Date(filter.due[1])).unix().toString()

    }
    var updated = Math.floor(Date.now() / 1000)

    this.setState({ updated: updated, filter: newFilter, caldav_accounts_id: null, calendars_id: null, title: name, showLeftColumnOffcanvas: false })
  }
  render() {
    var borderRight = this.state.showListColumn ? '3px solid ' + SECONDARY_COLOUR : ""

    var leftColumnMatter = (<GenericLists filterClicked={this.filterClicked} labelClicked={this.labelClicked} calendarNameClicked={this.calendarNameClicked} dueTodayClicked={this.dueTodayClicked} myDayClicked={this.myDayClicked} highPriorityClicked={this.highPriorityClicked} dueThisWeek={this.dueThisWeek} allTasksClicked={this.allTasksClicked} />
    )
    var listColumn = !this.state.showListColumn ? null : (
      <Col lg={3} style={{ paddingTop: 30 }} >
        {leftColumnMatter}
      </Col>
    )
    var expandColButton = this.state.showListColumn ? null : <div style={{ marginTop: 20 }}><AiOutlineMenuUnfold color={PRIMARY_COLOUR} onClick={this.showListColumnButtonClicked} size={24} /></div>
    return (
      <>
        <Head>
          <title>{this.i18next.t("APP_NAME_TITLE")+" - "+this.i18next.t("TASK_VIEW")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric onSynComplete={this.onSynComplete} isSyncing={this.props.isSyncing} />

        <div className='container-fluid'>
          <Row>
            <Col>
              <div  ></div>
            </Col>
          </Row>
          <div className='row'>
            {listColumn}
            <Col lg={9} style={{ borderLeft: borderRight, }}>
              <AddTask onSuccessAddTask={this.onSynComplete} caldav_accounts_id={this.state.caldav_accounts_id} calendars_id={this.state.calendars_id} />
              {expandColButton}
              <TaskViewOptions changeView={this.taskViewChanged} />
              <TaskList view={this.state.taskView} fetchEvents={this.onSynComplete} updated={this.state.updated} router={this.props.router} title={this.state.title} filter={this.state.filter} caldav_accounts_id={this.state.caldav_accounts_id} calendars_id={this.state.calendars_id} />
            </Col>
          </div>
        </div>
        {/*  <Toastify /> */}
        <Offcanvas show={this.state.showLeftColumnOffcanvas} onHide={this.handleCloseOffcanvas}>
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

export default withRouter(TaskViewList)