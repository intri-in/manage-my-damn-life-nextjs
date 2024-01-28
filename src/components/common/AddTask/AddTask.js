import { Component } from "react";
import { Row, Col, Badge } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { MdOutlineAddCircle } from "react-icons/md";
import Button from 'react-bootstrap/Button';
import { SECONDARY_COLOUR } from "@/config/style";
import { TaskEditorExitModal } from "../../tasks/TaskEditorExitModal";
import Offcanvas from 'react-bootstrap/Offcanvas';
import TaskEditor from "../../tasks/TaskEditor";
import { toast } from "react-toastify";
import { Toastify } from "../../Generic";
import { fetchLatestEvents, fetchLatestEventsWithoutCalendarRefresh } from "@/helpers/frontend/sync";
import { ISODatetoHumanISO, getI18nObject } from "@/helpers/frontend/general";
import QuickAdd from "@/helpers/frontend/classes/QuickAdd";
import { logError, logVar, varNotEmpty } from "@/helpers/general";
import moment from "moment";
import { APIRequests } from "@/helpers/frontend/classes/APIRequests";
import { getDefaultCalendarID } from "@/helpers/frontend/cookies";
import { withRouter } from "next/router";
import AddInfo from "./AddInfo";
import Stack from 'react-bootstrap/Stack';
import { fetchAllEventsFromDexie } from "@/helpers/frontend/dexie/events_dexie";
class AddTask extends Component{
    constructor(props)
    {
        super(props)
        this.i18next = getI18nObject()
        this.state={newTaskSummary: "", showTaskEditor: false, showTaskEditModal: false, data:{calendar_id: props.calendars_id}, taskDataChanged: false, calendar_id: props.calendars_id, quickAddResults: [], todoList: null}
        this.addTask = this.addTask.bind(this)
        this.taskDataChanged = this.taskDataChanged.bind(this)
        this.taskEditorClosed = this.taskEditorClosed.bind(this)
        this.taskSummaryChanged = this.taskSummaryChanged.bind(this)
        this.taskEditModalDiscardChanges = this.taskEditModalDiscardChanges.bind(this)
        this.taskEditModalDismissed = this.taskEditModalDismissed.bind(this)
        this.taskEditorDismissed = this.taskEditorDismissed.bind(this)
        this.refreshDataWithNewCalendarID = this.refreshDataWithNewCalendarID.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
        this.processQuickAddResults = this.processQuickAddResults.bind(this)

    }
    async componentDidMount()
    {
        this.refreshDataWithNewCalendarID()
        const response = await fetchAllEventsFromDexie()
        if(varNotEmpty(response))
        {
          this.setState({todoList: response})
        }

        if(this.state.calendar_id=="" || this.state.calendar_id==null)
        {
            var calendar = await getDefaultCalendarID()
            this.setState({ calendar_id:  calendar})

        }
    
    
    }

    
    componentDidUpdate(prevProps, prevState) {

        if (this.props.calendars_id !== prevProps.calendars_id || this.props.caldav_accounts_id!=prevProps.caldav_accounts_id) {
            this.setState({calendar_id: this.props.calendars_id, newTaskSummary: ""})
            this.refreshDataWithNewCalendarID(this.props.calendars_id)
            
        }


    }


    refreshDataWithNewCalendarID(calendar_id)
    {
       
        this.setState(function(previousState, currentProps) {

            var newData = _.cloneDeep(previousState.data)
            newData["calendar_id"]=calendar_id
            return({data: newData, calendar_id:calendar_id})
        })
        
        
    }
    async taskEditorDismissed(body)
    {
        this.setState({showTaskEditor: false, taskDataChanged: false, } )
        this.setState(function(previousState, currentProps) {

            var newData= _.cloneDeep(previousState.data)
            newData["summary"]=''
            newData["due"]=""
            newData["category"]=[]
            newData["priority"]=""
            newData["calendar_id"]=_.cloneDeep(this.props.calendars_id)

            this.processQuickAddResults(newData)
            return({newTaskSummary: '', data:newData})
        })

        if(body!=null)
        {
            if(body.success==true)
            {
                toast.success(this.i18next.t("INSERT_OK"))
                //fetchLatestEventsWithoutCalendarRefresh()
                if(varNotEmpty(this.props.onSuccessAddTask))
                {
                    this.props.onSuccessAddTask()

                }

            }
            else{
                if(body.data!=null)
                {
                    toast.error("Error. Check logs")
                }
                logError(body, "AddTask.taskEditorDismissed")

            }
        }
        else
        {
            toast.error(body)

        }

    }
    addTask()
    {
        this.setState({showTaskEditor: true})

    }
    taskDataChanged(e)
    {
        this.setState({taskDataChanged: true})

    }
    taskEditorClosed()
    {
        if(this.state.taskDataChanged==false)
        {
            this.setState({showTaskEditor: false, taskEditor: null})

        }
        else
        {
            this.setState({showTaskEditModal: true})

        }

    }
    taskEditModalDiscardChanges()
    {
        this.setState({showTaskEditModal: false, showTaskEditor:false})
        this.setState(function(previousState, currentProps) {

            var newData= _.cloneDeep(previousState.data)
            newData["summary"]=''
            newData["due"]=""
            newData["category"]=[]
            newData["priority"]=""
            newData["calendar_id"]=this.props.calendars_id

            this.processQuickAddResults(newData)

            return({newTaskSummary: '', data:newData}
                )
        })


    }

