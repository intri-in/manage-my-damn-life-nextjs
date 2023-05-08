import { dueDatetoUnixStamp, getI18nObject, timeDifferencefromNowinWords, timeDifferencefromNowinWords_Generic } from "@/helpers/frontend/general";
import { Component, useRef } from "react";
import { AiOutlineStar, AiFillStar } from 'react-icons/ai'
import { FcCollapse, FcExpand } from 'react-icons/fc'
import { categoryArrayHasMyDayLabel, getLabelColourFromDB, getLabelsFromServer, labelIndexInCookie, removeMyDayLabelFromArray, saveLabeltoDB } from "@/helpers/frontend/labels";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { Badge, Col, OverlayTrigger, Row } from "react-bootstrap";
import { debugging, isValidResultArray, varNotEmpty } from "@/helpers/general";
import Offcanvas from 'react-bootstrap/Offcanvas';
import TaskEditor from "./TaskEditor";
import Modal from 'react-bootstrap/Modal';
import { TaskEditorExitModal } from "./TaskEditorExitModal";
import { toast } from "react-toastify";
import { TaskDeleteConfirmation } from "./TaskDeleteConfirmation";
import { ContextMenuTrigger, ContextMenu, ContextMenuItem } from 'rctx-contextmenu';
import { RightclickContextMenu } from "./RightclickContextMenu";
import { MYDAY_LABEL } from "@/config/constants";
import Draggable from 'react-draggable';
import { updateTodo } from "@/helpers/frontend/tasks";
import { getLabelArrayFromCookie, saveLabelArrayToCookie } from "@/helpers/frontend/settings";
import { RRuleHelper } from "@/helpers/frontend/classes/RRuleHelper";
import { MdRepeatOn, MdRepeatOne, MdSpeakerNotes } from "react-icons/md";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import RruleServerHelper from "@/helpers/frontend/classes/RruleServerHelper";
import moment from "moment";
import { VTODO } from "@/helpers/frontend/classes/VTODO";
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import SimpleOverlay from "../bootstrap/SimpleOverlay";
import { RecurrenceHelper } from "@/helpers/frontend/classes/RecurrenceHelper";
import VTodoGenerator from "@/external/VTODOGenerator";
export default class TaskUI extends Component {

    constructor(props) {

        super(props)
        if (this.props.data != null) {
            var data = JSON.parse(JSON.stringify(this.props.data))
        }
        else {
            data = {}
        }
        var taskChecked = false
        if ((varNotEmpty(props.data.completed) && props.data.completed != "") || (varNotEmpty(props.data.status) && props.data.status == "COMPLETED")) {
            taskChecked = true
        }
        data.taskDone = taskChecked
        this.i18next = getI18nObject()
        this.taskObj = new VTODO(props.unparsedData[props.data.uid].data, true)
        //console.log("props.data", props.data)
        //console.log(this.taskObj)
        this.state = { labelColours: {}, labelArray: [], labelNames: [], showTaskEditor: false, taskEditor: null, taskDataChanged: false, showTaskEditModal: false, showTaskDeleteModal: false, data: data, taskTitle: this.props.title, parentTitle: "", toastPlaceHolder: null, showSubtaskEditor: false, subtaskData: {}, collapseButton: "", isCollapsed: props.collapsed, taskChecked: taskChecked, repeatingTask: false, repeatInfo: [] }
        this.taskClicked = this.taskClicked.bind(this)
        this.taskEditorClosed = this.taskEditorClosed.bind(this)
        this.taskDataChanged = this.taskDataChanged.bind(this)
        this.taskEditModalDismissed = this.taskEditModalDismissed.bind(this)
        this.taskEditModalDiscardChanges = this.taskEditModalDiscardChanges.bind(this)
        this.onAddSubtask = this.onAddSubtask.bind(this)
        this.checkBoxClicked = this.checkBoxClicked.bind(this)
        this.onTaskSubmittoServer = this.onTaskSubmittoServer.bind(this)
        this.clearCheckMarkState = this.clearCheckMarkState.bind(this)
        this.onAddtoMyday = this.onAddtoMyday.bind(this)
        this.subTaskEditorClosed = this.subTaskEditorClosed.bind(this)
        this.onSubtaskSubmittoServer = this.onSubtaskSubmittoServer.bind(this)
        this.removeFromMyDay = this.removeFromMyDay.bind(this)
        this.collapseButtonClicked = this.collapseButtonClicked.bind(this)
        this.priorityStarClicked = this.priorityStarClicked.bind(this)
        this.onEditTask = this.onEditTask.bind(this)
        this.isRepeatingTask = this.isRepeatingTask.bind(this)
    }

