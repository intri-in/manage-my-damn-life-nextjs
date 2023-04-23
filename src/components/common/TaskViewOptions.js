import { getI18nObject } from "@/helpers/frontend/general";
import { Component } from "react";
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

export default class TaskViewOptions extends Component{
    constructor(props)
    {
        super(props)
        this.i18next = getI18nObject()
        this.state =  {selectedView: "tasklist"}
        this.taskViewClicked = this.taskViewClicked.bind(this)
        this.ganttViewClicked = this.ganttViewClicked.bind(this)

    }
    taskViewClicked()
    {
        this.props.changeView("tasklist")
        this.setState({selectedView: "tasklist"})
    }
    ganttViewClicked()
    {
        this.props.changeView("ganttview")
        this.setState({selectedView: "ganttview"})


    }
    render(){

        var buttonVariantTask="secondary"
        var buttonVariantGantt="outline-secondary"

        if(this.state.selectedView=="ganttview")
        {
            buttonVariantTask="outline-secondary"
            buttonVariantGantt="secondary"
        }
        return(    
       <div style={{textAlign: "center", marginTop: 20}}>
        <ButtonGroup>
            <Button onClick={this.taskViewClicked} variant={buttonVariantTask}>{this.i18next.t("TASK_VIEW")}</Button>
            <Button variant={buttonVariantGantt} onClick={this.ganttViewClicked}>{this.i18next.t("GANTT_VIEW")}</Button>
        </ButtonGroup>
       </div> )
    }
}