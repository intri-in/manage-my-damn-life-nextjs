import { Component } from "react";
import { Row, Col } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { Loading } from "../Loading";
import { getI18nObject } from "@/helpers/frontend/general";
import { getAPIURL } from "@/helpers/general";
export default class AddNewCalendar extends Component{

    constructor(props)
    {
        super(props)
        this.i18next = props.i18next
        this.state={calendarName: "",submitting :false}

        this.makeCalendarCreateRequest = this.makeCalendarCreateRequest.bind(this)
        this.calendarNameValueChanged = this.calendarNameValueChanged.bind(this)
    }
    async makeCalendarCreateRequest(){
        this.setState({submitting: true})
        const url_api=getAPIURL()+"calendars/create"

        const authorisationData=await getAuthenticationHeadersforUser()
        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({"caldav_accounts_id":this.props.caldav_accounts_id, "calendarName": this.state.calendarName,}),
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData, 'Content-Type':'application/json'}),
        }
        
        const response = await fetch(url_api, requestOptions)
        .then(response => response.json())
        .then((body) =>{
            // console.log(body)
            this.props.onResponse(body)

           
            
        }).catch(e =>{
            this.props.onResponse(e.message)
        })
        

    }
    calendarNameValueChanged(e)
    {
        this.setState({calendarName: e.target.value})
    }
    render(){

        var button = this.state.submitting ? <Loading /> : ( <div style={{flex: 1, justifyContent:"space-between"}}> <Button variant="secondary" onClick={this.props.onClose} style={{marginBottom: 10}} >{this.i18next("BACK")}</Button> &nbsp;
         <Button onClick={this.makeCalendarCreateRequest} style={{marginBottom: 10}} >{this.i18next("ADD")}</Button>
         </div> 
        )
        return(
            <div style={{}}>
                <h3>{this.i18next("ADD_NEW_CALENDAR")}: {this.props.accountName}</h3>
                <h4></h4>
                <Form.Control onChange={this.calendarNameValueChanged} value={this.state.calendarName} style={{marginBottom: 10}}  placeholder={this.i18next("ENTER_CALENDAR_NAME")} />
                <div style={{textAlign :"center"}}>{button}</div>
            </div>
        )
    }
}