    async componentDidMount() {
        this.generateInitialLabelList()
        this.isRepeatingTask()
        if (this.props.todoList != null && this.props.data.relatedto != null && this.props.data.relatedto != "" && this.props.level == 0) {
            var parentID = this.taskObj.getParent()
            if(varNotEmpty(parentID) && parentID!="")
            {
                var newTaskTitle = (<div><span style={{ color: "gray" }}>{this.props.todoList[1][this.taskObj.getParent()].todo.summary + " > "}</span>  {this.props.title}</div>)
                this.setState({ taskTitle: newTaskTitle })
    
            }
        }
        var collapseButton = null
        if (this.props.hasChildren != null && this.props.hasChildren == true) {
            if (this.state.isCollapsed == true) {
                this.setState({ collapseButton: <FcExpand value={this.props.data.uid} key={this.props.data.uid} id={this.props.data.uid} onClick={this.collapseButtonClicked} /> })

            } else {
                this.setState({ collapseButton: <FcCollapse value={this.props.data.uid} key={this.props.data.uid} id={this.props.data.uid} onClick={this.collapseButtonClicked} /> })

            }
        }
    }
    async isRepeatingTask() {
        if (varNotEmpty(this.state.data.rrule) && this.state.data.rrule != "") {
            var recurrenceObj = new RecurrenceHelper(this.state.data)
            this.setState({ repeatingTask: true, repeatInfo: recurrenceObj })

            /*
            var rruleServerHelperObject = new RruleServerHelper(this.state.data.start, this.state.data.rrule)

            var responseBody = await RruleServerHelper.getRepeatRuleFromServer(this.props.data["calendar_events_id"])

            if (varNotEmpty(responseBody) && varNotEmpty(responseBody.success) && responseBody.success == true) {
                var message = getMessageFromAPIResponse(responseBody)
                if (varNotEmpty(message) && message != "" && message != {} && message!=[]) {
                    this.setState({ repeatInfo: JSON.parse(message) })
                }
                else {
                    //No data on server. Generate and make a request to add to server.

                    const postResult = await RruleServerHelper.postRepeatRule(this.props.data["calendar_events_id"],JSON.stringify(rruleServerHelperObject.serverObj))
                    this.setState({ repeatInfo: rruleServerHelperObject.serverObj})

                }
            }
            */
        
        }
    }

    priorityStarClicked() {
        var newData = this.state.data
        newData.priority = "1"

        this.setState({ data: newData, showTaskEditor: true, taskDataChanged: true })
    }
    collapseButtonClicked(e) {

        this.setState(function (previousState, currentProps) {
            return ({
                isCollapsed: !previousState.isCollapsed
            })
        })
        this.props.collapseButtonClicked(e.target.id)


    }
    componentDidUpdate(prevProps, prevState) {

        if (this.props.collapsed !== prevProps.collapsed) {
            if (debugging()) console.log("this.props.`isCollapsed`", this.props.isCollapsed)
            if (this.props.isCollapsed == true) {
                this.setState({ collapseButton: <FcExpand value={this.props.data.uid} key={this.props.data.uid} id={this.props.data.uid} onClick={this.collapseButtonClicked} /> })

            } else {
                this.setState({ collapseButton: <FcCollapse value={this.props.data.uid} key={this.props.data.uid} id={this.props.data.uid} onClick={this.collapseButtonClicked} /> })

            }

        }


    }

