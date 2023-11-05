import { Component } from "react";
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { getI18nObject, ISODatetoHuman } from "@/helpers/frontend/general";
import { Row, Col, Button, Alert } from "react-bootstrap";
import * as moment from 'moment';
import VTodoGenerator from 'vtodogenerator'
import { getAPIURL, getISO8601Date, isValidResultArray, logVar, varNotEmpty } from "@/helpers/general";
import SearchLabelArray from "../common/SearchLabelArray";
import { getRandomString } from "@/helpers/crypto";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { toast } from "react-toastify";
import {  AiOutlineDelete } from "react-icons/ai";
import { TaskDeleteConfirmation } from "./TaskDeleteConfirmation";
import { getDefaultCalendarID } from "@/helpers/frontend/cookies";
import { Loading } from "../common/Loading";
import ParentTaskSearch from "./ParentTaskSearch";
import { generateNewTaskObject } from "@/helpers/frontend/tasks";
import Recurrence from "../common/Recurrence";
import { rruleToObject } from "@/helpers/frontend/events";
import { RRuleHelper } from "@/helpers/frontend/classes/RRuleHelper";
import * as _ from 'lodash'
import { VTODO } from "@/helpers/frontend/classes/VTODO";
import { getStandardDateFormat } from "@/helpers/frontend/settings";
import { getErrorResponse } from "@/helpers/errros";
import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie";
import { getAllLabelsFromDexie } from "@/helpers/frontend/dexie/dexie_labels";
import { getCalDAVAccountIDFromCalendarID_Dexie, getCalendarbyIDFromDexie } from "@/helpers/frontend/dexie/calendars_dexie";
import { saveEventToDexie } from "@/helpers/frontend/dexie/events_dexie";
export default class TaskEditor extends Component {
    constructor(props) {
        super(props)
        var dueDate = ""
        if (props.data.due != null && props.data != null && props != null) {
          if(varNotEmpty(props.newTask) && props.newTask==true){
            dueDate = props.data.due
          } else{
            dueDate = ISODatetoHuman(props.data.due)
          } 

        }
        //console.log(props.data.due, dueDate)

        var startDate = ""
        if (props.data.start != null && props.data.start != "") {
            startDate = moment(props.data.start)
        }

        if (this.props.data.completion == null) {
            var completion = 0
        }
        else {
            var completion = this.props.data.completion
        }
        if (this.props.data.completed = null) {
            //completion = 100
        }
        var taskDone = false
        if (props.data.taskDone != null && props.data.taskDone != "") {
            taskDone = props.data.taskDone
        }
        var calendar_id=""
        if(varNotEmpty(props.data.calendar_id))
        {
            calendar_id=props.data.calendar_id
        }
        // console.log("initial calendar_id", calendar_id)
        var status=''
        if(varNotEmpty(props.data.status))
        {
            status=props.data.status
        }
        var priority=""
        if(varNotEmpty(props.data.priority))
        {
            priority = props.data.priority
        }

        var rrule =[]
        if(props.data.rrule!=null)
        {
            rrule=rruleToObject(props.data.rrule)
        }
        var description = ""
        if(varNotEmpty(props.data.description))
        {
            if(typeof(props.data.description)=="string")
            {
                description = props.data.description
            }else{
                if(varNotEmpty(props.data.description.val))
                {
                    description= props.data.description.val
                }
            }
    
        }

        this.state = { showEditor: false, data: null, summary: props.data.summary, dueDate: dueDate, dueDateUTC: props.data.due, start: startDate, priority: props.data.priority, completion: completion, description: description, category: props.data.category, labels: null, completed: props.data.completed, status: status, calendarOptions: [], calendar: "", parentTask: null, calendar_id: calendar_id, showTaskDeleteModal: false, deleteTaskButton: null, taskDone: taskDone, saveButton: null, relatedto: props.data.relatedto, calendarsFromServer: [],rrule:rrule, repeatInfo: _.cloneDeep(props.repeatInfo), todoList: _.cloneDeep(props.todoList), recurrences: props.data.recurrences, isRepeatingTask: false, nextUpRepeatingInstance: null, caldav_accounts_id:"", calendarData: null}

        //console.log("props.data.recurrences", props.data.recurrences)
        // console.log(props.data)
        this.i18next = getI18nObject()
        this.dueDateChanged = this.dueDateChanged.bind(this)
        this.completionChanged = this.completionChanged.bind(this)
        this.getLabels = this.getLabels.bind(this)
        this.onLabelAdded = this.onLabelAdded.bind(this)
        this.saveTask = this.saveTask.bind(this)
        this.priorityChanged = this.priorityChanged.bind(this)
        this.startDateChange = this.startDateChange.bind(this)
        this.taskSummaryChanged = this.taskSummaryChanged.bind(this)
        this.calendarSelected = this.calendarSelected.bind(this)
        this.descriptionChanged = this.descriptionChanged.bind(this)
        this.updateTodo = this.updateTodo.bind(this)
        this.removeLabel = this.removeLabel.bind(this)
        this.taskCheckBoxClicked = this.taskCheckBoxClicked.bind(this)
        this.deleteTask = this.deleteTask.bind(this)
        this.onDismissDeleteDialog = this.onDismissDeleteDialog.bind(this)
        this.deleteTheTaskFromServer = this.deleteTheTaskFromServer.bind(this)
        this.getStatusDropdown = this.getStatusDropdown.bind(this)
        this.statusValueChanged = this.statusValueChanged.bind(this)
        this.removeParentClicked = this.removeParentClicked.bind(this)
        this.onParentSelect = this.onParentSelect.bind(this)
        this.setCalendarID= this.setCalendarID.bind(this)
        this.checkifValid = this.checkifValid.bind(this)
        this.getCalendarDDL = this.getCalendarDDL.bind(this)
        this.onRruleSet = this.onRruleSet.bind(this)
        this.getNextUpKey = this.getNextUpKey.bind(this)
        this.fixDueDate = this.fixDueDate.bind(this)
        this.setupInitialValues = this.setupInitialValues.bind(this)
    }

