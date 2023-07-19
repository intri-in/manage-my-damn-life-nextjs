import React, { Component } from "react";
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { getAllEvents, getCaldavAccountsfromServer, getParsedTodoList, returnGetParsedVTODO } from "@/helpers/frontend/calendar";
import { isValidResultArray, varNotEmpty } from "@/helpers/general";
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import Form from 'react-bootstrap/Form';
import { Row, Col } from "react-bootstrap";
import { getEmptyEventDataObject, getParsedEvent, isAllDayEvent, majorTaskFilter, rruleToObject, updateEvent } from "@/helpers/frontend/events";
import bootstrap from "@fullcalendar/bootstrap";
import interactionPlugin from '@fullcalendar/interaction'
import Offcanvas from 'react-bootstrap/Offcanvas';
import rrulePlugin from '@fullcalendar/rrule'
import {  getI18nObject } from "@/helpers/frontend/general";
import EventEditor from "../events/EventEditor";
import moment from "moment";
import { getRandomString } from "@/helpers/crypto";
import { getObjectForAPICall, makeGenerateICSRequest } from "@/helpers/frontend/ics";
import { toast } from "react-toastify";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { withRouter } from "next/router";
import { RecurrenceHelper } from "@/helpers/frontend/classes/RecurrenceHelper";
import { FULLCALENDAR_VIEWLIST } from "./FullCalendarHelper";
import { getDefaultViewForCalendar } from "@/helpers/frontend/settings";
import { ListGroupCalDAVAccounts } from "./ListGroupCalDAVAccounts";
import { Preference_CalendarsToShow } from "@/helpers/frontend/classes/UserPreferences/Preference_CalendarsToShow";

class DashboardView extends Component {
    calendarRef = React.createRef()
    constructor(props) {

        super(props)
        this.i18next = getI18nObject()
        var initialViewCalendar = "timeGridDay"
        this.state = { showEventEditor: false, viewValue: initialViewCalendar, events: null, eventEdited: false, eventDataDashBoard: {}, initialViewCalendar: initialViewCalendar, allEvents: {}, recurMap: {}, selectedID: "", calendarAR: props.calendarAR,showTasksChecked: false, allEventsFromServer: null, caldav_accounts:null }
        this.viewChanged = this.viewChanged.bind(this)
        this.eventClick = this.eventClick.bind(this)
        this.handleDateClick = this.handleDateClick.bind(this)
        this.eventEditorClosed = this.eventEditorClosed.bind(this)
        this.eventEditorDismissed = this.eventEditorDismissed.bind(this)
        this.eventDrop = this.eventDrop.bind(this)
        this.eventResize = this.eventResize.bind(this)
        this.scheduleEvent = this.scheduleEvent.bind(this)
        this.showTasksChanged = this.showTasksChanged.bind(this)
        this.addEventsToCalendar = this.addEventsToCalendar.bind(this)
        this.userPreferencesChanged = this.userPreferencesChanged.bind(this)
    }


    async componentDidMount() {
        
        this.getCaldavAccountsfromDB()
        this.getAllEventsfromServer()

        //dayGridMonth
        let calendarApi = this.calendarRef.current.getApi()
        calendarApi.eventDragStart = this.eventDrag

        const view = await getDefaultViewForCalendar()
        if(varNotEmpty(view))
        {
            calendarApi.changeView(view)
            this.setState({viewValue: view})

        }
        this.setState({showTasksChecked: true})

    }

    async getCaldavAccountsfromDB() {
        var caldav_accounts = await getCaldavAccountsfromServer()
        if (caldav_accounts != null && caldav_accounts.success == true) {
            if (caldav_accounts.data.message.length > 0) {
                this.setState({caldav_accounts: caldav_accounts.data.message})
            } else {
                this.props.router.push("/accounts/caldav?message=ADD_A_CALDAV_ACCOUNT")
            }

        }else{
            var message =getMessageFromAPIResponse(caldav_accounts)
            if(message!=null)
            {
                if(message=="PLEASE_LOGIN")
                {
                    // Login required
                    var redirectURL="/login"
                    if(window!=undefined)
                    {


                        redirectURL +="?redirect="+window.location.pathname
                    }
                    this.props.router.push(redirectURL)


                }else{
                    toast.error(this.i18next.t(message))

                }
            }
            else
            {
                toast.error(this.i18next.t("ERROR_GENERIC"))

            }
    }


    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.scheduleItem != prevProps.scheduleItem) {
            //console.log('here')
            if (varNotEmpty(this.props.scheduleItem)) {
                this.scheduleEvent(this.props.scheduleItem)
            }
        }

