import { Component } from "react";
import { Gantt, Task, EventOption, StylingOption, ViewMode, DisplayOption } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { ISODatetoHuman, ISODatetoHumanISO, getI18nObject } from "@/helpers/frontend/general";
import { getRandomColourCode } from "@/helpers/general";
import moment from "moment";
import { categoryArrayHasLabel } from "@/helpers/frontend/labels";
import { DummyTaskListComponent } from "./gantt_Dummy/DummyTaskListComponent";
import { DummyTaskHeaderComponent } from "./gantt_Dummy/DummyTaskHeaderComponent";
import Form from 'react-bootstrap/Form';
import { Col, Row } from "react-bootstrap";
import { Loading } from "../common/Loading";
import { PRIMARY_COLOUR } from "@/config/style";
export default class GanttView extends Component {
    constructor(props) {
        super(props)
        this.i18next = getI18nObject()
        this.state = { ganttTasks: [], viewMode: ViewMode.Day, showChildren: true, finalGanttChart: <Loading />, showWithoutDue: true }
        this.generateView = this.generateView.bind(this)
        this.setDueDateforParent = this.setDueDateforParent.bind(this)
        this.viewChanged = this.viewChanged.bind(this)
        this.childrenVisiblityChanged = this.childrenVisiblityChanged.bind(this)
        this.generateTaskArray = this.generateTaskArray.bind(this)
        this.showTaskWithoutDueChanged = this.showTaskWithoutDueChanged.bind(this)
    }

    componentDidMount() {
        this.generateTaskArray()
        this.setState({})
    }

    generateTaskArray() {
        var finalGanttList = []
        this.generateView(this.props.list, this.props.todoList, finalGanttList)

        var counter = 0
    
         
        while (counter < process.env.NEXT_PUBLIC_SUBTASK_RECURSION_CONTROL_VAR && this.setDueDateforParent(finalGanttList) > 0) {
            counter++
        }
       
        return finalGanttList
       // this.setState({ ganttTasks: finalGanttList})

    }
    showTaskWithoutDueChanged(e)
    {
        this.setState({showWithoutDue: e.target.checked})
    }
    childrenVisiblityChanged(e) {

        this.setState(function(previousState, currentProps) {
            return { showChildren: !previousState.showChildren }
        })
    }
    viewChanged(e) {
        if (e.target.value == "DAY_VIEW") {
            this.setState({ viewMode: ViewMode.Day })
        } else if (e.target.value == "MONTH_VIEW") {
            this.setState({ viewMode: ViewMode.Month })

        }else if(e.target.value == "WEEK_VIEW") {
            this.setState({ viewMode: ViewMode.Week })

        }

    }

    generateView(list, todoList, finalGanttList) {
        for (const i in list) {
            var key = list[i][0]

            if (key == "undefined" || key == null || key == undefined || key == "") {
                continue;
            }

            if ((todoList[1][key].todo.completed == null || todoList[1][key].todo.completed == "") && todoList[1][key].todo.completion != "100" && todoList[1][key].todo.summary != null && todoList[1][key].todo.summary != undefined && (todoList[1][key].todo.deleted == null || todoList[1][key].todo.deleted == "")) {

                    var dueDate = new Date(Date.now())
                    if (todoList[1][key].todo.due != null && todoList[1][key].todo.due != "" && todoList[1][key].todo.due != undefined) {
                        dueDate = new Date(ISODatetoHumanISO(todoList[1][key].todo.due))
                    }

                    var startDate = ""
                    if (todoList[1][key].todo.start != null && todoList[1][key].todo.start != "" && todoList[1][key].todo.start != undefined) {
                        startDate = new Date(ISODatetoHumanISO(todoList[1][key].todo.start))
                    }else{
                       if(new Date(dueDate).getTime() < Date.now())
                       {
                        // Due date is in the past.
                        // Set Start date same as the due date.

                        startDate = dueDate

                       }else{
                        startDate = new Date(Date.now())
                       }
                    }
                    var type = "task"
    
                    if (todoList[1][key].todo.category != null && Array.isArray(todoList[1][key].todo.category) && todoList[1][key].todo.category.length > 0) {
                        if (categoryArrayHasLabel(todoList[1][key].todo.category, "Project")) {
                            type = "project"
                        } else if (categoryArrayHasLabel(todoList[1][key].todo.category, "milestone")) {
                            type = "milestone"
                        }
                    }

                    var backgroundColor =PRIMARY_COLOUR
                    if(todoList.length>3)
                    {
                         backgroundColor=todoList[3][key]
                    } 
                    var toPush = {
                        start: startDate,
                        end: dueDate,
                        name: todoList[1][key].todo.summary,
                        id: key,
                        type: type,
                        progress: todoList[1][key].todo.completion,
                        isDisabled: true,
                        styles: { backgroundColor: backgroundColor, progressColor: 'white', progressSelectedColor: '#ff9e0d' },
                    }
                    if (todoList[1][key].todo.relatedto != "" && todoList[1][key].todo.relatedto != null && todoList[1][key].todo.relatedto != undefined) {
                        toPush["dependencies"] = [todoList[1][key].todo.relatedto]
                    }
                    if (todoList[1][key].todo.due != null && todoList[1][key].todo.due != "" && todoList[1][key].todo.due != undefined) {
                        finalGanttList.push(toPush)

                    }else{
                        if(this.state.showWithoutDue==true)
                        {
                            finalGanttList.push(toPush)

                        }

                    }
    
    
                if (list[i].length > 2 && this.state.showChildren == true) {
                    this.generateView(list[i][2], todoList, finalGanttList)
                }

            }

        }

    }