    componentDidMount() {
        this.getLabels()
        this.generateCalendarName()
        this.getCalendarDDL()
        if (this.props.data.url_internal == null) {
            //Probably a new task.
            this.props.onChange()

        }
        else {
            var deleteTaskButton = (<div onClick={this.deleteTask} style={{ color: 'red', marginTop: 20, textAlign: "center" }}>Delete Task</div>)

            this.setState({ deleteTaskButton: deleteTaskButton })
        }

        if (this.props.data.calendar_id != null && this.props.data.calendar_id != "") {
            this.setState({ calendar_id: this.props.data.calendar_id })
            this.setupInitialValues(this.props.data.calendar_id)
        }
        else {
            this.setCalendarID()

        }


        this.setState({
            saveButton: (<Button onClick={this.saveTask} style={{ width: "90%" }}>Save</Button>
            )
        })

        var isRepeatingTask = false
        var nextupKey=null
        if(varNotEmpty(this.state.repeatInfo) && varNotEmpty(this.state.repeatInfo.newObj))
        {
            if( Object.keys(this.state.repeatInfo.newObj).length>0 && varNotEmpty(this.props.data.rrule) )
            {
                nextupKey = this.getNextUpKey()
                isRepeatingTask=true
                this.setState({isRepeatingTask: true, nextUpRepeatingInstance: nextupKey})
    
            }
        }

        if (this.props.data.taskDone != null && this.props.data.taskDone != "") {
            var completed = Math.floor(Date.now() / 1000)

            if(isRepeatingTask==false)
            {

                this.setState({ completed: completed, })
    
            }else{
                this.state.repeatInfo.setPropertyOfInstance("completed",completed, nextupKey)
            }
        }

    }

