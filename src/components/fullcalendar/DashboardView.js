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
import { BiTask } from "react-icons/bi";
import { ISODatetoHuman, ISODatetoHumanISO, getI18nObject } from "@/helpers/frontend/general";
import EventEditor from "../events/EventEditor";
import moment from "moment";
import { getRandomString } from "@/helpers/crypto";
import { getObjectForAPICall, makeGenerateICSRequest } from "@/helpers/frontend/ics";
import { toast } from "react-toastify";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { FULLCALENDAR_BUSINESS_HOURS } from "@/config/constants";
import { withRouter } from "next/router";
class DashboardView extends Component {
    calendarRef = React.createRef()
    constructor(props) {

        super(props)
        this.i18next = getI18nObject()
        this.state = { showEventEditor: false, viewValue: 0, events: null, eventEdited: false, eventDataDashBoard: {}, allEvents: {}, recurMap: {}, selectedID: "", calendarAR:props.calendarAR }
        this.viewChanged = this.viewChanged.bind(this)
        this.eventClick = this.eventClick.bind(this)
        this.handleDateClick = this.handleDateClick.bind(this)
        this.eventEditorClosed = this.eventEditorClosed.bind(this)
        this.eventEditorDismissed = this.eventEditorDismissed.bind(this)
        this.eventDrop = this.eventDrop.bind(this)
        this.eventResize = this.eventResize.bind(this)
        this.scheduleEvent = this.scheduleEvent.bind(this)
    }


    componentDidMount() {

        this.getCaldavAccountsfromDB()
        this.getAllEventsfromServer()
    
        //dayGridMonth
        let calendarApi = this.calendarRef.current.getApi()
        calendarApi.eventDragStart = this.eventDrag


    }

    async getCaldavAccountsfromDB()
    {
        var caldav_accounts= await getCaldavAccountsfromServer()
        if(caldav_accounts!=null && caldav_accounts.success==true)
        {
            if(caldav_accounts.data.message.length>0)
            {

            }else{
                this.props.router.push("/accounts/caldav?message=ADD_A_CALDAV_ACCOUNT")
            }
           
        }


    }
    componentDidUpdate(prevProps, prevState)
    {
        if(this.props.scheduleItem!=prevProps.scheduleItem)
        {
            console.log('here')
            if(varNotEmpty(this.props.scheduleItem))
            {
                this.scheduleEvent(this.props.scheduleItem)
            }
        }

        if(this.props.calendarAR!= prevProps.calendarAR)
        {
            this.setState({calendarAR: this.props.calendarAR})
        }
    }

