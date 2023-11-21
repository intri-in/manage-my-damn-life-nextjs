import { caldavAccountsfromServer } from "@/helpers/frontend/calendar";
import { addAdditionalFieldsFromOldEvent, deleteEventFromServer, getEmptyEventDataObject, getEmptyRecurrenceObject, isAllDayEvent, postNewEvent, reccurence_torrule, rruleObjectToString, rruleObjecttoWords, rruleToObject, rrule_DataToFormData, updateEvent } from "@/helpers/frontend/events";
import { getI18nObject } from "@/helpers/frontend/general";
import { getObjectForAPICall, makeGenerateICSRequest } from "@/helpers/frontend/ics";
import { getAPIURL, isValidResultArray, logVar, replaceNewLineCharacters, varNotEmpty } from "@/helpers/general";
import { Component } from "react";
import { Col, Row } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Datetime from 'react-datetime';
import { AiOutlineDelete } from "react-icons/ai";
import crypto from "crypto"
import { toast } from "react-toastify";
import { getRandomString } from "@/helpers/crypto";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import moment from "moment";
import { DeleteEventConfirmation } from "../tasks/DeleteEventConfirmation";
import { Loading } from "../common/Loading";
import { parseTime, parseVALARMTIME } from "@/helpers/frontend/rfc5545";
import { BsAlarm } from "react-icons/bs";
import { getDefaultCalendarID } from "@/helpers/frontend/cookies";
import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie";
import { checkifCalendarIDPresentinDexieSummary, getCaldavIDFromCalendarID_FromDexieSummary } from "@/helpers/frontend/dexie/dexie_helper";
import { getCalDAVAccountIDFromCalendarID_Dexie, getCalendarbyIDFromDexie } from "@/helpers/frontend/dexie/calendars_dexie";
import { fetchLatestEventsV2 } from "@/helpers/frontend/sync";
import Cookies from 'js-cookie'
import { saveEventToDexie } from "@/helpers/frontend/dexie/events_dexie";

export default class EventEditor extends Component {
    constructor(props) {
        super(props)
        this.i18next = getI18nObject()
        var emptyData = getEmptyEventDataObject()
        this.state = { summary: "", fromTimeFormat: "HH:mm", toTimeFormat: "HH:mm", allDay: false, fromDate: props.eventData.data.start, toDate: props.eventData.data.end, calendarOptions: "", deleteButton: null, rrule:props.eventData.data.rrule, recurrence: { "FREQ": "", "UNTIL": "", "INTERVAL": "" }, repeatInfo: "", showRecurrenceEditor: false, showEventDeleteModal: false, selectedID: "", location: props.eventData.data.location, summary:props.eventData.data.summary, calendar_id:props.eventData.event.calendar_id, status: props.eventData.data.status, description: props.eventData.data.description, categories: props.eventData.data.categories, alarms: [], alarmTime:"START", alarmValue: 0, caldav_accounts_id: null, calendarData: null}
        this.onSummaryChanged = this.onSummaryChanged.bind(this)
        this.allDaySwitched = this.allDaySwitched.bind(this)
        this.generateCalendarName = this.generateCalendarName.bind(this)
        this.calendarSelected = this.calendarSelected.bind(this)
        this.removeRecurrence = this.removeRecurrence.bind(this)
        this.recurrence_IntervalChanged = this.recurrence_IntervalChanged.bind(this)
        this.recurrence_FreqChanged = this.recurrence_FreqChanged.bind(this)
        this.recurrence_UntilChanged = this.recurrence_UntilChanged.bind(this)
        this.addRecurrenceClicked = this.addRecurrenceClicked.bind(this)
        this.saveButtonClicked = this.saveButtonClicked.bind(this)
        this.descriptionChange = this.descriptionChange.bind(this)
        this.statusSelected = this.statusSelected.bind(this)
        this.onChangeLocation = this.onChangeLocation.bind(this)
        this.postNewEvent = this.postNewEvent.bind(this)
        this.fromDateChanged = this.fromDateChanged.bind(this)
        this.endDateChanged = this.endDateChanged.bind(this)
        this.deleteEvent = this.deleteEvent.bind(this)
        this.onDismissDeleteDialog = this.onDismissDeleteDialog.bind(this)
        this.deleteEventFromServer = this.deleteEventFromServer.bind(this)
        this.goSetRRule = this.goSetRRule.bind(this)
        this.getVAlarms = this.getVAlarms.bind(this)
        this.alarmValueChanged = this.alarmValueChanged.bind(this)
        this.alarmTimeSelected = this.alarmTimeSelected.bind(this)
        this.removeAlarm = this.removeAlarm.bind(this)
        this.newAlarmAdded = this.newAlarmAdded.bind(this)
        this.setCalendarID = this.setCalendarID.bind(this)
        this.setValuesToPost = this.setValuesToPost.bind(this)
    }