    processQuickAddResults(newTask, dueDate)
    {
        var output = []
        if(varNotEmpty(dueDate) && dueDate!="" && dueDate.isValid() && varNotEmpty(dueDate._i) &&dueDate._i!="")
        {
            output.push(<div > <Badge key="QUICK_ADD_DUE" pill bg="warning" text="dark">{this.i18next.t("DUE")+": "+dueDate._i.toString()}</Badge></div>)
        }

        if(varNotEmpty(newTask.label) && newTask.label.length>0)
        {
            var labelNames= ""
            for (const k in newTask.label)
            {
                labelNames+=newTask.label[k]+" "
            }
            labelNames= labelNames.trim()
            output.push(<div > <Badge pill bg="warning" text="dark">{this.i18next.t("LABEL")+": ["+labelNames+"]"}</Badge></div>)
        }

        if(varNotEmpty(newTask.priority) && newTask.priority!="")
        {
            output.push(<div > <Badge key="QUICK_ADD_PRIORITY" pill bg="warning" text="dark">{this.i18next.t("PRIORITY")+": "+newTask.priority}</Badge></div>)

        }

        this.setState({quickAddResults: (<div style={{margin: 5}}>{output}</div>)})
    }
    taskSummaryChanged(e)
    {
        var newTask = QuickAdd.parseSummary(e.target.value)
        var dueDate = null
        try{
            dueDate = moment(newTask.due, 'DD/MM/YYYY H:mm')
        }
        catch(e)
        {
            logVar(e, "taskSummaryChanged, QuickAdd")
        }
        this.processQuickAddResults(newTask, dueDate)

        this.setState(function(previousState, currentProps) {

            var newData= _.cloneDeep(previousState.data)
            newData["summary"]=newTask.summary
            newData["category"]=newTask.label
            newData["priority"]=newTask.priority
            if(dueDate!=null && dueDate.isValid()==true)
            {
                newData["due"]=dueDate
            }
            return({newTaskSummary: e.target.value, data:newData}
                )
        })
    }
    onKeyDown(e)
    {
        if(e.key=="Enter")
        {
            this.setState({showTaskEditor: true})

        }
        if(e.key=="Escape")
        {
            this.setState(function(previousState, currentProps) {

                var newData= _.cloneDeep(previousState.data)
                newData["summary"]=''
                newData["due"]=""
                newData["category"]=[]
                newData["priority"]=""
    
    
                return({newTaskSummary: '', data:newData}
                    )
            })
    
        }

    }
    taskEditModalDismissed()
    {
        this.setState({showTaskEditModal: false})

    }

    render(){
        var borderColor='2px solid '+SECONDARY_COLOUR
        return(
        <>
            <div style={{textAlign:"center", borderBottom:borderColor}}> 
            <Stack gap={1} direction="horizontal" style={{width: "100%", marginTop:10, marginBottom:10}}>
            <div style={{width:"100%"}} sm={7} xs={8} lg={10}> 
                    <Form.Control value={this.state.newTaskSummary} onChange={this.taskSummaryChanged} onKeyDown={this.onKeyDown} type="text" placeholder="Add a task" />
            </div>
            <div className="ms-auto" sm={2} xs={2} lg={1}><AddInfo /></div>
            <div sm={3} xs={2} lg={1}><Button size="sm" onClick={this.addTask}>Add</Button></div>
            </Stack>
            {this.state.quickAddResults}
            </div>
         
            <Offcanvas placement='end' show={this.state.showTaskEditor} onHide={this.taskEditorClosed}>
                <Offcanvas.Header closeButton>
                     <Offcanvas.Title>Edit Task</Offcanvas.Title>
                </Offcanvas.Header>
                    <Offcanvas.Body>
                        <TaskEditor todoList={this.state.todoList} onChange={this.taskDataChanged} onDismiss={this.taskEditorDismissed} newTask={true} calendar_id={this.state.calendar_id}  data={this.state.data} />
                    </Offcanvas.Body>
            </Offcanvas>

            <TaskEditorExitModal
            show={this.state.showTaskEditModal}
            onHide={this.taskEditModalDismissed}
            onDiscardTaskChanges= {this.taskEditModalDiscardChanges}
            /> 
            {this.state.toastPlaceholder}       
        </>
        )
    }
}

export default withRouter(AddTask)