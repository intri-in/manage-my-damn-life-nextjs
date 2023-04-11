import React, { Component } from "react";
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { getAllEvents, getParsedTodoList, returnGetParsedVTODO } from "@/helpers/frontend/calendar";
import { isValidResultArray } from "@/helpers/general";
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import Form from 'react-bootstrap/Form';
import { Row, Col } from "react-bootstrap";
import { getParsedEvent } from "@/helpers/frontend/events";
import bootstrap from "@fullcalendar/bootstrap";
import interactionPlugin from '@fullcalendar/interaction'
import Offcanvas from 'react-bootstrap/Offcanvas';

export default class DashboardView extends Component{
    calendarRef = React.createRef()
    constructor(props)
    {
        
        super(props)
        this.state= {showEventEditor: false, viewValue:1,  events: null, eventEdited: false, }
        this.viewChanged = this.viewChanged.bind(this)
        this.eventClick = this.eventClick.bind(this)
        this.handleDateClick = this.handleDateClick.bind(this)
        this.eventEditorClosed = this.eventEditorClosed.bind(this)
    }

    
    componentDidMount()
    {
         this.getAllEventsfromServer()
         //dayGridMonth
         let calendarApi = this.calendarRef.current.getApi()
         calendarApi.eventDragStart=this.eventDrag
 
 
    }
    viewChanged(e)
    {

        var calendarView="timeGridDay"
        if(e.target.value=='1')
        {
            calendarView="timeGridDay"
        }
        if(e.target.value=='2')
        {
            calendarView='timeGridWeek'
        }
        if(e.target.value=='3')
        {
            calendarView='dayGridMonth'
        }

        let calendarApi = this.calendarRef.current.getApi()
        calendarApi.changeView(calendarView)
        
          //calendarApi.addEventSource({events})
        this.setState({viewValue: e.target.value, })
    }
    eventClick(e)
    {
        console.log(e)
    }
    handleDateClick(e)
    {
        console.log(e)
        this.setState({showEventEditor: true})
    }
    eventEditorClosed()
    {
        this.setState({showEventEditor: false})

    }
    eventDrop(e)
    {
        console.log(e)
    }
    async getAllEventsfromServer()
    {
        var allEvents= await getAllEvents()
        var finalEvents=[]
        if(isValidResultArray(allEvents.data.message))
        {

            for(let i=0; i<allEvents.data.message.length; i++)
            {
                for(const j in allEvents.data.message[i].events)
                {
                    var event= allEvents.data.message[i].events[j]

                    if(event.type!="VTODO"&&event.type!="VTIMEZONE")
                    {    
                        var data= getParsedEvent(allEvents.data.message[i].events[j].data)
                        var eventObject={
                            id: data.uid,
                            title:data.summary,
                            start: data.start,
                            end: data.end,
                            editable: true,
                            draggable: true,
                            backgroundColor: allEvents.data.message[i].info.color
                        }
                        finalEvents.push(eventObject)
                    }
                    else if(event.type=="VTODO")
                    {
                        var data= returnGetParsedVTODO(allEvents.data.message[i].events[j].data)
                        var eventObject={
                            id: data.uid,
                            title:data.summary,
                            allDay:true,

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

        this.setState({events: finalEvents})
      
    }

    render(){
        return(<>
            <Row>
                <Col>
                </Col>
                <Col>
                <Form.Select  value={this.state.viewValue} onChange={this.viewChanged}>
                    <option value="0">Select View</option>
                    <option value="1">View: Day</option>
                    <option value="2">View: Week</option>
                    <option value="3">View: Month</option>
                </Form.Select>
                </Col>
                <Col>
                </Col>
            </Row>
            <FullCalendar
            plugins={[ dayGridPlugin , timeGridPlugin, bootstrap5Plugin,  interactionPlugin]}
            ref={this.calendarRef}
            initialView='timeGridDay'
            themeSystem= 'standard'
            events={this.state.events}
            editable={true}
            eventClick={this.eventClick}
            dateClick={this.handleDateClick}
            onClick={this.onClick}
            selectable= {true}
            nowIndicator={true}
            businessHours= {{
                daysOfWeek: [ 1, 2, 3, 4,5,6,7 ], // Monday - Thursday
                startTime: '7:00', // a start time (10am in this example)
                endTime: '23:00', // an end time (6pm in this example)
            }}
            eventDrop={this.eventDrop}
          />
            <Offcanvas placement='start' show={this.state.showEventEditor} onHide={this.eventEditorClosed}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Edit Event</Offcanvas.Title>
                </Offcanvas.Header>
                    <Offcanvas.Body>
                    </Offcanvas.Body>
            </Offcanvas>

        </>)
    }
}