    generateEventDataArray(props) {
        /*
        var eventData = props.eventData
        if (varNotEmpty(eventData) && varNotEmpty(eventData.data)) {
            if (varNotEmpty(eventData.data.summary) == false) {
                eventData.data["summary"] = ""
            }
            if (varNotEmpty(eventData.data.start) == false) {
                eventData.data["start"] = ""
            }

            if (varNotEmpty(eventData.data.end) == false) {
                eventData.data["end"] = ""
            }
            if (varNotEmpty(eventData.data.description) == false) {
                eventData.data["description"] = ""
            }
            if (varNotEmpty(eventData.data.status) == false) {
                eventData.data["status"] = ""
            }
            if (varNotEmpty(eventData.data.location) == false) {
                eventData.data["location"] = ""
            }

            if (varNotEmpty(eventData.data.rrule) == false) {
                eventData.data["rrule"] = ""
            }

        } else {
            eventData["data"] = getEmptyEventDataObject()
        }


        if (varNotEmpty(eventData.event) == false) {
            eventData["event"] = {}
        }

        return eventData
        */
    }
    async componentDidMount() {

       // console.log(this.props.eventData.event.data, this.props.eventData.data)
        this.getVAlarms(this.props.eventData.event.data)
        //var eventData = this.generateEventDataArray(this.props)
        if (isAllDayEvent(this.props.eventData.data.start, this.props.eventData.data.end)) {
            this.setState({ allDay: true, toTimeFormat: "", fromTimeFormat: "" })
        }
        if (varNotEmpty(this.props.eventData.data.rrule) && this.props.eventData.data.rrule != "") {
            var rrule = rruleToObject(this.props.eventData.data.rrule)
            this.setState({ recurrence: rrule_DataToFormData(rrule) })
        }

        if (varNotEmpty(this.props.eventData.event.url) && this.props.eventData.event.url != "") {

            this.setState({ deleteButton: this.getDeleteButton() })
        }

        this.setCalendarID()

            
    }