    async setupInitialValues(calendar_id){
        if(calendar_id){
            
            const caldav_accounts_id = await getCalDAVAccountIDFromCalendarID_Dexie(calendar_id)
                this.setState({caldav_accounts_id: caldav_accounts_id})
           
    
            const calendar = await getCalendarbyIDFromDexie(calendar_id)
            // console.log("calendara", calendar, calendar_id, caldav_accounts_id)
                if(isValidResultArray(calendar)){
                    this.setState({calendarData: calendar[0]})
                }
        }

    }
    /**
     * Key of the next up repeating instance of the tasks
     * @returns String key
     */
    getNextUpKey()
    {

        for(const i in this.props.repeatInfo.newObj)
        {
            //console.log(this.state.repeatInfo.newObj[i])

            if((this.props.repeatInfo.newObj[i].completed=="" || this.props.repeatInfo.newObj[i].completed==null) && this.props.repeatInfo.newObj[i].status!="COMPLETED")
            {
                return i
            }
        }

        return ""

    }
    async setCalendarID()
    {
        var calendar = await getDefaultCalendarID()
        if(calendar){
            this.setState({ calendar_id:  calendar})
            this.setupInitialValues(calendar)
        }

    }
    componentDidUpdate(prevProps, prevState) {

        if (this.props.calendar_id !== prevProps.calendar_id) {

            this.setState({ calendar_id: this.props.calendar_id, calendar: this.props.calendar_id })
        }

        if(this.props.todoList != prevProps.todoList)
        {
            //console.log("update", this.props.todoList)
            this.setState({todoList: _.cloneDeep(this.props.todoList)})
        }

        if(this.props.data!= prevProps.data)
        {
            var newCalendarID = this.props.data.calendar_id
            this.setState({calendar_id: newCalendarID})
        }

    }

    getStatusDropdown() {
        var validStatuses = VTodoGenerator.getValidStatusValues()
        var finalOutput = []
        for (const i in validStatuses) {
            finalOutput.push(<option key={validStatuses[i]} value={validStatuses[i]}>{validStatuses[i]}</option>)
        }

        var finalOutput = (<Form.Select value={this.state.status} onChange={this.statusValueChanged} >
            {finalOutput}
        </Form.Select>)

        return finalOutput
    }

    statusValueChanged(e) {
        this.setState({ status: e.target.value })
    }
    calendarSelected(e) {
        this.setState({ calendar_id: e.target.value })   
        this.setupInitialValues(e.target.value)
        this.getCalendarDDL()
    }
    removeParentClicked() {
        this.setState(function(previousState, currentProps) {
            var newRelatedTo = _.cloneDeep(previousState.relatedto)
            newRelatedTo = VTODO.removeParentFromRelatedTo(newRelatedTo)
            return({relatedto: newRelatedTo})
        })
            this.props.onChange();
    }

    removeLabel(e) {
        this.setState(function (previousState, currentProps) {
            var newArray = []
            for (const i in previousState.category) {
                if (previousState.category[i] != e.target.id) {
                    newArray.push(previousState.category[i])
                }
            }
            return {
                category: newArray
            };
        });

        this.getLabels()
    }
    async generateCalendarName() {
        // const calendarsFromCookies= getUserCalendarsFromLocalStorage()
        // if(varNotEmpty(calendarsFromCookies)){
        //     this.setState({calendarsFromServer: calendarsFromCookies})

        // }else{
        //     var calendarsFromServer = await caldavAccountsfromServer()
        //     setUserCalendarStorageVar(calendarsFromServer)
        //     this.setState({calendarsFromServer: calendarsFromServer})
    
        // }
    }

