import React, { Component, LegacyRef, createRef, useEffect, useRef } from "react";
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
import { getI18nObject } from "@/helpers/frontend/general";
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

const i18next = getI18nObject()
interface EventObject {
    id: string,
    title: string,
    start?: string,
    end: string,
    allDay: boolean,
    editable: boolean,
    draggable: boolean,
    displayEventEnd?: boolean,
    displayEventStart?: boolean,
    rrule?: { freq: string, interval: number, dtstart: string, until: string },
    backgroundColor: string
}

export const CalendarViewWithStateManagement = ({ calendarAR }: { calendarAR: number }) => {
    /**
     * Jotai
     */

    const setShow = useSetAtom(showEventEditorAtom)
    const setEditorInput = useSetAtom(eventEditorInputAtom)
    const updated = useAtomValue(updateCalendarViewAtom)
    const allUpdated = useAtomValue(updateViewAtom)
    /**
     * Local State
     */
    const [viewValue, setViewValue] = useState("timeGridDay")
    const [showTasksChecked, setShowTasksChecked] = useState(true)
    const [allEvents, setEventsArrayFromDexie] = useState<EventsLikeAPIType[]>([])
    const [events, setEvents] = useState<EventObject[]>([])
    const [firstDay, setFirstDay] = useState(0)
    const calendarRef = createRef<FullCalendar>();
    const [caldav_accounts, setCaldavAccounts] = useState([])
    const [updateLocal, setUpdateLocal] = useState(Date.now())

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
            if (calendarRef && calendarRef.current) {

                const calendarApi = calendarRef.current.getApi()
                // calendarApi.eventDragStart = this.eventDrag
                const view = getDefaultViewForCalendar()
                if (view) {
                    calendarApi.changeView(view)
                    setViewValue(view)

                }
            }

            getEventsFromDexie_LikeAPI().then(allEventsFromDexie => {
                setEventsArrayFromDexie(allEventsFromDexie)
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
            var found = false
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
                    if (event.type != "VTODO" && event.type != "VTIMEZONE") {
                        const data = getParsedEvent(allEvents[i].events[j].data)
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
                            start: data.start,
                            end: data.end,
                            allDay: allDay,
                            editable: true,
                            draggable: true,
                            backgroundColor: allEvents[i].info.color
                        }
                        //finalEvents.push(eventObject)

                        let rrule = rruleToObject(data.rrule)
                        //Check if the event has a recurrence rule.
                        if (varNotEmpty(data.rrule) && data.rrule != '' && varNotEmpty(rrule["FREQ"]) && rrule["FREQ"] != "") {

                            //var dtstart = new Date(moment(data.start).unix()*1000+86400*1000)
                            var until = rrule["UNTIL"]
                            eventObject.rrule = {
                                freq: rrule["FREQ"].toLowerCase(),
                                interval: parseInt(rrule["INTERVAL"]),
                                dtstart: data.start.toISOString(),
                                until: until
                            }
                            // console.log(eventObject.title, eventObject.rrule)
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

                        var eventToPush = {}
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
                            var title = "[" + i18next.t("TASK") + "] " + data.summary

                            var rrule = rruleToObject(data.rrule)

                            //Check if the event has a recurrence rule.
                            if (varNotEmpty(data.rrule) && data.rrule != '' && varNotEmpty(rrule["FREQ"]) && rrule["FREQ"] != "") {

                                var recurrenceObj = new RecurrenceHelper(data)
                                var dueDate = moment(recurrenceObj.getNextDueDate()).toISOString()
                                var startDate = moment.unix(moment(dueDate).unix() - (60 * 60)).toISOString()
                                //console.log("REPEATING", startDate, title, dueDate)

                                eventObject = {
                                    id: data.uid,
                                    title: title,
                                    allDay: false,
                                    end: dueDate,
                                    displayEventEnd: false,
                                    editable: false,
                                    draggable: true,
                                    backgroundColor: allEvents[i].info.color,
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
                                    var startDate = moment.unix(moment(data.due).unix() - (10 * 60)).toISOString()
                                    //console.log(startDate, title, dueDate)

                                    eventObject = {
                                        id: data.uid,
                                        title: title,
                                        allDay: false,
                                        start: startDate,
                                        end: dueDate,
                                        editable: false,
                                        draggable: true,
                                        displayEventStart: false,
                                        backgroundColor: allEvents[i].info.color
                                    }
                                }


                            }

                            if (eventObject && ("id" in eventObject) && eventObject.id && eventinArray(finalEvents, eventObject) == false) {
                                finalEvents.push(eventObject)
                            }

                        }
                        // this.setState((prevState, props) => {
                        //     var newAllEvents = _.cloneDeep(prevState.allEvents)
                        //     newAllEvents[data.uid] = { data: data, event: allEvents.data.message[i].events[j] }
                        //     return({allEvents: newAllEvents})

                        // })

                    }
                }
            }

        }
        setEvents(finalEvents)

    }
    const showTasksChanged = (e) => {
        setShowTasksChecked(e.target.checked)
    }
    const eventClick = (e) => {
        // console.log(e.event.id)
        setEditorInput({
            id: parseInt(e.event.id)
        })
        setShow(true)

    }
    const handleDateClick = (e) => {
        const end = moment(e.date).unix() * 1000 + 3600 * 1000
        setEditorInput({
            id: null,
            start:moment(e.date).toISOString(),
            end: moment(end).toISOString()
        })
        // console.log(moment(e.date).toISOString(),moment(end).toISOString())
        setShow(true)
    }
    const makeQuickRequesttoCaldav= async(eventData, eventInfoFromDexie) =>{
        const obj = getObjectForAPICallV2(eventData)
        var ics = await makeGenerateICSRequest({ obj })
        const caldav_accounts_id = await getCalDAVAccountIDFromCalendarID_Dexie(eventInfoFromDexie[0].calendar_id)
        if (varNotEmpty(ics)) {
            const response = await updateEvent(eventInfoFromDexie[0].calendar_id, eventInfoFromDexie[0].url, eventInfoFromDexie[0].etag, ics, caldav_accounts_id)
            if (varNotEmpty(response) && varNotEmpty(response.success) && response.success == true) {
                toast.success(i18next.t("UPDATE_OK"))


            } else {
                var message = getMessageFromAPIResponse(response)
                if (message != "" && varNotEmpty(message)) {
                    toast.error(i18next.t(message.toString()))
                    console.log(response)
                } else {
                    toast.error((i18next.t("ERROR_GENERIC")))

                }
            }

        } else {
            toast.error((i18next.t("ERROR_GENERIC")))

        }

    }
    const eventDrop = async (e) => {
        console.log(e)
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
            makeQuickRequesttoCaldav(eventData, eventInfoFromDexie)
        }


    }
    const eventResize = async (e) => {
        toast.info(i18next.t("ACTION_SENT_TO_CALDAV"))
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
            makeQuickRequesttoCaldav(eventData, eventInfoFromDexie)

        }

    }
    const userPreferencesChanged = () => {
        setUpdateLocal(Date.now())
    }

    let options: JSX.Element[] = []
    for (const i in FULLCALENDAR_VIEWLIST) {
        options.push(<option key={FULLCALENDAR_VIEWLIST[i].name} value={FULLCALENDAR_VIEWLIST[i].name}>{i18next.t(FULLCALENDAR_VIEWLIST[i].saneName)}</option>)
    }

    let calendarsSelect: JSX.Element | null = null
    if (varNotEmpty(caldav_accounts) && Array.isArray(caldav_accounts) && caldav_accounts.length > 0) {
        calendarsSelect = <ListGroupCalDAVAccounts onChange={userPreferencesChanged} caldav_accounts={caldav_accounts} />
    }
    return (

        <>
            <Row style={{ padding: 20, flex: 1, justifyContent: "center", alignItems: "center", }} >
                <Col>
                    <Form.Select value={viewValue} onChange={viewChanged}>
                        {options}
                    </Form.Select>
                </Col>
                <Col style={{}}>

                    <Form.Check
                        type="switch"
                        id="show_tasks_switch"
                        checked={showTasksChecked}
                        onChange={showTasksChanged}
                        label={i18next.t("SHOW_TASKS")}
                    />

                </Col>
                <Col style={{ textAlign: "center", }}>
                    {calendarsSelect}
                </Col>
            </Row>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, bootstrap5Plugin, interactionPlugin, rrulePlugin, listPlugin]}
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
            />
        </>
    )
}