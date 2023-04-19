import { Component } from "react";
import { Row, Col } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { MdOutlineAddCircle } from "react-icons/md";
import Button from 'react-bootstrap/Button';
import { SECONDARY_COLOUR } from "@/config/style";
import { TaskEditorExitModal } from "../tasks/TaskEditorExitModal";
import Offcanvas from 'react-bootstrap/Offcanvas';
import TaskEditor from "../tasks/TaskEditor";
import { toast } from "react-toastify";
import { Toastify } from "../Generic";
import { fetchLatestEvents, fetchLatestEventsWithoutCalendarRefresh } from "@/helpers/frontend/sync";
import { getI18nObject } from "@/helpers/frontend/general";

export default class AddTask extends Component{
    constructor(props)
    {
        super(props)
        this.i18next = getI18nObject()
        this.state={newTaskSummary: "", showTaskEditor: false, showTaskEditModal: false, data:{}, taskDataChanged: false, calendar_id: props.calendars_id}
        this.addTask = this.addTask.bind(this)
        this.taskDataChanged = this.taskDataChanged.bind(this)
        this.taskEditorClosed = this.taskEditorClosed.bind(this)
        this.taskSummaryChanged = this.taskSummaryChanged.bind(this)
        this.taskEditModalDiscardChanges = this.taskEditModalDiscardChanges.bind(this)
        this.taskEditModalDismissed = this.taskEditModalDismissed.bind(this)
        this.taskEditorDismissed = this.taskEditorDismissed.bind(this)
        this.refreshDataWithNewCalendarID = this.refreshDataWithNewCalendarID.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)

    }
    componentDidMount()
    {
        this.refreshDataWithNewCalendarID()
        
    }
    componentDidUpdate(prevProps, prevState) {

        if (this.props.calendars_id !== prevProps.calendars_id) {
            this.refreshDataWithNewCalendarID()
            
        }


    }


    refreshDataWithNewCalendarID()
    {
        if(this.props.calendars_id!=null&&this.props.calendars_id!="")
        {
            this.setState(function(previousState, currentProps) {

                var newData = previousState.data
                newData["calendar_id"]=this.props.calendars_id
                return({data: newData, calendar_id:this.props.calendars_id})
            })
        }
        
    }
    async taskEditorDismissed(body)
    {
        this.setState({showTaskEditor: false, taskDataChanged: false, } )
        this.setState(function(previousState, currentProps) {

            var newData= previousState.data
            newData["summary"]=''
            return({newTaskSummary: '', data:newData}
                )
        })

        if(body!=null)
        {
            if(body.success==true)
            {
                toast.success(this.i18next.t("INSERT_OK"))
                //fetchLatestEventsWithoutCalendarRefresh()
                this.props.onSuccessAddTask()

            }
            else{
                if(body.data!=null)
                {
                    toast.error("Error. Check logs")
                }
                

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

            var newData= previousState.data
            newData["summary"]=''
            return({newTaskSummary: '', data:newData}
                )
        })


    }

    taskSummaryChanged(e)
    {
        this.setState(function(previousState, currentProps) {

            var newData= previousState.data
            newData["summary"]=e.target.value
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

                var newData= previousState.data
                newData["summary"]=''
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
            <Row style={{padding: 20, textAlign:"center", borderBottom:borderColor}}>
            <Col xs={10}> 
                    <Form.Control value={this.state.newTaskSummary} onChange={this.taskSummaryChanged} onKeyDown={this.onKeyDown} type="text" placeholder="Add a task" />
                </Col>
            <Col xs={2}><Button onClick={this.addTask}>Add</Button></Col>
            </Row>
            <Offcanvas placement='end' show={this.state.showTaskEditor} onHide={this.taskEditorClosed}>
                <Offcanvas.Header closeButton>
                     <Offcanvas.Title>Edit Task</Offcanvas.Title>
                </Offcanvas.Header>
                    <Offcanvas.Body>
                        <TaskEditor onChange={this.taskDataChanged} onDismiss={this.taskEditorDismissed} calendar_id={this.state.calendar_id}  data={this.state.data} />
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