    async getVAlarms(data)
    {
        const url_api = getAPIURL() + "misc/parseics"

        const authorisationData = await getAuthenticationHeadersforUser()
        var updated = Math.floor(Date.now() / 1000)
        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({ "ics": data}),
            mode: 'cors',
            headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        }
            fetch(url_api, requestOptions)
                .then(response => response.json())
                .then((body) => {
                    //console.log(body)
                    var message = getMessageFromAPIResponse(body)
                    
                    if(varNotEmpty(message) && varNotEmpty(message["VCALENDAR"]) && Array.isArray(message["VCALENDAR"]) && message["VCALENDAR"].length>0 && varNotEmpty(message["VCALENDAR"][0].VEVENT) && varNotEmpty(message["VCALENDAR"][0].VEVENT[0].VALARM) && Array.isArray(message["VCALENDAR"][0].VEVENT[0].VALARM) && message["VCALENDAR"][0].VEVENT[0].VALARM.length>0 )
                    {
                        //Has Alarms
                        var alarms=[]
                        for (const i in message["VCALENDAR"][0].VEVENT[0].VALARM)
                        {
                            var parsedAlarm = parseVALARMTIME(message["VCALENDAR"][0].VEVENT[0].VALARM[i])
                            alarms.push(parsedAlarm)
                        }
                        this.setState({alarms: alarms, parsedEventV2: message["VCALENDAR"][0].VEVENT[0]})
                    }

                }).catch (e=> {
                    logVar(e, "EventEditor:getVAlarms")
                }) 

    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.eventData != this.props.eventData) {
            this.setState({location: this.props.eventData.data.location})
        }

    }

    deleteEvent() {
        this.setState({ showEventDeleteModal: true })
    }

    getDeleteButton() {
        return (<div onClick={this.deleteEvent} style={{ color: 'red', marginTop: 20, textAlign: "center" }}>{this.i18next.t("DELETE")}</div>)

    }
    calendarSelected(e) {
        this.setState({ calendar_id: e.target.value })
        this.setValuesToPost(e.target.value)

    }
    async setCalendarID()
    {
        if(!this.state.calendar_id){
            
            var calendar = await getDefaultCalendarID()
            if(calendar){
                if(await checkifCalendarIDPresentinDexieSummary(calendar)){
                    this.setState({ calendar_id:  calendar})
                }else{
                    console.log("FALSEEEEE")
                    Cookies.remove("DEFAULT_CALENDAR_ID")
                    
                }
            }
            this.setValuesToPost(calendar)
        }else{
            this.setValuesToPost(this.state.calendar_id)

        }

    }

    async setValuesToPost(calendar_id){
        if(calendar_id){
            const caldav_accounts_id = await getCalDAVAccountIDFromCalendarID_Dexie(calendar_id)
            this.setState({caldav_accounts_id: caldav_accounts_id})
       
    
            const calendar = await getCalendarbyIDFromDexie(calendar_id)
            // console.log("calendara", calendar, calendar_id, caldav_accounts_id)
            if(isValidResultArray(calendar)){
                this.setState({calendarData: calendar[0]})
            }

        }
        this.generateCalendarName()
    }



    onSummaryChanged(e) {
        this.setState({ summary: e.target.value})
    }
    async generateCalendarName() {
        var calendarOutput = null
        var calendarsFromServer = await getCalDAVSummaryFromDexie()
      
        if (isValidResultArray(calendarsFromServer)) {
            calendarOutput = []
            calendarOutput.push(<option key="calendar-select-empty" ></option>)

            console.log(this.state.calendar_id) 
            for (let i = 0; i < calendarsFromServer.length; i++) {
                var tempOutput = []
                if(!isValidResultArray(calendarsFromServer[i].calendars)){
                    continue
                }
                for (let j = 0; j < calendarsFromServer[i].calendars.length; j++) {
                    var value = calendarsFromServer[i].calendars[j].calendars_id
                    var key = j + "." + value
                    tempOutput.push(<option key={key} style={{ background: calendarsFromServer[i].calendars[j].calendarColor }} value={value}>{calendarsFromServer[i].calendars[j].displayName}</option>)
                }
                calendarOutput.push(<optgroup key={calendarsFromServer[i].name} label={calendarsFromServer[i].name}>{tempOutput}</optgroup>)
                
            }
        }
        if (varNotEmpty(this.props.eventData.event.calendar_id) && varNotEmpty(this.props.eventData.event.url)) {
            //Change of calendar disabled for old tasks. 
            var disabled = true
        }
        else {
            var disabled = false
        }
        this.setState({ calendarOptions: (<Form.Select key="calendarOptions" onChange={this.calendarSelected} value={this.state.calendar_id} disabled={disabled} >{calendarOutput}</Form.Select>) })
    }
    removeRecurrence() {
        var recurrenceTemp = getEmptyRecurrenceObject()
        this.setState({rrule: "", recurrence: recurrenceTemp})
        /*
        this.setState((prevState, props) => {

            var newEventData =prevState.eventData
            newEventData.data["rrule"] = "popp"

            return ({recurrence: recurrenceTemp, eventData:newEventData
            })
        })
            
        */


    }
    recurrence_IntervalChanged(e) {
        this.setState(function (prevState, prevProps) {
            var recurrence = prevState.recurrence
            recurrence["INTERVAL"] = e.target.value
            return({ recurrence: recurrence })
        })

    }
    recurrence_FreqChanged(e) {
        this.setState(function (prevState, prevProps) {
            var recurrence = prevState.recurrence
            recurrence["FREQ"] = e.target.value
            return({ recurrence: recurrence })
    
        })

    }
    recurrence_UntilChanged(e) {
        this.setState(function (prevState, prevProps) {
            var recurrence = prevState.recurrence
            recurrence["UNTIL"] = e._d
            return({ recurrence: recurrence })
        })

    }
    addRecurrenceClicked() {

        console.log(this.state.recurrence)
        if(varNotEmpty(this.state.recurrence["FREQ"])==false || varNotEmpty(this.state.recurrence["FREQ"]) && this.state.recurrence["FREQ"].trim()=="")
        {
            toast.error(this.i18next.t("RRULE_EMPTY_FREQ"))
        }else{
            if(varNotEmpty(this.state.recurrence["UNTIL"])&&this.state.recurrence["UNTIL"].toString().trim()!="" && varNotEmpty(this.state.fromDate) &&this.state.fromDate.toString().trim()!="")
            {
                var startDate = moment(this.state.fromDate).unix()
                var untilDate= moment(this.state.recurrence["UNTIL"]).unix()
                if(untilDate > startDate)
                {
                    this.goSetRRule()

                }else{
                    toast.error(this.i18next.t("ERROR_RRULE_UNTIL_BEFORE_START"))
                }

            }else{
                this.goSetRRule()
            }
    
        }

    }

    goSetRRule()
    {
        var newRRule = rruleObjectToString(reccurence_torrule(this.state.recurrence))
        if (varNotEmpty(newRRule) && newRRule.trim() != "") {

            this.setState({ rrule: newRRule })

        }

    }
    getRepeatInfo() {
        var toWords = rruleObjecttoWords(rruleToObject(this.state.rrule))
        var toReturn = []
        if (toWords != "" && varNotEmpty(toWords)) {
            toReturn.push(<Row key={this.props.eventData.data.uid} style={{ marginBottom: 20 }} >
                <Col>
                    {toWords}
                </Col>
                <Col style={{ textAlign: "right", color: "red" }}>
                    <AiOutlineDelete onClick={this.removeRecurrence}  />
                </Col>

            </Row>)

        } else {
            toReturn.push(
                <div >
                    <Row>
                        <Col>
                            {this.i18next.t("EVERY")}
                        </Col>
                        <Col>
                            <Form.Control value={this.state.recurrence.INTERVAL} onChange={this.recurrence_IntervalChanged} min={1} size="sm" type="number" style={{ width: 100 }}  ></Form.Control>
                        </Col>
                        <Col>
                            <Form.Select value={this.state.recurrence.FREQ} onChange={this.recurrence_FreqChanged} size="sm">
                                <option></option>
                                <option value="DAYS">{this.i18next.t("DAYS")}</option>
                                <option value="WEEKS">{this.i18next.t("WEEKS")}</option>
                                <option value="MONTHS">{this.i18next.t("MONTHS")}</option>
                            </Form.Select>

                        </Col>
                    </Row>
                    <div>{this.i18next.t("UNTIL") + ":"}</div>
                    <br />
                    <Datetime value={this.state.recurrence.UNTIL} onChange={this.recurrence_UntilChanged} dateFormat="DD/MM/YYYY" timeFormat={null} />
                    <Row style={{ margin: 10, textAlign: "right" }}>
                        <Col>
                        </Col>
                        <Col>
                            <Button onClick={this.addRecurrenceClicked}>{this.i18next.t("SAVE")}</Button>
                        </Col>
                    </Row>

                </div>
            )

        }


        return (<div style={{ border: "1px solid gray", padding: 10 }}>{toReturn}</div>)
    }

    allDaySwitched(e) {
        var toTimeFormat = "HH:mm"
        var fromTimeFormat = "HH:mm"
        if (e.target.checked) {
            toTimeFormat = ""
            fromTimeFormat = ""
        }
        this.setState(function (prevState, prevProps) {
            var fromDate = prevState.fromDate
            var newTo = new Date((moment(fromDate).unix()*1000)+(86400*1000))
            //console.log(newTo)
            return({toDate: newTo})

        })
        this.setState({ allDay: e.target.checked, toTimeFormat: toTimeFormat, fromTimeFormat: fromTimeFormat })
    }

    isValidEvent(eventData) {

        if (varNotEmpty(eventData.data.summary) == false || (varNotEmpty(eventData.data.summary) && eventData.data.summary.trim() == "")) {
            toast.error(this.i18next.t("CANT_CREATE_EMPTY_TASK"))
            return false
        }

        if (varNotEmpty(eventData.data.start) == false || varNotEmpty(eventData.data.start) && eventData.data.start.toString().trim() == "") {
            toast.error(this.i18next.t("EVENT_NEEDS_BOTH_FROM_AND_TO"))
            return false

        }

        if (varNotEmpty(eventData.data.end) == false || varNotEmpty(eventData.data.end) && eventData.data.end.toString().trim() == "") {
            toast.error(this.i18next.t("EVENT_NEEDS_BOTH_FROM_AND_TO"))
            return false

        }

        if (varNotEmpty(eventData.data.end) && eventData.data.end.toString().trim() != "" && varNotEmpty(eventData.data.end) && eventData.data.start.toString().trim() != "") {
            var endUnix = moment(eventData.data.end).unix()
            var startUnix = moment(eventData.data.start).unix()

            if (endUnix < startUnix) {
                toast.error(this.i18next.t("ERROR_ENDDATE_SMALLER_THAN_START"))

                return false
            }
        }


        if ((varNotEmpty(eventData.event.calendar_id) && eventData.event.calendar_id == "") || varNotEmpty(eventData.event.calendar_id) == false) {
            toast.error(this.i18next.t("ERROR_PICK_A_CALENDAR"))
            return false


        }

        return true
    }

    descriptionChange(e) {
        this.setState({ description: e.target.value })
    }
    fromDateChanged(e) {
        var fromDate = e._d

        this.setState({ fromDate:fromDate})

    }
    endDateChanged(e) {
        var toDate = e._d
        /*
        if(this.state.allDay==true)
        {
            toDate=new Date((moment(e._d).unix()+86000)*1000)
        }
        */
        this.setState({ toDate:toDate })


    }
    statusSelected(e) {

        this.setState({ status: e.target.value })
    }
    onChangeLocation(e) {
        this.setState({ location: e.target.value })

    }
    async saveButtonClicked() {
        var eventData = {data:{summary: this.state.summary, start: this.state.fromDate, end: this.state.toDate, status: this.state.status, description: this.state.description, rrule: this.state.rrule, location: this.state.location, alarms: this.state.alarms} , event:{calendar_id: this.state.calendar_id, url: this.props.eventData.event.url, }}
        
        if(!this.state.calendar_id){
            toast.error(this.i18next.t("SELECT_A_CALENDAR"))
            console.error("this.state.calendarData", this.state.calendarData)
            console.error("this.state.calendar_id",this.state.calendar_id)
            return null

        }
        if(!this.state.calendarData){
            toast.error(this.i18next.t("ERROR_GENERIC"))
            console.error("this.state.calendarData", this.state.calendarData)
            console.error("this.state.calendar_id",this.state.calendar_id)
            return null
        }

        // Add fields not supported by MMDL. 

        // this.setCaldav_accounts_id(this.state.calendars_id) //Reset it, to be safe.

        eventData = addAdditionalFieldsFromOldEvent(eventData, this.props.eventData)

        if (this.isValidEvent(eventData)) {
            var obj = getObjectForAPICall(eventData.data)
            //console.log("obj", obj)
            var ics = await makeGenerateICSRequest({ obj })
            if(process.env.NEXT_PUBLIC_DEBUG_MODE==="true") console.log(eventData, ics)
            if (varNotEmpty(ics)) {

                //Make add request if new, edit request otherwise.
                //console.log(ics)
                this.setState({ loading: true })
                if (varNotEmpty(eventData.event.url)) {
                    this.updateEvent(this.props.eventData.event.calendar_id, this.props.eventData.event.url, this.props.eventData.event.etag, ics )
                } else {
                    var etag = getRandomString(32)

                    this.postNewEvent(this.state.calendar_id, ics, etag)
                }
            }
        }



        /*
            
            
            
            //Optional: If you need to add some of your own tags
            additionalTags: {
              'SOMETAG': 'SOME VALUE'
            },
            
            

            
            
         
      
            

          };
           */
    }

    async postNewEvent(calendar_id, data, etag) {

        toast.info(this.i18next.t("ACTION_SENT_TO_CALDAV"))
        // Premptively save event.
        const fileName = getRandomString(32)+".ics"
        let url=this.state.calendarData["url"] 
        var lastChar = url.substr(-1);
        if (lastChar != '/') {       
            url = url + '/';          
        }
        url += fileName
        
        saveEventToDexie(calendar_id, url, etag, data, "VEVENT").then(result =>{
          this.props.onDismiss()
           
           postNewEvent(calendar_id, data, etag, this.state.caldav_accounts_id, this.state.calendarData["ctag"], this.state.calendarData["syncToken"], this.state.calendarData["url"],"VEVENT",fileName)
            .then(body =>{
                if (body && body.success ){
                    toast.success(this.i18next.t("EVENT_SUBMIT_OK"))
                    this.props.onDismiss()
    
                } else {
                    toast.error(this.i18next.t("ERROR_GENERIC"))
                }
            }) 
            
       })
            // const url_api = getAPIURL() + "v2/calendars/events/add"

        // const authorisationData = await getAuthenticationHeadersforUser()
        // var updated = Math.floor(Date.now() / 1000)
        // const requestOptions =
        // {
        //     method: 'POST',
        //     body: JSON.stringify({ "etag": etag, "data": data, "type": "VEVENT", "updated": updated, "calendar_id": calendar_id, "caldav_accounts_id":this.state.caldav_accounts_id, ctag:this.state.calendarData["ctag"], syncToken:this.state.calendarData["syncToken"], url:this.state.calendarData["url"]   }),
        //     mode: 'cors',
        //     headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        // }

        //     const response = await fetch(url_api, requestOptions)
        //         .then(response => response.json())
        //         .then((body) => {
        //             //console.log(body)
        //             if (varNotEmpty(body)) {
        //                 var message = getMessageFromAPIResponse(body)
        //                 if (varNotEmpty(body.success) && body.success == true) {
        //                     fetchLatestEventsV2().then((response)=>{
        //                         toast.success(this.i18next.t("EVENT_SUBMIT_OK"))
        //                         this.props.onDismiss()

        //                     })

        //                 } else {
        //                     toast.error(this.i18next.t(message.toString()))
        //                     this.props.onDismiss()
        //                 }
        //             }else{

        //                 this.props.onDismiss()
        //             }



        //         }).catch (e =>{
        //             toast.error(e.message)
        //             this.props.onDismiss()
        //         }) 
    }

    async updateEvent(calendar_id, url, etag, data) {
        toast.info(this.i18next.t("ACTION_SENT_TO_CALDAV"))
        saveEventToDexie(calendar_id, url, etag, data, "VEVENT").then(result =>{
            this.props.onDismiss()

            updateEvent(calendar_id, url, etag, data, this.state.caldav_accounts_id).then(body =>{
            if (varNotEmpty(body)) {
                var message = getMessageFromAPIResponse(body)
                if (varNotEmpty(body.success) && body.success == true) {
                        toast.success(this.i18next.t("UPDATE_OK"))
                        //toast.success(this.i18next.t("EVENT_SUBMIT_OK"))
                        this.props.onDismiss()
    
    
                } else {
                    if (message){
                        toast.error(this.i18next.t(message.toString()))
                    }else{
                        toast.error(this.i18next.t("ERROR_GENERIC"))
                    }
                    this.props.onDismiss()
                }
            }else{
                toast.error(this.i18next.t("ERROR_GENERIC"))
    
                this.props.onDismiss()
    
            }
    
    
            })
        })
        // const url_api = getAPIURL() + "v2/calendars/events/modify"

        // const authorisationData = await getAuthenticationHeadersforUser()
        // var updated = Math.floor(Date.now() / 1000)
        // console.log(data)
        // const requestOptions =
        // {
        //     method: 'POST',
        //     body: JSON.stringify({ "etag": etag, "data": data, "type": "VEVENT", "updated": updated, "calendar_id": calendar_id, url: url, deleted: "", caldav_accounts_id: this.state.caldav_accounts_id }),
        //     mode: 'cors',
        //     headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        // }
        //     const response = await fetch(url_api, requestOptions)
        //         .then(response => response.json())
        //         .then((body) => {
        //             if (varNotEmpty(body)) {
        //                 var message = getMessageFromAPIResponse(body)
        //                 if (varNotEmpty(body.success) && body.success == true) {
        //                     fetchLatestEventsV2().then((response)=>{
        //                         toast.success(this.i18next.t("UPDATE_OK"))
        //                         //toast.success(this.i18next.t("EVENT_SUBMIT_OK"))
        //                         this.props.onDismiss()

        //                     })

        //                 } else {
        //                     toast.error(this.i18next.t(message.toString()))
        //                     this.props.onDismiss()
        //                 }
        //             }else{
        //                 this.props.onDismiss()

        //             }


        //         }).catch (e =>{
        //             toast.error(e.message)
        //             this.props.onDismiss()

        //         }) 

    }
    onDismissDeleteDialog() {
        this.setState({ showEventDeleteModal: false })
    }

    async deleteEventFromServer() {
        this.props.onDismiss()
        toast.info(this.i18next.t("DELETE_ACTION_SENT_TO_CALDAV"))
        deleteEventFromServer( this.state.caldav_accounts_id, this.props.eventData.event.calendar_id, this.props.eventData.event.url, this.props.eventData.event.etag ).then((body)=>{
            var message = getMessageFromAPIResponse(body)

            if (varNotEmpty(body) && body.success == true) {
                    toast.success(this.i18next.t("DELETE_OK"))
                    this.props.onDismiss()

            } else {
                if(message){
                    toast.error(this.i18next.t(message))

                }else{

                    toast.error(this.i18next.t("ERROR_GENERIC"))
                }
                this.props.onDismiss()

            }

        })
        // const url_api = getAPIURL() + "v2/calendars/events/delete"

        // const authorisationData = await getAuthenticationHeadersforUser()
        // const requestOptions =
        // {
        //     method: 'POST',
        //     body: JSON.stringify({ "etag": this.props.eventData.event.etag, "url": this.props.eventData.event.url, "calendar_id": this.props.eventData.event.calendar_id, caldav_accounts_id: this.state.caldav_accounts_id }),
        //     mode: 'cors',
        //     headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        // }
        //     const response = await fetch(url_api, requestOptions)
        //         .then(response => response.json())
        //         .then((body) => {
                    // var message = getMessageFromAPIResponse(body)

                    // if (varNotEmpty(body) && body.success == true) {
                    //     fetchLatestEventsV2().then((response)=>{
                    //         toast.success(this.i18next.t(message))
                    //         //toast.success(this.i18next.t("EVENT_SUBMIT_OK"))
                    //         this.props.onDismiss()

                    //     })
                    // } else {
                    //     this.props.onDismiss()
                    //     toast.success(this.i18next.t("UPDATE_OK"))

                    // }



        //         }).catch (e =>{
        //             console.error("deleteEventFromServer:", e)
        //             this.props.onDismiss(e.message)
        //         }) 


    }
    alarmValueChanged(e)
    {
        this.setState({alarmValue:e.target.value})
    }
    alarmTimeSelected(e)
    {
        this.setState({alarmTime: e.target.value})
    }
    removeAlarm(alarmtoDelete)
    {
        console.log(alarmtoDelete)
        this.setState(function (prevState, prevProps) {
            var alarms = []
            for (const i in prevState.alarms)
            {
                if(prevState.alarms[i].VALUE != alarmtoDelete.VALUE)
                {
                    alarms.push(prevState.alarms[i])
                }
            }

            return({alarms: alarms})
        })
    }
    newAlarmAdded()
    {

        
            // Add the alarm, but only if it isn't already present in state array.
            var valueinSeconds = -1*this.state.alarmValue*60

                var newAlarms = this.state.alarms
                var found = false
                for (const i in this.state.alarms)
                {
                    if(this.state.alarms[i].VALUE==valueinSeconds)
                    {
                        found=true
                    }
                }

                if(found==false)
                {
                    newAlarms.push({"RELATED": "START", "VALUE": valueinSeconds})

                }else{
                    toast.error(this.i18next.t("ALARM_ALREADY_SET"))
                }

               this.setState({alarms: newAlarms, alarmValue:0})
           
      
    }
    getAlarmForm(){
        var toReturn=[]

        if(this.state.alarms.length>0)
        {
            for(const i in this.state.alarms)
            {
               
                var minuteValue = (this.state.alarms[i].VALUE/60).toString()
                if(minuteValue.startsWith("-"))
                {
                    minuteValue = minuteValue.substring(1,minuteValue.length)
                }
                toReturn.push(<Row style={{padding:10,}}><Col className="col-9" style={{  display: 'flex', alignItems: "center", }}><BsAlarm /> &nbsp; {minuteValue} {this.i18next.t("ALARM_DESCRIPTION_BEFORE_START")}</Col><Col style={{  display: 'flex', alignItems: "center", justifyContent:"right" }} className="col-3" > <AiOutlineDelete style={{color: "red"}} onClick={()=>this.removeAlarm(this.state.alarms[i])}  /> </Col></Row>)
               
               
            }
        }

        toReturn.push(
        <Row style={{justifyContent: 'center', display: 'flex', alignItems: "center", }}>
            <Col className="col-4">
            <Form.Control
                type="number"
                min={0}
                value={this.state.alarmValue}
                onChange={this.alarmValueChanged}
            />
            </Col>
            <Col className="col-8">
            {this.i18next.t("ALARM_DESCRIPTION_BEFORE_START")}
            </Col>
           {/*  <Col className="col-6">
            <Form.Select onChange={this.alarmTimeSelected} value={this.state.alarmTime}>
                    <option value="START">{this.i18next.t("START")}</option>
                    <option value="END">{this.i18next.t("END")}</option>
                </Form.Select>
            </Col>

                */}
        </Row>)
        toReturn.push(
        <div style={{padding : 10, textAlign: "center"}}>
            <Button size="sm" onClick={this.newAlarmAdded}>{this.i18next.t("ADD")}</Button>
        </div>)

        return (<div style={{ border: "1px solid gray", padding: 10 }}>{toReturn}</div>)
    }
    render() {
        var toDate = this.state.allDay ? null : (<></>)

        var lastModified = ""
        if (varNotEmpty(this.props.eventData.data.lastmodified)) {
            lastModified = (<p><b>{this.i18next.t("LAST_MODIFIED") + ": "}</b>{this.props.eventData.data.lastmodified.toString()}</p>
            )

        }

        var buttons = this.state.loading ? (<div style={{ textAlign: "center" }}> <Loading /></div>) : (<div style={{ textAlign: "center", }}><Button onClick={this.saveButtonClicked} style={{ width: "100%" }}>{this.i18next.t("SAVE")}</Button> <br />{this.state.deleteButton}
        </div>)

        var alarm_form = this.getAlarmForm()
        var repeatInfo = this.getRepeatInfo()
        return (
            <>
                <h3>{this.i18next.t("EVENT_SUMMARY")}</h3>
                <Form.Control onChange={this.onSummaryChanged} value={this.state.summary} />
                <br />
                <h3>{this.i18next.t("CALENDAR")}</h3>
                {this.state.calendarOptions}
                <br />
                <Form.Check
                    type="switch"
                    label={this.i18next.t("ALL_DAY_EVENT")}
                    checked={this.state.allDay}
                    onChange={this.allDaySwitched}
                />

                {this.i18next.t("FROM")} <Datetime value={this.state.fromDate} onChange={this.fromDateChanged} closeOnSelect={true} dateFormat="D/M/YYYY" timeFormat={this.state.fromTimeFormat} />


                {this.i18next.t("TO")}<Datetime value={this.state.toDate} onChange={this.endDateChanged} dateFormat="D/M/YYYY" timeFormat={this.state.toTimeFormat} closeOnSelect={true} />
                <br />

                <h3>{this.i18next.t("STATUS")}</h3>
                <Form.Select onChange={this.statusSelected} value={this.state.status}>
                    <option value=""></option>
                    <option value="TENTATIVE">{this.i18next.t("TENTATIVE")}</option>
                    <option value="CONFIRMED">{this.i18next.t("CONFIRMED")}</option>
                    <option value="CANCELLED">{this.i18next.t("CANCELLED")}</option>

                </Form.Select>
                <br />
                <h3>{this.i18next.t("DESCRIPTION")}</h3>
                <Form.Control value={this.state.description} onChange={this.descriptionChange} as="textarea" rows={3} />
                <br />
                <h3>{this.i18next.t("RECURRENCE")}</h3>
                {repeatInfo}
                <br />
                <h3>{this.i18next.t("ALARMS")}</h3>
                {alarm_form}
                <br />
                <h3>{this.i18next.t("LOCATION")}</h3>
                <Form.Control onChange={this.onChangeLocation} value={this.state.location} />

                <br />
                <br />
                {lastModified}
                <br />
                {buttons}
                <br />
                <DeleteEventConfirmation
                    show={this.state.showEventDeleteModal}
                    onHide={this.onDismissDeleteDialog}
                    onDismissDeleteDialog={this.onDismissDeleteDialog}
                    onDeleteOK={this.deleteEventFromServer}

                />
            </>
        )
    }
}