    scheduleEvent(data)
    {
        var eventData = getEmptyEventDataObject()
        var end = Date.now()+60*1000*60

        eventData.data["start"] = new Date(Date.now())
        eventData.data["end"] = new Date(end)
        eventData.data["summary"] = data.summary

        eventData.event["calendar_id"]=data.calendar_id

        this.setState({ showEventEditor: true, eventDataDashBoard: eventData })


    }
    viewChanged(e) {

        var calendarView = "timeGridDay"
        if (e.target.value == '1') {
            calendarView = "timeGridDay"
        }
        if (e.target.value == '2') {
            calendarView = 'timeGridWeek'
        }
        if (e.target.value == '3') {
            calendarView = 'dayGridMonth'
        }

        let calendarApi = this.calendarRef.current.getApi()
        calendarApi.changeView(calendarView)

        //calendarApi.addEventSource({events})
        this.setState({ viewValue: e.target.value, })
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

                if (varNotEmpty(response) && varNotEmpty(response.success) && response.success == true) {
                    toast.success(this.i18next.t("UPDATE_OK"))
                    this.getAllEventsfromServer()

                } else {
                    var message = getMessageFromAPIResponse(response)
                    if (message != "" && varNotEmpty(message)) {
                        toast.error(this.i18next.t(message.toString()))

                    }else{
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
        console.log("eventResize", e)
        var newID = e.event.id
        if (varNotEmpty(this.state.allEvents[e.event.id]) == false) {
            //Probably a recurring event. Get ID from map.
            newID = this.state.recurMap[e.event.id]

        }
        //Calculate delta in ms
        var eventData = this.state.allEvents[newID]
        if (this.state.allEvents[newID].type != "VTODO" && this.state.allEvents[newID].type != "VTIMEZONE" && varNotEmpty(this.state.allEvents[newID])) {
            var delta = e.endDelta.milliseconds + (e.endDelta.days * 86400 * 1000) + (e.endDelta.months * 30 * 86400 * 1000) + (e.endDelta.years * 365 * 86400 * 1000)

            console.log("delta", delta)

            var newEnd = new Date((moment(eventData.data.end).unix() * 1000) + delta)
            //console.log(newStart, newEnd)

            eventData.data.end = newEnd

            var obj = getObjectForAPICall(eventData.data)
            var ics = await makeGenerateICSRequest({ obj })
            console.log(ics)
            if (varNotEmpty(ics) ) {
                const response = await updateEvent(eventData.event.calendar_id, eventData.event.url, eventData.event.etag, ics )

                if (varNotEmpty(response) && varNotEmpty(response.success) && response.success == true) {
                    toast.success(this.i18next.t("UPDATE_OK"))

                } else {
                    var message = getMessageFromAPIResponse(body)
                    if (message != "" && varNotEmpty(message)) {
                        toast.error(this.i18next.t(message.toString()))


                    }
                    else{
                        toast.error((this.i18next.t("ERROR_GENERIC")))

                    }
                }
                this.getAllEventsfromServer()

            } else {
                toast.error((this.i18next.t("ERROR_GENERIC")))

            }
        }


    }

    async getAllEventsfromServer() {
        var allEvents = await getAllEvents()
        var finalEvents = []
        if (isValidResultArray(allEvents.data.message)) {

            for (let i = 0; i < allEvents.data.message.length; i++) {
                for (const j in allEvents.data.message[i].events) {
                    var event = allEvents.data.message[i].events[j]
                    if (event.deleted == "1" || event.deleted == "TRUE") {
                        continue
                    }
                    if (event.type != "VTODO" && event.type != "VTIMEZONE") {
                        var data = getParsedEvent(allEvents.data.message[i].events[j].data)
                        if (varNotEmpty(data.summary) == false || varNotEmpty(data.summary) && data.summary == "") {
                            continue
                        }
                        var allDay = isAllDayEvent(data.start, data.end)
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
                        finalEvents.push(eventObject)


                        //Check if the event has a recurrence rule.
                        if (varNotEmpty(data.rrule) && data.rrule != '') {
                            /** Depends on rrule, doesn't work for now. 

                            var dtstart = new Date(moment(data.start).unix()*1000+86400*1000)
                            var until =new Date(moment(ISODatetoHumanISO(rrule["UNTIL"])).unix()*1000+86400*1000)

                            var  eventObject = {
                                id: data.uid,
                                title: data.summary,
                                start: data.start,
                                end: data.end,
                                allDay: allDay,
                                editable: true,
                                draggable: true,
                                rrule: {
                                    freq: rrule["FREQ"].toLowerCase(),
                                    interval: rrule["INTERVAL"],
                                    dtstart:dtstart,
                                    until: until
                                },
                                backgroundColor: allEvents.data.message[i].info.color
                                }
                                console.log(eventObject.title, eventObject.rrule)
                                finalEvents.push(eventObject)

                            }
                            else{
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
                                finalEvents.push(eventObject)
        
                            } */


                            var rrule = rruleToObject(data.rrule)

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
                                    this.state.recurMap = newMap

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
                        } else {

                        }

                        this.state.allEvents[data.uid] = { data: data, event: allEvents.data.message[i].events[j] }

                    }
                    else if (event.type == "VTODO") {
                        var data = returnGetParsedVTODO(allEvents.data.message[i].events[j].data)

                        if(majorTaskFilter(data))
                        {
                            var title = "[" + this.i18next.t("TASK") + "] " + data.summary
                            var eventObject = {
                                id: data.uid,
                                title: title,
                                allDay: false,
                                start: data.due,
                                end: data.due,
                                editable: false,
                                draggable: true,
                                backgroundColor: allEvents.data.message[i].info.color
                            }
                            finalEvents.push(eventObject)
    
                        }

                    }
                }
            }

        }

        this.setState({ events: finalEvents })
    }

    render() {

        const eventDataDashBoard = this.state.eventDataDashBoard
        var eventEditor = this.state.showEventEditor ? (<EventEditor key={this.state.selectedID} onDismiss={this.eventEditorDismissed} eventData={eventDataDashBoard} />
        ) : (null)
        return  (<>
            <Row style={{padding: 20}} >
                <Col>
                    <Form.Select  value={this.state.viewValue} onChange={this.viewChanged}>
                        <option value="1">View: Day</option>
                        <option value="2">View: Week</option>
                        <option value="3">View: Month</option>
                    </Form.Select>
                </Col>
            </Row>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, bootstrap5Plugin, interactionPlugin]}
                ref={this.calendarRef}
                initialView='timeGridDay'
                themeSystem='standard'
                events={this.state.events}
                editable={true}
                aspectRatio={this.state.calendarAR}
                eventClick={this.eventClick}
                dateClick={this.handleDateClick}
                onClick={this.onClick}
                selectable={true}
                nowIndicator={true}
                rerenderEvents={this.rerenderEvents}
                businessHours={FULLCALENDAR_BUSINESS_HOURS}
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