        if (this.props.calendarAR != prevProps.calendarAR) {
            this.setState({ calendarAR: this.props.calendarAR })
        }
    }

    scheduleEvent(data) {
        var eventData = getEmptyEventDataObject()
        var end = Date.now() + 60 * 1000 * 60

        eventData.data["start"] = new Date(Date.now())
        eventData.data["end"] = new Date(end)
        eventData.data["summary"] = data.summary

        eventData.event["calendar_id"] = data.calendar_id

        this.setState({ showEventEditor: true, eventDataDashBoard: eventData })


    }
    viewChanged(e) {


        let calendarApi = this.calendarRef.current.getApi()
        calendarApi.changeView(e.target.value)

        //calendarApi.addEventSource({events})
        this.setState({ viewValue: e.target.value, })
    }

    getViewValueFromName(viewName) {
        if (viewName == "timeGridDay") {
            return '1'
        }
        else if (viewName == "timeGridWeek") {
            return '2'
        }
        else if (viewName == "dayGridMonth") {
            return '3'
        }

        return '1'
    }
    eventClick = (e) => {
        var newID = e.event.id
        if (varNotEmpty(this.state.allEvents[e.event.id]) == false) {
            //Probably a recurring event. Get ID from map.
            newID = this.state.recurMap[e.event.id]

        }
        var eventData = this.state.allEvents[newID]

        if (varNotEmpty(this.state.allEvents[newID]) && this.state.allEvents[newID].type != "VTODO" && this.state.allEvents[newID].type != "VTIMEZONE" && varNotEmpty(this.state.allEvents[newID])) {

            this.setState({ showEventEditor: true, selectedID: e.event.id, eventDataDashBoard: eventData })

        }
    }
    handleDateClick(e) {
        var eventData = getEmptyEventDataObject()
        eventData.data["start"] = e.date
        eventData.data["end"] = new Date(moment(e.date).unix() * 1000 + 3600 * 1000)


        this.setState({ showEventEditor: true, eventDataDashBoard: eventData })
    }
    eventEditorClosed() {
        var eventData = getEmptyEventDataObject()
        this.setState({ eventDataDashBoard: eventData, selectedID: "", showEventEditor: false })
        this.getAllEventsfromServer()

    }
    async eventDrop(e) {
        //console.log(e)
        var newID = e.event.id
        if (varNotEmpty(this.state.allEvents[e.event.id]) == false) {
            //Probably a recurring event. Get ID from map.
            newID = this.state.recurMap[e.event.id]

        }
        //Calculate delta in ms
        var eventData = this.state.allEvents[newID]
        if (this.state.allEvents[newID].type != "VTODO" && this.state.allEvents[newID].type != "VTIMEZONE" && varNotEmpty(this.state.allEvents[newID])) {
            var delta = e.delta.milliseconds + (e.delta.days * 86400 * 1000) + (e.delta.months * 30 * 86400 * 1000) + (e.delta.years * 365 * 86400 * 1000)

            //console.log("delta", delta)

            var newStart = new Date((moment(eventData.data.start).unix() * 1000) + delta)
            var newEnd = new Date((moment(eventData.data.end).unix() * 1000) + delta)
            //console.log(newStart, newEnd)

            eventData.data.start = newStart
            eventData.data.end = newEnd

            var obj = getObjectForAPICall(eventData.data)
            var ics = await makeGenerateICSRequest({ obj })
            if (varNotEmpty(ics)) {
                const response = await updateEvent(eventData.event.calendar_id, eventData.event.url, eventData.event.etag, ics)
                console.log(response)
                if (varNotEmpty(response) && varNotEmpty(response.success) && response.success == true) {
                    toast.success(this.i18next.t("UPDATE_OK"))
                    this.getAllEventsfromServer()

                } else {
                    var message = getMessageFromAPIResponse(response)
                    if (message != "" && varNotEmpty(message)) {
                        toast.error(this.i18next.t(message.toString()))
                        console.log(response)
                    } else {
                        toast.error((this.i18next.t("ERROR_GENERIC")))

                    }
                }
                this.getAllEventsfromServer()


            } else {
                toast.error((this.i18next.t("ERROR_GENERIC")))

            }
        }


    }
    eventEditorDismissed(e) {
        var eventData = null

        this.setState({ showEventEditor: false, selectedID: "", eventDataDashBoard: eventData })
        this.getAllEventsfromServer()

    }
    async eventResize(e) {
        //console.log("eventResize", e)
        var newID = e.event.id
        if (varNotEmpty(this.state.allEvents[e.event.id]) == false) {
            //Probably a recurring event. Get ID from map.
            newID = this.state.recurMap[e.event.id]

        }
        //Calculate delta in ms
        var eventData = this.state.allEvents[newID]
        if (this.state.allEvents[newID].type != "VTODO" && this.state.allEvents[newID].type != "VTIMEZONE" && varNotEmpty(this.state.allEvents[newID])) {
            var delta = e.endDelta.milliseconds + (e.endDelta.days * 86400 * 1000) + (e.endDelta.months * 30 * 86400 * 1000) + (e.endDelta.years * 365 * 86400 * 1000)

            //console.log("delta", delta)

            var newEnd = new Date((moment(eventData.data.end).unix() * 1000) + delta)
            //console.log(newStart, newEnd)

            eventData.data.end = newEnd

            var obj = getObjectForAPICall(eventData.data)
            var ics = await makeGenerateICSRequest({ obj })
            console.log(ics)
            if (varNotEmpty(ics)) {
                const response = await updateEvent(eventData.event.calendar_id, eventData.event.url, eventData.event.etag, ics)

                if (varNotEmpty(response) && varNotEmpty(response.success) && response.success == true) {
                    toast.success(this.i18next.t("UPDATE_OK"))

                } else {
                    var message = getMessageFromAPIResponse(body)
                    if (message != "" && varNotEmpty(message)) {
                        toast.error(this.i18next.t(message.toString()))


                    }
                    else {
                        toast.error((this.i18next.t("ERROR_GENERIC")))

                    }
                }
                this.getAllEventsfromServer()

            } else {
                toast.error((this.i18next.t("ERROR_GENERIC")))

            }
        }


    }

    eventinArray(eventObject, newEntry)
    {
        if(varNotEmpty(eventObject) && varNotEmpty(newEntry) && varNotEmpty(newEntry.id))
        {
            var found=false
            for(const i in eventObject){

                if(varNotEmpty(eventObject[i].id))
                {
                    if(eventObject[i].id==newEntry.id)
                    {
                        return true
                    }
                }
            }

            return found

        }

        return false

    }
    async addEventsToCalendar(allEvents){
        var finalEvents = []

        
        if (isValidResultArray(allEvents.data.message)) {

            for (let i = 0; i < allEvents.data.message.length; i++) {
                for (const j in allEvents.data.message[i].events) {
                    var userWantsToSee = Preference_CalendarsToShow.getShowValueForCalendar(allEvents.data.message[i].info.caldav_accounts_id, allEvents.data.message[i].events[j].calendar_id)
                    if(userWantsToSee ==false){
                        continue
                    }
                    var event = allEvents.data.message[i].events[j]
                    if (event.deleted == "1" || event.deleted == "TRUE") {
                        continue
                    }
                    if (event.type != "VTODO" && event.type != "VTIMEZONE") {
                        var data = getParsedEvent(allEvents.data.message[i].events[j].data)
                        if (varNotEmpty(data) == false) {
                            continue
                        }
                        if (varNotEmpty(data.summary) == false || (varNotEmpty(data.summary) && data.summary.toString().trim() == "")) {
                            continue
                        }



                        var allDay = isAllDayEvent(data.start, data.end)
                        //console.log(data.end, data.summary )
                        var eventObject = {
                            id: data.uid,
                            title: data.summary,
                            start: data.start,
                            end: data.end,
                            allDay: allDay,
                            editable: true,
                            draggable: true,
                            backgroundColor: allEvents.data.message[i].info.color
                        }
                        //finalEvents.push(eventObject)

                        var rrule = rruleToObject(data.rrule)
                        //Check if the event has a recurrence rule.
                        if (varNotEmpty(data.rrule) && data.rrule != '' && varNotEmpty(rrule["FREQ"]) && rrule["FREQ"] != "") {

                            //var dtstart = new Date(moment(data.start).unix()*1000+86400*1000)
                            var until = rrule["UNTIL"]
                            var eventObject = {
                                id: data.uid,
                                title: data.summary,
                                start: data.start,
                                end: data.end,
                                allDay: allDay,
                                editable: true,
                                draggable: true,
                                rrule: {
                                    freq: rrule["FREQ"].toLowerCase(),
                                    interval: parseInt(rrule["INTERVAL"]),
                                    dtstart: data.start.toISOString(),
                                    until: until
                                },
                                backgroundColor: allEvents.data.message[i].info.color
                            }
                            // console.log(eventObject.title, eventObject.rrule)
                            finalEvents.push(eventObject)

                        }
                        else {
                            var eventObject = {
                                id: data.uid,
                                title: data.summary,
                                start: data.start,
                                end: data.end,
                                allDay: allDay,
                                editable: true,
                                draggable: true,
                                backgroundColor: allEvents.data.message[i].info.color,
                            }
                            finalEvents.push(eventObject)

                        }


                        /*
                        if (varNotEmpty(rrule["FREQ"]) && rrule["FREQ"] != "") {
                            var step = 86400 * 1000
                            if (rrule["FREQ"] == "WEEKLY") {
                                step = step * 7
                            }
                          
                            if (rrule["FREQ"] == "MONTHLY") {
                                step = step * 30
                            }
                            if (rrule["FREQ"] == "YEARLY") {
                                step = step * 365
                            }
                           
                            if (varNotEmpty(rrule["INTERVAL"]) && rrule["INTERVAL"] != "") {
                                step = step * rrule["INTERVAL"]
                            }

                            var maxTime = Date.now() + 1000 * 86400 * 180

                            if (varNotEmpty(rrule["UNTIL"]) && rrule["UNTIL"] != "") {
                                maxTime = moment(rrule["UNTIL"]).unix() * 1000
                            }

                            var newStart = moment(data.start).unix() * 1000 + step
                            var newEnd = moment(data.end).unix() * 1000 + step
                            var newMap = this.state.recurMap
                            
                                while (newStart < maxTime) {
                                    var recurId = getRandomString(10)
                                    newMap[recurId] = data.uid
                                    this.setState({recurMap:newMap})
 
                                    eventObject = {
                                        id: recurId,
                                        title: data.summary,
                                        start: new Date(newStart),
                                        end: new Date(newEnd),
                                        allDay: allDay,
                                        editable: true,
                                        draggable: true,
                                        backgroundColor: allEvents.data.message[i].info.color
                                    }
                                    finalEvents.push(eventObject)
                                    newStart += step
                                    newEnd += step
                                }
                            
                            

                        }
                        
                    } 
                    */
                        //this.state.allEvents[data.uid] = { data: data, event: allEvents.data.message[i].events[j] }

                    }
                    else if (event.type == "VTODO" && this.state.showTasksChecked==true) {
                        var data = returnGetParsedVTODO(allEvents.data.message[i].events[j].data)
                        if (varNotEmpty(data) == false) {
                            continue
                        }

                        var eventObject=null
                        if (majorTaskFilter(data)) {
                            var title = "[" + this.i18next.t("TASK") + "] " + data.summary

                            var rrule = rruleToObject(data.rrule)

                            //Check if the event has a recurrence rule.
                            if (varNotEmpty(data.rrule) && data.rrule != '' && varNotEmpty(rrule["FREQ"]) && rrule["FREQ"] != "") {

                                var recurrenceObj = new RecurrenceHelper(data)
                                var dueDate = moment(recurrenceObj.getNextDueDate()).toISOString()
                                var startDate = moment.unix(moment(dueDate).unix() - (60*60)).toISOString()
                               //console.log("REPEATING", startDate, title, dueDate)

                                var eventObject = {
                                    id: data.uid,
                                    title: title,
                                    allDay: false,
                                    end: dueDate,
                                    displayEventEnd: false,
                                    editable: false,
                                    draggable: true,
                                    backgroundColor: allEvents.data.message[i].info.color,
                                    rrule: {
                                        freq: rrule["FREQ"].toLowerCase(),
                                        interval: parseInt(rrule["INTERVAL"]),
                                        dtstart: data.start.toISOString(),
                                        until: rrule["UNTIL"]
                                    },
                                }

                            } else {
                                if (varNotEmpty(data.due) && data.due != "") {

                                    var dueDate = moment(data.due).toISOString()
                                    var startDate = moment.unix(moment(data.due).unix() - (10*60)).toISOString()
                                    //console.log(startDate, title, dueDate)

                                    var eventObject = {
                                        id: data.uid,
                                        title: title,
                                        allDay: false,
                                        start: startDate,
                                        end: dueDate,
                                        editable: false,
                                        draggable: true,
                                        displayEventStart: false,
                                        backgroundColor: allEvents.data.message[i].info.color
                                    }
                                }


                            }
                            if (varNotEmpty(eventObject) && this.eventinArray(finalEvents, eventObject)==false) {
                                finalEvents.push(eventObject)

                            }

                        }

                    }
                }
            }

        }

        this.setState({ events: finalEvents })

    }
    async getAllEventsfromServer() {
        var allEvents = await getAllEvents()
        this.setState({allEventsFromServer: allEvents})

        this.addEventsToCalendar(allEvents)
    }

     showTasksChanged(e)
    {
        this.setState(({ showTasksChecked }) => (
            {
                showTasksChecked: !showTasksChecked
            }
          ), function () {
            if(this.state.allEventsFromServer!=null)
            {
                this.addEventsToCalendar(this.state.allEventsFromServer)
            }else{
                 this.getAllEventsfromServer()
            }
        });
    

    }

    userPreferencesChanged(){
        if(this.state.allEventsFromServer!=null)
            {
                this.addEventsToCalendar(this.state.allEventsFromServer)
            }else{
                 this.getAllEventsfromServer()
        }
    }
    render() {

        const eventDataDashBoard = this.state.eventDataDashBoard
        var eventEditor = this.state.showEventEditor ? (<EventEditor key={this.state.selectedID} onDismiss={this.eventEditorDismissed} eventData={eventDataDashBoard} />
        ) : (null)

        var options = []
        for (const i in FULLCALENDAR_VIEWLIST)
        {
            options.push( <option key={FULLCALENDAR_VIEWLIST[i].name} value={FULLCALENDAR_VIEWLIST[i].name}>{this.i18next.t(FULLCALENDAR_VIEWLIST[i].saneName)}</option>)
        }

        var calendarsSelect= null
        if(varNotEmpty(this.state.caldav_accounts) && Array.isArray(this.state.caldav_accounts) && this.state.caldav_accounts.length>0)
        {
            calendarsSelect = <ListGroupCalDAVAccounts onChange={this.userPreferencesChanged} caldav_accounts={this.state.caldav_accounts} />
        }
        return (<>

            <Row  style={{  padding: 20, flex:1 , justifyContent:"center", alignItems:"center", }} >
                <Col >
                    <Form.Select value={this.state.viewValue} onChange={this.viewChanged}>
                        {options}
                    </Form.Select>
                </Col>
                <Col style={{}}>
                    
                    <Form.Check 
                        type="switch"
                        id="show_tasks_switch"
                        checked={this.state.showTasksChecked}
                        onClick={this.showTasksChanged}
                        label={this.i18next.t("SHOW_TASKS")}
                    />

                </Col>
                <Col  style={{textAlign:"center",}}>
                    {calendarsSelect}
                </Col>
            </Row>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, bootstrap5Plugin, interactionPlugin, rrulePlugin, listPlugin]}
                ref={this.calendarRef}
                initialView={this.state.initialViewCalendar}
                themeSystem="standard"
                events={this.state.events}
                editable={true}
                aspectRatio={this.state.calendarAR}
                eventClick={this.eventClick}
                dateClick={this.handleDateClick}
                onClick={this.onClick}
                selectable={true}
                nowIndicator={true}
                rerenderEvents={this.rerenderEvents}
                eventDrop={this.eventDrop}
                eventResize={this.eventResize}
            />
            <br />
            <br />
            <Offcanvas placement='start' show={this.state.showEventEditor} onHide={this.eventEditorClosed}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{this.i18next.t("EDIT_EVENT")}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {eventEditor}
                </Offcanvas.Body>
            </Offcanvas>

        </>)
    }
}

export default withRouter(DashboardView)