    onAddSubtask(input) {
        this.setState({ showSubtaskEditor: true, taskEditor: null, subtaskData: { relatedto: input, calendar_id: this.props.data.calendar_id, isSubtask: true } })
    }
    onEditTask() {
        this.setState({ showTaskEditor: true, })

    }
    async onAddtoMyday(input) {
        // first check if the task already has label for my day.
        var newDataArray = _.cloneDeep(this.state.data)
        //change Rrule to RruleObject
        if(varNotEmpty(this.state.data.rrule) && this.state.data.rrule!="")
        {
            newDataArray["rrule"]= RRuleHelper.rruleToObject(newDataArray.rrule)
        }
/*         console.log(newDataArray)
        var todo = new VTodoGenerator(newDataArray)
        console.log(todo.generate())
 */
        if (this.state.data.category != null && Array.isArray(this.state.data.category)) {
            var found = false

            for (const i in this.state.data.category) {
                if (this.state.data.category[i] == MYDAY_LABEL) {
                    found = true
                }
            }
            console.log("this.state.data.url_internal", this.state.data.url_internal)

            if (found == false) {
                newDataArray["categories"] = newDataArray.category
                newDataArray.categories.push(MYDAY_LABEL)
                //console.log(this.state.data)
                //this.setState({data: newDataArray, showTaskEditor: true, })
                var body = await updateTodo(this.state.data.calendar_id, this.state.data.url_internal, this.state.data.etag, newDataArray)
                this.onTaskSubmittoServer(body)
                //console.log(newDataArray)


            }
            else {
                toast.info(this.i18next.t("TASK_ALREADY_IN_MY_DAY'"))
            }


        }
        else {
            newDataArray.categories = []
            newDataArray.categories.push(MYDAY_LABEL)
            //console.log(newDataArray)
            console.log(newDataArray)
            var todo = new VTodoGenerator(newDataArray)
            console.log(todo.generate())
    
            //this.setState({data: newDataArray, showTaskEditor: true, })
            var body = await updateTodo(this.state.data.calendar_id, this.state.data.url_internal, this.state.data.etag, newDataArray)
            this.onTaskSubmittoServer(body)


        }
    }

    async removeFromMyDay() {
        if (this.state.data.category != null && Array.isArray(this.state.data.category)) {

            if (categoryArrayHasMyDayLabel(this.state.data.category)) {
                var newCategoryArray = removeMyDayLabelFromArray(this.state.data.category)
                var newData = _.cloneDeep(this.state.data)
                newData.categories = newCategoryArray
                if(varNotEmpty(this.state.data.rrule) && this.state.data.rrule!="")
                {
                    newData["rrule"]= RRuleHelper.rruleToObject(newData.rrule)
                }
        
                //this.setState({data: newData, showTaskEditor: true})
                var body = await updateTodo(this.props.data.calendar_id, this.props.data.url_internal, this.props.data.etag, newData)
                this.onTaskSubmittoServer(body)

            }

        }
    }
    taskClicked() {
        //var taskEditor=( )

        this.setState({ showTaskEditor: true, taskEditor: null })
    }
    scheduleItem(id) {

    }
    subTaskEditorClosed() {
        this.setState({ showSubtaskEditor: false })

    }
    checkBoxClicked() {

        
        this.setState(function (previousState, currentProps) {

            var newData = JSON.parse(JSON.stringify(previousState.data))

            var taskChecked = false
            if (varNotEmpty(currentProps.data.completed) && currentProps.data.completed != "" || (varNotEmpty(currentProps.data.status) && currentProps.data.status == "COMPLETED")) {
                taskChecked = true
            }
            newData.taskDone = !taskChecked
            return {
                data: newData,
                taskChecked: !previousState.taskChecked,
                taskDataChanged: true
            };
        }
        )


        this.taskClicked()
    }
    taskEditorClosed() {
        this.clearCheckMarkState()

        if (this.state.taskDataChanged == false) {
            this.setState({ showTaskEditor: false, taskEditor: null, })

        }
        else {
            this.setState({ showTaskEditModal: true })

        }

    }
    taskEditModalDismissed() {
        this.setState({ showTaskEditModal: false })
        this.clearCheckMarkState()
    }
    taskEditModalDiscardChanges() {
        this.clearCheckMarkState()
        this.setState({ showTaskEditModal: false, showTaskEditor: false, })
        this.isRepeatingTask()
        /*this.setState(function(previousState, currentProps) {
            return(
            {
                taskChecked: !previousState.taskChecked
            })
        }) */
    }
    onTaskSubmittoServer(body) {
        this.setState({ showTaskEditModal: false, showTaskEditor: false })

        if (body != null) {
            if (body.success == true) {
                toast.success(this.i18next.t(body.data.message))
                this.props.fetchEvents(body.data.refresh)
            }
            else {
                toast.error(this.i18next.t(body.data.message))

            }
        }
        else {
            toast.error(this.i18next.t("ERROR_GENERIC"))

        }
    }
    onSubtaskSubmittoServer(body) {
        this.setState({ showSubtaskEditor: false })


        if (body != null) {
            if (body.success == true) {
                toast.success(this.i18next.t("EVENT_SUBMIT_OK"))

                this.props.fetchEvents()

            }
            else {
                toast.error(this.i18next.t(body.data.message))

            }
        }
        else {
            toast.error(body)

        }
    }
    clearCheckMarkState() {



        this.setState(function (previousState, currentProps) {
            var taskChecked = false

            var newData = previousState.data
            if (varNotEmpty(currentProps.data.completed) && currentProps.data.completed != "" || (varNotEmpty(currentProps.data.status) && currentProps.data.status == "COMPLETED")) {
                taskChecked = true
            }
            newData.taskDone = taskChecked

            // console.log(currentProps.data)

            return ({
                data: newData,
                taskChecked: taskChecked
            })
        })


    }
    generateInitialLabelList() {
        var labelArray = []
        var labelColour = "black"
        var labelArrayFromCookie = getLabelArrayFromCookie()
        if (varNotEmpty(this.props.labels) && isValidResultArray(this.props.labels)) {

            if (isValidResultArray(labelArrayFromCookie)) {
                var notFound = 0
                for (const i in this.props.labels) {
                    labelColour = "black"
                    var labelIndex = labelIndexInCookie(this.props.labels[i])
                    if (labelIndex != -1) {
                        labelColour = labelArrayFromCookie[labelIndex].colour
                        //console.log(labelColour)
                    } else {
                        //console.log("notfound:", this.props.labels[i])
                        notFound += 1
                    }
                    labelArray.push(<span key={"labels" + i} className="badge rounded-pill textDefault" style={{ marginLeft: 3, marginRight: 3, padding: 3, backgroundColor: labelColour, color: "white" }}>{this.props.labels[i]}</span>)
                }

                if (notFound > 0) {
                    this.getLabelsInfoFromServer()

                }
                this.setState({ labelArray: labelArray, labelNames: this.props.labels })

            } else {
                this.getLabelsInfoFromServer()

            }


        }


    }
    async getLabelsInfoFromServer() {
        var labelArray = []
        if (this.props.labels != undefined && this.props.labels != null) {

            for (let i = 0; i < this.props.labels.length; i++) {

                var labels = await getLabelsFromServer()
                var labelColour = ""
                if (isValidResultArray(labels)) {
                    for (let j = 0; j < labels.length; j++) {
                        if (labels[j].name == this.props.labels[i]) {
                            labelColour = labels[j].colour
                        }
                    }
                }


                labelArray.push(<span key={"labels" + i} className="badge rounded-pill textDefault" style={{ marginLeft: 3, marginRight: 3, padding: 3, backgroundColor: labelColour, color: "white" }}>{this.props.labels[i]}</span>)




                //labelArray.push(<button style={{marginLeft: 5, marginLeft: 5}} type="button" className="btn btn-outline-dark">{this.props.labels[i]}</button>)
                // labelArray.push(<p id={i} style={{marginLeft: 5, marginRight: 5, color: this.state.labelColours[this.props.labels[i]]}} className="badge rounded-pill bg-info">{this.props.labels[i]}</p>)
            }
        }

        this.setState({ labelArray: labelArray, labelNames: this.props.labels })


    }
    taskDataChanged() {
        this.setState({ taskDataChanged: true })
    }

