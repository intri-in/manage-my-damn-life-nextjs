import { RRuleHelper } from "@/helpers/frontend/classes/RRuleHelper";
import { getEmptyrruleObject, reccurence_torrule, rruleObjectToString, rruleObjecttoWords, rruleToObject } from "@/helpers/frontend/events";
import { getI18nObject } from "@/helpers/frontend/general";
import { varNotEmpty } from "@/helpers/general";
import { Component } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import Datetime from 'react-datetime';
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import * as _ from 'lodash';
export default class rrule extends Component{
    constructor(props)
    {
        super(props)
        this.i18next = getI18nObject()
        let rrule =RRuleHelper.getEmptyObject()
        if(RRuleHelper.isValidObject(props.rrule))
        {
            rrule= _.cloneDeep(props.rrule)
        }
        this.state={ rrule: _.cloneDeep(rrule), recurrence:_.cloneDeep(rrule)}
        this.removeRecurrence = this.removeRecurrence.bind(this)
        this.recurrence_IntervalChanged = this.recurrence_IntervalChanged.bind(this)
        this.recurrence_FreqChanged = this.recurrence_FreqChanged.bind(this)
        this.recurrence_UntilChanged = this.recurrence_UntilChanged.bind(this)
        this.addRecurrenceClicked = this.addRecurrenceClicked.bind(this)

    }

    componentDidUpdate(prevProps, prevState) {

        if (this.props.rrule !== prevProps.rrule ) {
            this.setState({rrule: _.cloneDeep(this.props.rrule)})
        }
    }
    removeRecurrence() {
        var recurrenceTemp = JSON.parse(JSON.stringify(RRuleHelper.getEmptyObject()))
        this.setState({rrule: recurrenceTemp, recurrence: recurrenceTemp})
        /*
        this.setState((prevState, props) => {

            var newEventData =prevState.eventData
            newEventData.data["rrule"] = "popp"

            return ({rrule: rruleTemp, eventData:newEventData
            })
        })
            
        */

        this.props.onRruleSet(recurrenceTemp)

    }
    recurrence_IntervalChanged(e) {
        this.setState(function (prevState, prevProps) {
            var recurrence = prevState.recurrence
            recurrence["INTERVAL"] = _.cloneDeep(e.target.value)
            return({ recurrence: recurrence })
        })

    }
    recurrence_FreqChanged(e) {
        this.setState(function (prevState, prevProps) {
            var recurrence = _.cloneDeep(prevState.recurrence)
            recurrence["FREQ"] = e.target.value
            return({ recurrence: recurrence })
    
        })

    }
    recurrence_UntilChanged(e) {
        this.setState(function (prevState, prevProps) {
            var recurrence = _.cloneDeep(prevState.recurrence)
            recurrence["UNTIL"] = e._d
            return({ recurrence: recurrence })
        })

    }
    addRecurrenceClicked() {

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
        var newRRule = JSON.parse(JSON.stringify(RRuleHelper.objectToStringObject(this.state.recurrence)))
        if (varNotEmpty(newRRule)) {

            this.setState({ rrule: newRRule })

        }

        this.props.onRruleSet(this.state.recurrence)

    }
    
    
    render(){
        var checkForWords = JSON.parse(JSON.stringify(this.state.rrule))
        var toWords = RRuleHelper.stringObjectToWords(checkForWords)
        var toReturn = []
        if (toWords != "" && varNotEmpty(toWords)) {
            toReturn.push(<Row key={"KEY_TOWORDS_RECURRENCE"} style={{ marginBottom: 20 }} >
                <Col>
                    {toWords}
                </Col>
                <Col style={{ textAlign: "right", color: "red" }}>
                    <AiOutlineDelete onClick={this.removeRecurrence}  />
                </Col>

            </Row>)
        }
       else{
        toReturn.push(
            <div key={"KEY_RECURRENCEFORM_TASKEDITOR"} >
                <Row >
                    <Col>
                        {this.i18next.t("EVERY-RECURRENCE")}
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
            
      



        return(<div style={{ border: "1px solid gray", padding: 10 }}>
        <h3>{this.i18next.t("RECURRENCE")}</h3>
        {toReturn}
        </div>)
    }
}