    async getCalendarDDL()
    {
        var calendarOutput = null

        var calendarsFromServer = await getCalDAVSummaryFromDexie()
        if (isValidResultArray(calendarsFromServer)) {
            calendarOutput = []
            calendarOutput.push(<option key="calendar-select-empty" ></option>)

            for (let i = 0; i < calendarsFromServer.length; i++) {
                var tempOutput = []

                for (let j = 0; j < calendarsFromServer[i].calendars.length; j++) {
                    var value = calendarsFromServer[i].calendars[j].calendars_id
                    var key = j + "." + value
                    tempOutput.push(<option key={key} style={{ background: calendarsFromServer[i].calendars[j].calendarColor }} value={value}>{calendarsFromServer[i].calendars[j].displayName}</option>)
                }
                calendarOutput.push(<optgroup key={calendarsFromServer[i].name} label={calendarsFromServer[i].name}>{tempOutput}</optgroup>)

            }
        }
        if (this.props.data.calendar_id != null && this.props.data.url_internal != null) {
            //Change of calendar disabled for old tasks. 
            var disabled = true
        }
        else if (this.props.data.calendar_id != null && this.props.data.url_internal == null && this.props.data.isSubtask != null) {
            var disabled = true

        }
        else {
            var disabled = false
        }
        // console.log("this.state.calendar_id at DDL", this.state.calendar_id)
        this.setState({calendarOptions: <Form.Select key="calendarOptions" onChange={this.calendarSelected} disabled={disabled} value={this.state.calendar_id}>{calendarOutput}</Form.Select>}) 

    }
    taskSummaryChanged(e) {
        this.setState({ summary: e.target.value })
        this.props.onChange();
    }
    taskCheckBoxClicked(e) {
        var completed = ""
        //console.log(this.state.nextUpRepeatingInstance)
        if (e.target.checked == true) {
                var completed = new Date(Math.floor(Date.now()))

                if(this.state.isRepeatingTask==true)
                {
                    this.state.repeatInfo.setPropertyOfInstance("completed",completed, this.state.nextUpRepeatingInstance)
                    this.setState({ taskDone: e.target.checked})
                }else{

                    this.setState({ taskDone: e.target.checked, completed: completed })
        
                }

            } else {
                if(this.state.isRepeatingTask==true)
                {
                    var completed = null

                    this.state.repeatInfo.setPropertyOfInstance("completed",completed, this.state.nextUpRepeatingInstance)
                    this.setState({ taskDone: e.target.checked })

                }
                else{
                var completed = null
                    this.setState({ taskDone: e.target.checked, completed: completed })
                }

        }


    }
    dueDateChanged(value) {
        if (value != null) {
            this.setState({ dueDate: value._d })

        }
        else {

            this.setState({ dueDate: '' })


        }
        this.props.onChange();

    }

    startDateChange(value) {
        this.setState({ start: value._d })
        this.props.onChange();

    }
    onLabelAdded(newLabelArray) {
        this.setState({ category: newLabelArray })
        this.getLabels()
        this.props.onChange()
    }

    async getLabels() {

        var labelArray = []
        var labels = await getAllLabelsFromDexie()
        var labelColour = ""

        if (isValidResultArray(this.state.category)) {

            for (const i in this.state.category) {
                if (isValidResultArray(labels)) {
                    for (let j = 0; j < labels.length; j++) {
                        if (labels[j].name == this.state.category[i]) {
                            labelColour = labels[j].colour
                        }
                    }
                }

                labelArray.push(<span onClick={this.removeLabel} id={this.state.category[i]} key={this.state.category[i]}  className="badge rounded-pill textDefault" style={{ marginLeft: 3, marginRight: 3, padding: 3, backgroundColor: labelColour, color: "white" }}>{this.state.category[i]}</span>)

            }
        }
        labelArray.push(<div key={this.props.data.uid + "search"} style={{ marginTop: 10, marginBottom: 10 }}><SearchLabelArray dataList={labels} labels={this.state.category} onLabelAdded={this.onLabelAdded} /></div>)
        this.setState({ labels: labelArray })

    }
    completionChanged(target) {
        this.setState({ completion: target.target.value })
        this.props.onChange()

    }
    priorityChanged(e) {

        this.setState({ priority: e.target.value })
        this.props.onChange();

    }
    descriptionChanged(e) {
        this.setState({ description: e.target.value })
        this.props.onChange();

    }
    deleteTask() {this.state.calendar
        this.setState({ showTaskDeleteModal: true })
    }
    onDismissDeleteDialog() {
        this.setState({ showTaskDeleteModal: false })

    }
    async deleteTheTaskFromServer() {
        const url_api = getAPIURL() + "v2/calendars/todo/delete"

        const authorisationData = await getAuthenticationHeadersforUser()
        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({ "etag": this.props.data.etag, "url": this.props.data.url_internal, "calendar_id": this.state.calendar_id, caldav_accounts_id: this.state.caldav_accounts_id}),
            mode: 'cors',
            headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        }
           