    render() {

        var priorityColor = ""

        var timeDifferenceinWords = timeDifferencefromNowinWords(this.props.dueDate)
        
        var dueDateColor = "green"
        if (this.props.dueDate != null) {
            var timeDifference = Math.floor((dueDatetoUnixStamp(this.props.dueDate) - Math.floor(Date.now() / 1000)) / 86400)
            if (timeDifference < 0) {
                dueDateColor = 'red'
            }

        }
        var dueDateText = ""

        if(this.state.repeatingTask==true)
        {
            if(varNotEmpty(this.state.data.recurrences))
            {
                var recurrenceObj = new RecurrenceHelper(this.state.data)
                var newDueDate = recurrenceObj.getNextDueDate()
                timeDifferenceinWords= timeDifferencefromNowinWords_Generic( newDueDate)
                dueDateText = moment(newDueDate).format("DD/MM/YYYY HH:mm")+ " " + timeDifferenceinWords
            }

        }else{
            dueDateText = this.props.dueDate + " " + timeDifferenceinWords
           
    
        }
        if (window != undefined) {
            // window.addEventListener('resize', this.updateDimensions);

            if (window.innerWidth < 900) {
                dueDateText = timeDifferenceinWords
            }
        }
        var priorityStar = (<AiOutlineStar color={priorityColor} size={12} />)
        if (this.props.priority != null) {
            if (this.props.priority < 3 && this.props.priority > 0) {
                priorityColor = "red"
                priorityStar = (<AiFillStar color={priorityColor} size={12} />)
            }
            else if (this.props.priority < 7 && this.props.priority > 0) {
                priorityColor = "gold"
                priorityStar = (
                    <AiFillStar color={priorityColor} size={12} />)
            }
            else {
                priorityStar = (
                    <AiOutlineStar color={priorityColor} size={12} />
                )
            }
        }
        priorityStar = (<div onClick={this.priorityStarClicked} style={{ padding: 0, verticalAlign: 'middle', textAlign: 'center' }} className="col-1">{priorityStar}</div>)
        var progressBar = null
        if (this.props.completion != null && this.props.completion != 0) {
            progressBar = (
                <Row>
                    <Col>
                        <ProgressBar style={{ height: 5 }} now={this.props.completion} variant="secondary" />
                    </Col>
                </Row>

            )
        }
        else {
            progressBar = (<Row>
                <Col></Col>
            </Row>)
        }


        var marginLevel = this.props.level * 30 + 20
        var borderLeft = "1px solid  gray"
        if (this.props.listColor != null && this.props.listColor != "") {
            borderLeft = "10px solid " + this.props.listColor
        }

        var repeatingTaskIcon = null

        if (this.state.repeatingTask == true) {
            repeatingTaskIcon = <MdRepeatOne size={16} />
        }
        var hasDescriptionIcon = null
        if (varNotEmpty(this.state.data.description) && this.state.data.description.toString().trim() != "") {
        hasDescriptionIcon = (        <MdSpeakerNotes  />)

        }

        return (
            <div>
                <ContextMenuTrigger id={this.state.data.uid} >
                    <div style={{ marginLeft: marginLevel, marginRight: 20, }}>
                        <div style={{ border: '1px solid  gray', borderLeft: borderLeft, borderRadius: 20, padding: 5, justifyContent: 'center', display: 'flex', lineHeight: '12px', }} className="row">
                            <div style={{ justifyContent: 'center', display: 'flex', }} className="col-1">
                                <input onChange={this.checkBoxClicked} className="" type="checkbox" checked={this.state.taskChecked} />
                            </div>
                            <div onClick={this.taskClicked} style={{ justifyContent: 'center', alignItems: 'center', verticalAlign: 'middle', padding: 0 }} className="col-8">
                                <div className="row">
                                    <div className="col-9" style={{}}>
                                        <div className="textDefault"><span style={{ textOverflow: "ellipsis" }}>{this.state.taskTitle} {this.state.labelArray}</span> </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="defaultText" style={{ color: dueDateColor, fontSize: 10 }}>{dueDateText}</div>
                                    </div>
                                </div>
                                {progressBar}

                            </div>
                            <div  className="col-1">
                                {repeatingTaskIcon} {hasDescriptionIcon}
                            </div>

                            <div style={{ padding: 0, position: 'relative', verticalAlign: 'middle', textAlign: 'right', }} className="col-1">
                                <div className="row">
                                    <div className="col">
                                        {this.state.collapseButton}
                                    </div>
                                </div>
                            </div>
                            {priorityStar}
                        </div>
                    </div>
                    <Offcanvas placement='end' show={this.state.showTaskEditor} onHide={this.taskEditorClosed}>
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Edit Task</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <TaskEditor repeatInfo={this.state.repeatInfo} onDismiss={this.onTaskSubmittoServer} onChange={this.taskDataChanged} todoList={this.props.todoList} unparsedData={this.props.unparsedData} data={this.state.data} />
                        </Offcanvas.Body>
                    </Offcanvas>
                    <Offcanvas placement='end' show={this.state.showSubtaskEditor} onHide={this.subTaskEditorClosed}>
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Edit Subtask</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <TaskEditor onDismiss={this.onSubtaskSubmittoServer} onChange={this.taskDataChanged} todoList={this.props.todoList} unparsedData={this.props.unparsedData} data={this.state.subtaskData} />
                        </Offcanvas.Body>
                    </Offcanvas>

                    <TaskEditorExitModal
                        show={this.state.showTaskEditModal}
                        onHide={this.taskEditModalDismissed}
                        onDiscardTaskChanges={this.taskEditModalDiscardChanges}
                    />
                    {this.state.toastPlaceHolder}
                </ContextMenuTrigger>
                <RightclickContextMenu scheduleItem={this.props.scheduleItem} onEditTask={this.onEditTask} onAddSubtask={this.onAddSubtask} onAddtoMyday={this.onAddtoMyday} id={this.state.data.uid} removeFromMyDay={this.removeFromMyDay} category={this.state.data.category} data={this.state.data} />
            </div>
        )
    }
}