import React, { Component, LegacyRef, createRef, useEffect, useRef } from "react";
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import allLocales from '@fullcalendar/core/locales-all'
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
import EventEditor from "../events/EventEditor";
import moment from "moment";
import { getRandomString } from "@/helpers/crypto";
import { getObjectForAPICall, getObjectForAPICallV2, makeGenerateICSRequest } from "@/helpers/frontend/ics";
import { toast } from "react-toastify";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { withRouter } from "next/router";
import { RecurrenceHelper } from "@/helpers/frontend/classes/RecurrenceHelper";
import { FULLCALENDAR_VIEWLIST } from "./FullCalendarHelper";
import { getCalendarStartDay, getDefaultViewForCalendar } from "@/helpers/frontend/settings";
import { ListGroupCalDAVAccounts } from "./ListGroupCalDAVAccounts";
import { Preference_CalendarsToShow } from "@/helpers/frontend/classes/UserPreferences/Preference_CalendarsToShow";
import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie";
import { fetchAllEventsFromDexie, getEventFromDexieByID } from "@/helpers/frontend/dexie/events_dexie";
import { EventsLikeAPIType, getEventsFromDexie_LikeAPI } from "@/helpers/frontend/dexie/dexie_helper";
import { useState } from "react"
import { useAtomValue, useSetAtom } from "jotai";
import { eventEditorInputAtom, showEventEditorAtom } from "stateStore/EventEditorStore";
import { updateCalendarViewAtom, updateViewAtom } from "stateStore/ViewStore";
import { getCalDAVAccountIDFromCalendarID_Dexie } from "@/helpers/frontend/dexie/calendars_dexie";
import { showTaskEditorAtom, taskEditorInputAtom } from "stateStore/TaskEditorStore";
import { AddFromTemplateModal } from "../common/AddTask/AddFromTemplateModal";
import { useTranslation } from "next-i18next";
import { getAllEventsFromWebcalForRender } from "@/helpers/frontend/webcals";
import { WebCalEvents } from "@/helpers/frontend/dexie/dexieDB";
import { checkIfUserWanttoSeeWebCalIDFromPreferenceObject } from "@/helpers/frontend/classes/UserPreferences/Preference_WebCalsToShow";
import { currentSimpleDateFormatAtom, currentSimpleTimeFormatAtom } from "stateStore/SettingsStore";
import momentPlugin from '@fullcalendar/moment';
interface EventObject {
    id: string,
    title: string,
    start?: string,
    startTime?:string,
    end: string,
    endTime?:string,
    allDay: boolean,
    editable: boolean,
    draggable: boolean,
    displayEventEnd?: boolean,
    displayEventStart?: boolean,
    duration?: {seconds?: number}
    rrule?: { freq: string, interval: number, dtstart: string, until: string },
    backgroundColor: string,
    extendedProps?: ExtendedProps     

}
interface ExtendedProps{
    isWebCalEvent?: boolean
}
export const CalendarViewWithStateManagement = ({ calendarAR }: { calendarAR: number }) => {
    /**
     * Jotai
     */

    const setShow = useSetAtom(showEventEditorAtom)
    const setEditorInput = useSetAtom(eventEditorInputAtom)
    const setTaskEditorInput = useSetAtom(taskEditorInputAtom)
    const setShowTaskEditor = useSetAtom(showTaskEditorAtom)
    const updated = useAtomValue(updateCalendarViewAtom)
    const setUpdatedCalendarView = useSetAtom(updateCalendarViewAtom)
    const allUpdated = useAtomValue(updateViewAtom)
    const timeFormat = useAtomValue(currentSimpleTimeFormatAtom)
    const dateFormat = useAtomValue(currentSimpleDateFormatAtom)
    
    /**
     * Local State
     */
    const [viewValue, setViewValue] = useState("timeGridDay")
    const [showTasksChecked, setShowTasksChecked] = useState(true)
    const [allEvents, setEventsArray] = useState<EventsLikeAPIType[]>([])
    const [events, setEvents] = useState<EventObject[]>([])
    const [webCalEvents, setWebCalEvents] = useState<WebCalEvents[]>([])
    const [firstDay, setFirstDay] = useState(0)
    const calendarRef = createRef<FullCalendar>();
    const [caldav_accounts, setCaldavAccounts] = useState([])
    const [updateLocal, setUpdateLocal] = useState(Date.now())
    const {t, i18n} = useTranslation("common")
    useEffect(() =>{

        if (calendarRef && calendarRef.current) {

            const calendarApi = calendarRef.current.getApi()
            // calendarApi.eventDragStart = this.eventDrag
            const view = getDefaultViewForCalendar()
            if (view) {
                calendarApi.changeView(view)
                setViewValue(view)

            }
        }


    },[])

    useEffect(() => {
        let isMounted = true
        if (isMounted) {

            const firstDay = getCalendarStartDay()
            if (firstDay) {
                setFirstDay(parseInt(firstDay.toString()))
            }

            getCalDAVSummaryFromDexie().then(caldav_accounts => {

                if (isValidResultArray(caldav_accounts)) {
                    setCaldavAccounts(caldav_accounts)
                }
            })
            getEventsFromDexie_LikeAPI().then(allEventsFromDexie => {
                setEventsArray(allEventsFromDexie)
            })

            getAllEventsFromWebcalForRender().then(webcal_events =>{
                setWebCalEvents(webcal_events)

            })
        }
        return () => {
            isMounted = false
        }
    }, [updated, allUpdated])

    useEffect(() => {
        let isMounted = true
        if (isMounted) {
            addEventsToCalendar()
        }
        return () => {
            isMounted = false
        }
    }, [allEvents, showTasksChecked, updateLocal])
    const viewChanged = (e) => {
        if (calendarRef && calendarRef.current) {

            let calendarApi = calendarRef.current.getApi()
            calendarApi.changeView(e.target.value)
        }

        //calendarApi.addEventSource({events})
        setViewValue(e.target.value)

    }

    const eventinArray = (eventObject, newEntry) => {
        if (varNotEmpty(eventObject) && varNotEmpty(newEntry) && varNotEmpty(newEntry.id)) {
            let found = false
            for (const i in eventObject) {

                if (varNotEmpty(eventObject[i].id)) {
                    if (eventObject[i].id == newEntry.id) {
                        return true
                    }
                }
            }

            return found

        }

        return false

    }

    const addEventsToCalendar = async () => {
        setEvents([])
        let finalEvents: EventObject[] = []
        // console.log("allEvents", allEvents)
        if (isValidResultArray(allEvents) && allEvents && Array.isArray(allEvents)) {

            for (let i = 0; i < allEvents.length; i++) {
                for (const j in allEvents[i].events) {

                    let userWantsToSee = false
                    if (typeof (allEvents[i].events[j].calendar_id) !== "undefined") {

                        userWantsToSee = Preference_CalendarsToShow.getShowValueForCalendar(allEvents[i].info.caldav_accounts_id, allEvents[i].events[j].calendar_id!)
                    }
                    // console.log("userWantsToSee", allEvents[i].info.caldav_accounts_id, allEvents[i].events[j].calendar_id, userWantsToSee )
                    if (userWantsToSee == false) {
                        continue
                    }
                    const event = allEvents[i].events[j]
                    if (event.deleted == "1" || event.deleted == "TRUE") {
                        continue
                    }
                    // console.log(event.type, event.calendar_events_id)
                    if (event.type != "VTODO" && event.type != "VTIMEZONE") {
                        const data = getParsedEvent(allEvents[i].events[j].data)
                        // console.log("Parsed Event", data.summary,  event.calendar_id, data)
                        if (varNotEmpty(data) == false) {
                            continue
                        }
                        if (varNotEmpty(data.summary) == false || (varNotEmpty(data.summary) && data.summary.toString().trim() == "")) {
                            continue
                        }



                        let allDay = isAllDayEvent(data.start, data.end)

                        //console.log(data.end, data.summary )
                        let eventObject: EventObject = {
                            id: event.calendar_events_id!.toString(),
                            title: data.summary,
                            start: moment(data.start).toISOString(),
                            end: moment(data.end).toISOString(),
                            allDay: allDay,
                            editable: true,
                            draggable: true,
                            backgroundColor: allEvents[i].info.color
                        }
                        //finalEvents.push(eventObject)

                        let rrule = rruleToObject(data.rrule)
                        //Check if the event has a recurrence rule.
                        if (varNotEmpty(data.rrule) && data.rrule != '' && varNotEmpty(rrule["FREQ"]) && rrule["FREQ"] != "") {

                            //let dtstart = new Date(moment(data.start).unix()*1000+86400*1000)
                            let eventDuration = {seconds: 3600}
                            if(data.end && data.start){
                                const eventDurationValue = moment(data.end).unix() - moment(data.start).unix()
                                eventDuration = {seconds: eventDurationValue }

                            }

                            let until = rrule["UNTIL"]
                            eventObject.rrule = {
                                freq: rrule["FREQ"].toLowerCase(),
                                interval: parseInt(rrule["INTERVAL"]),
                                dtstart: data.start? data.start.toISOString(): "",
                                until: until,
                            }
                            eventObject.editable=false
                            eventObject.draggable=false
                            eventObject.duration=eventDuration

                            // console.log("eventObject", eventObject.title, eventObject)
                            finalEvents.push(eventObject)

                        }
                        else {
                            let eventObject: EventObject = {
                                id: event.calendar_events_id!.toString(),
                                title: data.summary,
                                start: data.start,
                                end: data.end,
                                allDay: allDay,
                                editable: true,
                                draggable: true,
                                backgroundColor: allEvents[i].info.color,
                            }
                            finalEvents.push(eventObject)

                        }

                        let eventToPush = {}

                        eventToPush[data.uid] = { data: data, event: allEvents[i].events[j] }
                        // this.allEvents[data.uid] = { data: data, event: allEvents[i].events[j] }

                    }
                    else if (event.type == "VTODO" && showTasksChecked == true) {
                        const data = returnGetParsedVTODO(allEvents[i].events[j].data)
                        if (varNotEmpty(data) == false) {
                            continue
                        }

                        let eventObject: {} | EventObject = {}
                        if (majorTaskFilter(data) && data) {
                            const title = "[" + t("TASK") + "] " + data.summary
                            // console.log("data", data)
                            if (data.due || data.start) {

                                
                                let dueDate = data.due ? moment(data.due).toISOString() : moment.unix(moment(data.start).unix() - (60 * 60)).toISOString()
                                let startDate = data.start? moment(data.start).toISOString(): moment.unix(moment(data.due).unix() - (60 * 60)).toISOString()
                                // console.log(startDate, title, dueDate, data.rrule)
                                const difference = moment(dueDate).unix()-moment(startDate).unix()
                                const allDay =  difference > 86400 ? true: false
                                eventObject = {
                                    id: event.calendar_events_id!.toString(),
                                    title: title,
                                    allDay: allDay,
                                    start: startDate,
                                    end: dueDate,
                                    editable: false,
                                    draggable: false,
                                    backgroundColor: allEvents[i].info.color,
                                    
                                }

                                let rrule = rruleToObject(data.rrule)

                                //Check if the event has a recurrence rule.
                                if (varNotEmpty(data.rrule) && data.rrule != '' && varNotEmpty(rrule["FREQ"]) && rrule["FREQ"] != "") {
    
                                    // let recurrenceObj = new RecurrenceHelper(data)
                                    // let dueDate = moment(recurrenceObj.getNextDueDate()).toISOString()
                                    // let startDate = moment.unix(moment(dueDate).unix() - (60 * 60)).toISOString()
                                    // console.log("REPEATING", startDate, title, dueDate)
    
                                    eventObject["rrule"] = {
                                            freq: rrule["FREQ"].toLowerCase(),
                                            interval: parseInt(rrule["INTERVAL"]),
                                            dtstart: startDate,
                                            until: rrule["UNTIL"]
                                        }
                                    // 
                                //    console.log("eventObject", data.summary, eventObject)
    
                                } 
                                   
    
                                
    
                                if (eventObject && ("id" in eventObject) && eventObject.id && eventinArray(finalEvents, eventObject) == false) {
                                    finalEvents.push(eventObject)
                                }
                            }

                           

                        }
                        // this.setState((prevState, props) => {
                        //     let newAllEvents = _.cloneDeep(prevState.allEvents)
                        //     newAllEvents[data.uid] = { data: data, event: allEvents.data.message[i].events[j] }
                        //     return({allEvents: newAllEvents})

                        // })

                    }
                }
            }

        }

        //Now we add webcal events.
        if(webCalEvents && Array.isArray(webCalEvents) && webCalEvents.length>0){
            // console.log("webcal", webCalEvents)
            for (const k in webCalEvents){
                const userWantsToSee = await checkIfUserWanttoSeeWebCalIDFromPreferenceObject(webCalEvents[k].webcals_id)
                // console.log("userWantsToSee", userWantsToSee, webCalEvents[k].data)
                if(!userWantsToSee){
                    continue
                }
                try{

                    let data = JSON.parse(webCalEvents[k].data)
                    // console.log("data", data)
                    if (!data) {
                        continue
                    }
                    if(!("description" in data)){
                        continue
                    }
                    if (varNotEmpty(data.description) == false || (varNotEmpty(data.description) && data.description.toString().trim() == "")) {
                        continue
                    }
        
        
        
                    let allDay = true
        
                    //console.log(data.end, data.description )
                    let eventObject: EventObject = {
                        id: data.uid,
                        title: data.description,
                        start: moment(data.start).toISOString(),
                        end: moment(data.end).toISOString(),
                        allDay: allDay,
                        editable: false,
                        draggable: false,
                        extendedProps:{
                            isWebCalEvent:true
                        },
                        backgroundColor: data.color,
                        
                    }
                    finalEvents.push(eventObject)
        
                   
        
                    let eventToPush = {}
        
                    eventToPush[data.uid] = { data: data, event: null }
    
                }catch(e){
                    console.warn("Cannot parse event data for webcal:", webCalEvents[k])
                }
            }

        }
        setEvents(finalEvents)

    }
    const showTasksChanged = (e) => {
        setShowTasksChecked(e.target.checked)
    }
    const eventClick = async (e) => {
        let isWebCalEvent =  false
        
        isWebCalEvent = ("extendedProps" in e.event && e.event.extendedProps.isWebCalEvent)
        if(isWebCalEvent) console.log("This is a webcal event. No edit dialog will be opened.")
        if(!isWebCalEvent){
            const eventInfoFromDexie = await getEventFromDexieByID(parseInt(e.event.id.toString()))
            if(eventInfoFromDexie && eventInfoFromDexie.length>0){
                if(eventInfoFromDexie[0].type==="VTODO"){
                    setTaskEditorInput({
                        id: parseInt(e.event.id.toString())
                    })
                    setShowTaskEditor(true)
    
                }else{
                    
                    setEditorInput({
                        id: parseInt(e.event.id)
                    })
                    setShow(true)
                }
            }
        }
        

    }
    const handleDateClick = (e) => {
        const end = moment(e.date).unix() * 1000 + 3600 * 1000
        setEditorInput({
            id: null,
            start: moment(e.date).toISOString(),
            end: moment(end).toISOString()
        })
        // console.log(moment(e.date).toISOString(),moment(end).toISOString())
        setShow(true)
    }
    const makeQuickRequesttoCaldav = async (eventData, eventInfoFromDexie, summary) => {
        const obj = getObjectForAPICallV2(eventData)
        let ics = await makeGenerateICSRequest({ obj })
        const caldav_accounts_id = await getCalDAVAccountIDFromCalendarID_Dexie(eventInfoFromDexie[0].calendar_id)
        const messageHeader = summary ? summary + ": " : ""
        // console.log("messageHeader", messageHeader)
        console.log(ics)
        if (varNotEmpty(ics)) {
            const response = await updateEvent(eventInfoFromDexie[0].calendar_id, eventInfoFromDexie[0].url, eventInfoFromDexie[0].etag, ics, caldav_accounts_id)
            if (varNotEmpty(response) && varNotEmpty(response.success) && response.success == true) {
                toast.success(messageHeader + t("UPDATE_OK"))


            } else {
                let message = getMessageFromAPIResponse(response)
                if (message != "" && varNotEmpty(message)) {
                    toast.error(messageHeader + t(message.toString()))
                    console.log(response)
                } else {
                    toast.error(messageHeader + (t("ERROR_GENERIC")))

                }
            }

        } else {
            toast.error(messageHeader + t("ERROR_GENERIC"))
            console.log("makeQuickRequesttoCaldav: ics is null")
        }
        setUpdatedCalendarView(Date.now())
    }
    const eventDrop = async (e) => {
        toast.info(t("ACTION_SENT_TO_CALDAV"))
        // console.log("eventDrop", e)
        const newID = e.event.id
        const eventInfoFromDexie = await getEventFromDexieByID(parseInt(newID.toString()))
        if (eventInfoFromDexie && Array.isArray(eventInfoFromDexie) && eventInfoFromDexie.length > 0) {
            const unParsedData = eventInfoFromDexie[0].data
            let eventData = getParsedEvent(unParsedData)

            const delta = e.delta.milliseconds + (e.delta.days * 86400 * 1000) + (e.delta.months * 30 * 86400 * 1000) + (e.delta.years * 365 * 86400 * 1000)

            //console.log("delta", delta)

            const newStart = new Date((moment(eventData.start).unix() * 1000) + delta)
            const newEnd = new Date((moment(eventData.end).unix() * 1000) + delta)
            //console.log(newStart, newEnd)

            eventData.start = newStart
            eventData.end = newEnd
            makeQuickRequesttoCaldav(eventData, eventInfoFromDexie, eventData["summary"])
        } else {
            toast.error(t("ERROR_GENERIC"))
            console.error("eventDrop: eventInfoFromDexie is empty")
            setUpdatedCalendarView(Date.now())
        }


    }
    const eventResize = async (e) => {
        toast.info(t("ACTION_SENT_TO_CALDAV"))
        const newID = e.event.id
        const eventInfoFromDexie = await getEventFromDexieByID(parseInt(newID.toString()))
        if (eventInfoFromDexie && Array.isArray(eventInfoFromDexie) && eventInfoFromDexie.length > 0) {
            const unParsedData = eventInfoFromDexie[0].data
            let eventData = getParsedEvent(unParsedData)
            const delta = e.endDelta.milliseconds + (e.endDelta.days * 86400 * 1000) + (e.endDelta.months * 30 * 86400 * 1000) + (e.endDelta.years * 365 * 86400 * 1000)

            //console.log("delta", delta)

            const newEnd = new Date((moment(eventData.end).unix() * 1000) + delta)
            //console.log(newStart, newEnd)

            eventData.end = newEnd
            makeQuickRequesttoCaldav(eventData, eventInfoFromDexie, eventData["summary"])

        }

    }
    const userPreferencesChanged = () => {
        setUpdateLocal(Date.now())
    }

    let options: JSX.Element[] = []
    for (const i in FULLCALENDAR_VIEWLIST) {
        options.push(<option key={FULLCALENDAR_VIEWLIST[i].name} value={FULLCALENDAR_VIEWLIST[i].name}>{t(FULLCALENDAR_VIEWLIST[i].saneName)}</option>)
    }

    let calendarsSelect: JSX.Element | null = null
    if (varNotEmpty(caldav_accounts) && Array.isArray(caldav_accounts) && caldav_accounts.length > 0) {
        calendarsSelect = <ListGroupCalDAVAccounts onChange={userPreferencesChanged} caldav_accounts={caldav_accounts} />
    }
    return (

        <>
            <Row style={{ padding: 20, flex: 1, justifyContent: "center", alignItems: "center", textAlign:"center"}} >
                <Col md={8} >
                    <Form.Select value={viewValue} onChange={viewChanged}>
                        {options}
                    </Form.Select>
                </Col>
                <Col md={2} >

                    <Form.Check
                        type="switch"
                        inline
                        id="show_tasks_switch"
                        checked={showTasksChecked}
                        onChange={showTasksChanged}
                        label={t("SHOW_TASKS")}
                    />

                </Col>
                <Col md={2} >
                    {calendarsSelect}
                </Col>
            </Row>
            <div>
                <AddFromTemplateModal />

            </div>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, bootstrap5Plugin, interactionPlugin, rrulePlugin, listPlugin, momentPlugin]}
                ref={calendarRef}
                initialView={viewValue}
                themeSystem="standard"
                events={events}
                editable={true}
                aspectRatio={calendarAR}
                eventClick={eventClick}
                dateClick={handleDateClick}
                selectable={true}
                nowIndicator={true}
                eventDrop={eventDrop}
                eventResize={eventResize}
                firstDay={firstDay}
                locales={allLocales}
                locale={i18n.language}
                titleFormat={dateFormat} 
                eventTimeFormat={timeFormat ?? "HH:mm"}
                dayHeaderFormat={dateFormat?? "DD/MM/YYYY"}
                slotLabelFormat={timeFormat?? "HH:mm"}
            />
        </>
    )
}