            const response = await fetch(url_api, requestOptions)
                .then(response => response.json())
                .then((body) => {
                    this.props.onDismiss(body)



                }).catch(e =>{
                    this.props.onDismiss(e.message)
                })


    }
    checkifValid()
    {
        var dueDateUnix = moment(this.fixDueDate(this.state.dueDate)).unix()
        var startDateUnix = moment(this.state.start).unix()
        //console.log(dueDateUnix, startDateUnix)
        if (startDateUnix > dueDateUnix) {
            if (this.state.start.toString().trim() != "" && varNotEmpty(this.state.start) && this.state.dueDate.toString().trim() != "" && varNotEmpty(this.state.dueDate)) {
                toast.error(this.i18next.t("ERROR_ENDDATE_SMALLER_THAN_START"))

                return false
            }

        }
        if(varNotEmpty(this.state.calendar_id)==false || (varNotEmpty(this.state.calendar_id) && this.state.calendar_id.toString().trim()==""))
        {
            toast.error(this.i18next.t("ERROR_PICK_A_CALENDAR"))
            return false
        }

        if(varNotEmpty(this.state.rrule) && RRuleHelper.isValidObject(this.state.rrule))
        {
            if(varNotEmpty(this.state.start) ==false || (varNotEmpty(this.state.start) && this.state.start.toString().trim()==""))
            {
                toast.error(this.i18next.t("ERROR_START_DATE_REQUIRED_FOR_RECCURENCE"))
                return false
    
            }
        }
        return true
    }

    fixDueDate(){
        var dueDate=""
        var dueDateUnix = moment(this.state.dueDate, 'D/M/YYYY H:mm').unix() * 1000;
        dueDate = moment(dueDateUnix).format('YYYYMMDD');
        dueDate += "T" + moment(dueDateUnix).format('HHmmss');

        return dueDate
    }
    async saveTask() {
        var recurrences = null
        if(this.state.isRepeatingTask == true )
        {
            recurrences = _.cloneDeep(this.state.repeatInfo.newRecurrence)

            recurrences[this.state.nextUpRepeatingInstance]=this.state.repeatInfo.newObj[this.state.nextUpRepeatingInstance]

            if(varNotEmpty(recurrences[this.state.nextUpRepeatingInstance]["recurrenceid"])==false || (varNotEmpty(recurrences[this.state.nextUpRepeatingInstance]["recurrenceid"]) && recurrences[this.state.nextUpRepeatingInstance]["recurrenceid"]==""))
            {
                recurrences[this.state.nextUpRepeatingInstance]["recurrenceid"]=getISO8601Date(this.state.nextUpRepeatingInstance)
            }
        }
        // console.log(recurrences)


            if (varNotEmpty(this.state.summary) && this.state.summary.trim() != "") {
                var dueDate = ""
                if (this.state.dueDate != null && this.state.dueDate != "") {
                    dueDate= this.fixDueDate()
                }
    
            //console.log(startDateUnix, dueDateUnix, dueDateUnix - startDateUnix)
            var valid = this.checkifValid()
            if (valid) {
                this.setState({ saveButton: <Loading /> })
                var todoData = { due: dueDate, start: this.state.start, summary: this.state.summary, created: this.props.data.created, completion: this.state.completion, completed: this.state.completed, status: this.state.status, uid: this.props.data.uid, categories: this.state.category, priority: this.state.priority, relatedto: this.state.relatedto, lastmodified: "", dtstamp: this.props.data.dtstamp, description: this.state.description, rrule: this.state.rrule, recurrences: recurrences}

                var oldUnparsedData = null
                if(varNotEmpty(this.state.todoList) && Array.isArray(this.state.todoList) && this.state.todoList.length>3 && varNotEmpty(this.props.data.uid) && varNotEmpty(this.state.todoList[2][this.props.data.uid]) && varNotEmpty(this.state.todoList[2][this.props.data.uid].data))
                {
                    oldUnparsedData=this.state.todoList[2][this.props.data.uid].data
                }
                //console.log(this.state.todoList[2][this.props.data.uid].data)
                var finalTodoData = await generateNewTaskObject(todoData, this.props.data, oldUnparsedData)
                //console.log(finalTodoData)


                var todo = new VTodoGenerator(finalTodoData, {strict: false})
                
                //console.log(todo, finalTodoData)
                var finalVTODO = todo.generate()
                // console.log("Final Generated TODO:", finalVTODO, todoData )
                var etag = getRandomString(32)
                if (this.props.data.url_internal == null || this.props.data.url_internal == "") {
                  var resultsofPost= await this.postNewTodo(this.state.calendar_id, finalVTODO, etag, this.processResult)

                }
                else {
                   var resultofEdit  = await this.updateTodo(this.state.calendar_id,this.props.data.url_internal, this.props.data.etag, finalVTODO)
                }

            } 

        } else {
            toast.error(this.i18next.t("CANT_CREATE_EMPTY_TASK"))
        }
    
        
    }

    async updateRepeatingTask()
    {

    }
    processResult(result) {
        this.props.onDismiss()
    }

    async postNewTodo(calendar_id, data, etag) {
        const url_api = getAPIURL() + "v2/calendars/todo/add"

        if(!this.state.calendarData){
            toast.error(this.i18next.t("ERROR_GENERIC"))
            console.error("this.state.calendarData", this.state.calendarData)
            console.error("this.state.calendar_id",this.state.calendar_id)
            return null
        }
        const authorisationData = await getAuthenticationHeadersforUser()
        var updated = Math.floor(Date.now() / 1000)
        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({ "etag": etag, "data": data, "type": "VTODO", "updated": updated, "calendar_id": calendar_id, "caldav_accounts_id":this.state.caldav_accounts_id, ctag:this.state.calendarData["ctag"], syncToken:this.state.calendarData["syncToken"], url:this.state.calendarData["url"] }),
            mode: 'cors',
            headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        }
        
            const response = await fetch(url_api, requestOptions)
                .then(response => response.json())
                .then((body) => {
                    if(body && body.success){
                        //Task was published to CalDAV. We will save it in dexie.
                        if(body.data && body.data.message && body.data.details){
                            if(isValidResultArray(body.data.details)){
                                const newEvent = body.data.details[0]

                                console.log("newEvent", newEvent)
                                saveEventToDexie(calendar_id, newEvent["url"], newEvent["etag"],newEvent["data"],"VTODO").then((response)=>{
                                    this.props.onDismiss(body)

                                })
                            }
                        }
                    }else{

                        this.props.onDismiss(body)
                    }



                }).catch (e => {
                    console.log("postNewTodo",e)
                    this.props.onDismiss(e.message)
                })
    }
    async updateTodo(calendar_id, url, etag, data) {
        const url_api = getAPIURL() + "v2/calendars/todo/modify"

        const authorisationData = await getAuthenticationHeadersforUser()
        var updated = Math.floor(Date.now() / 1000)
        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({ "etag": etag, "data": data, "type": "VTODO", "updated": updated, "calendar_id": calendar_id, url: url, deleted: "", caldav_accounts_id: this.state.caldav_accounts_id }),
            mode: 'cors',
            headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        }
     
            const response = await fetch(url_api, requestOptions)
                .then(response => response.json())
                .then((body) => {
                    // console.log("response Edit", body)
                    if(body && body.success){
                    }
                    this.props.onDismiss(body)


                }).catch (e => {
                    console.error("TaskEditor: updateTodo ", e)
                    this.props.onDismiss(getErrorResponse(e))

                })

    }
    onParentSelect(uid) {
        this.setState(function(previousState, currentProps) {
            var newRelatedTo = _.cloneDeep(previousState.relatedto)
            newRelatedTo = VTODO.addParentToRelatedTo(uid, newRelatedTo)
            return({ relatedto: newRelatedTo })

        })
    }
    onRruleSet(rrule)
    {
        var newRRULE = RRuleHelper.parseObject(rrule)
        this.setState({rrule: newRRULE})
    }

   render() {
        var parentTask = ""
        var parentID = VTODO.getParentIDFromRelatedTo(this.state.relatedto)
        if (varNotEmpty(parentID) && parentID!="" && this.state.todoList!=undefined && this.state.todoList.length>1) {
            parentTask = (
                <div >
                    <Row style={{ justifyContent: 'center', display: 'flex', alignItems: "center", }}>
                        <Col>
                            <p>{this.state.todoList[1][parentID].todo.summary}</p>
                        </Col>
                        <Col>
                            <p style={{ textAlign: "right", color: "red" }}><AiOutlineDelete onClick={this.removeParentClicked} /></p>
                        </Col>
                    </Row>
                </div>)
        } else {
            parentTask = (<ParentTaskSearch currentID={this.props.data.uid} onParentSelect={this.onParentSelect} calendar_id={this.state.calendar_id} data={this.state.todoList} />)
        }

        var dueDate = (<Datetime value={this.state.dueDate} onChange={this.dueDateChanged} dateFormat="D/M/YYYY" timeFormat="HH:mm" closeOnSelect={true} />)

        var repeatInfoMessage = null
        if(this.state.isRepeatingTask)
        {
            //Repeating Task
            if(varNotEmpty(this.state.repeatInfo) && varNotEmpty(this.state.repeatInfo.newObj[this.state.nextUpRepeatingInstance]))
            {
                //console.log("this.state.repeatInfo.newObj[this.state.nextUpRepeatingInstance].due", this.state.repeatInfo.newObj[this.state.nextUpRepeatingInstance].due)

                dueDate=(<p>{moment(this.state.repeatInfo.newObj[this.state.nextUpRepeatingInstance].due).format("DD/MM/YYYY HH:mm")}</p>)
                
            }

            repeatInfoMessage =( <Alert  variant="warning">{this.i18next.t("REPEAT_TASK_MESSAGE")+this.state.nextUpRepeatingInstance}</Alert>)
        }

        return (
            <div key={this.props.data.uid}>
                <Row style={{ marginBottom: 10, }}>
                    <Col>
                        <Form.Check
                            label="Task Done?"
                            inline={true}
                            style={{ zoom: 1.5 }}
                            checked={this.state.taskDone}
                            onChange={this.taskCheckBoxClicked}
                        />
                    </Col>
                </Row>
                <h4>Task Summary</h4>
                <div style={{ marginBottom: 10 }}><Form.Control onChange={this.taskSummaryChanged} autoFocus={true} value={this.state.summary} placeholder="Enter a summary" /></div>
                {repeatInfoMessage}
                <h4>Calendar</h4>
                <div style={{ marginBottom: 10 }}>{this.state.calendarOptions}</div>

                <h4>Parent Task</h4>
                <div style={{ marginBottom: 10 }}>{parentTask}</div>

                <h4>Start Date</h4>
                <div style={{ marginBottom: 10 }}><Datetime value={this.state.start} onChange={this.startDateChange} dateFormat="D/M/YYYY" timeFormat="HH:mm" /></div>


                <h4>Due Date</h4>
                <Row style={{ marginBottom: 10 }}>
                    {dueDate}
                </Row>

                <h4>Labels</h4>
                <div style={{ marginBottom: 10 }}>
                    {this.state.labels}
                </div>
                <h4>{this.i18next.t("STATUS")}</h4>
                <div style={{ marginBottom: 10 }}>
                    {this.getStatusDropdown()}
                </div>
                <h4>Priority</h4>
                <div style={{ marginBottom: 10 }}>
                    <Form.Select onChange={this.priorityChanged} value={this.state.priority} >
                        <option value="0"></option>
                        <optgroup key="High" label="High">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </optgroup>
                        <optgroup key="Medium" label="Medium">
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                        </optgroup>
                        <optgroup key="Low" label="Low">
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                        </optgroup>

                    </Form.Select>
                </div>
                <h4>Completion</h4>
                <div>{this.state.completion}%</div>
                <Form.Range onChange={this.completionChanged} value={this.state.completion} />
                <h4>Notes</h4>
                <Form.Control as="textarea" onChange={this.descriptionChanged} value={this.state.description} placeholder="Enter your notes here." />
                <br />
                <Recurrence onRruleSet={this.onRruleSet} rrule={this.state.rrule} />
                <div style={{ marginTop: 40, textAlign: "center" }}>
                    {this.state.saveButton}
                </div>
                {this.state.deleteTaskButton}
                <TaskDeleteConfirmation
                    show={this.state.showTaskDeleteModal}
                    onHide={this.onDismissDeleteDialog}
                    onDismissDeleteDialog={this.onDismissDeleteDialog}
                    onDeleteOK={this.deleteTheTaskFromServer}

                />
                <br />
                <br />
                <p style={{textAlign: "center"}}><b>{this.i18next.t('LAST_MODIFIED')+": "}</b>{moment(this.props.data.lastmodified).format(getStandardDateFormat())}</p>
                <br />
                <br />

            </div>

        )
    }
}