    setDueDateforParent(finalGanttList) {
        var counter = 0
        if (finalGanttList != null && finalGanttList.length > 0) {
            for (const i in finalGanttList) {
                if (finalGanttList[i].dependencies != null && finalGanttList[i].dependencies != undefined && finalGanttList[i].dependencies.length > 0) {
                    //Current task has a parent.
                    //Get parent's due date.
                    var parentID = this.getParentOrderNumber(finalGanttList[i].dependencies[0], finalGanttList)
                    if (parentID != -1 && parentID != null && parentID != undefined) {
                        var subTaskDue = new Date(finalGanttList[i].end).getTime()
                        var parentDueDate = new Date(finalGanttList[parentID].end).getTime()
                        var parentStartDate = new Date(finalGanttList[parentID].start).getTime()
                        if (subTaskDue > parentDueDate && subTaskDue>parentStartDate) {
                            counter++
                            finalGanttList[parentID].end = finalGanttList[i].end
                        }


                    }
                }

            }

        }
        return counter
    }

    getParentOrderNumber(parentID, finalGanttList) {
        if (finalGanttList != null && finalGanttList.length > 0) {
            for (const i in finalGanttList) {
                if (finalGanttList[i].id == parentID) {
                    return i
                }
            }
        }

        return -1
    }
    render() {


        var finalOutput = null
        

        var ganttTasks= this.generateTaskArray()
        console.log(ganttTasks)
        if (ganttTasks != null && ganttTasks.length > 0) {
            var ganttview =  <Gantt viewMode={this.state.viewMode} TaskListTable={DummyTaskListComponent} viewDate={Date.now()-(86400*1000*3)}  todayColor="#FFF8DC" TaskListHeader={DummyTaskHeaderComponent} tasks={ganttTasks} />
            finalOutput = (<div>
                {ganttview}
               </div>)

        }
        else {
            finalOutput = (<p>{this.i18next.t("NOTHING_TO_SHOW")}</p>)
        }
        return (
            <>
                            <Row>
                    <Col>
                        <span style={{ justifyContent: 'center', display: 'flex', alignItems: "center", paddingBottom: 30, paddingTop: 30 }}>

                            {this.i18next.t("VIEW")}&nbsp;&nbsp;
                            <Form.Select onChange={this.viewChanged} style={{ width: 200 }} size="sm">
                                <option value="DAY_VIEW">{this.i18next.t("DAY_VIEW")}</option>
                                <option value="WEEK_VIEW">{this.i18next.t("WEEK_VIEW")}</option>
                                <option value="MONTH_VIEW">{this.i18next.t("MONTH_VIEW")}</option>
                            </Form.Select>

                        </span>

                    </Col>
                    <Col>
                        <span style={{ justifyContent: 'center', display: 'flex', alignItems: "center", paddingBottom: 30, paddingTop: 30 }}>

                            &nbsp;&nbsp;
                            <Form.Check
                                type="switch"
                                key="switch_OK"
                                id="children_visible_switch"
                                checked={this.state.showChildren}
                                onChange={this.childrenVisiblityChanged}
                                label={this.i18next.t("SHOW_CHILDREN")}
                            />
                        </span>


                    </Col>
                    <Col>
                        <span style={{ justifyContent: 'center', display: 'flex', alignItems: "center", paddingBottom: 30, paddingTop: 30 }}>

                            &nbsp;&nbsp;
                            <Form.Check
                                type="switch"
                                value={this.state.showWithoutDue}
                                checked={this.state.showWithoutDue}
                                onChange={this.showTaskWithoutDueChanged}
                                label={this.i18next.t("SHOW_TASKS_WITH_NO_DUE")}
                            />
                        </span>


                    </Col>
                </Row>

                {finalOutput}
            </>
        )
    }
}


