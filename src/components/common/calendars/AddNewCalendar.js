import { Component } from "react";
import { Row, Col } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { Loading } from "../Loading";
import { getI18nObject } from "@/helpers/frontend/general";
export default class AddNewCalendar extends Component{

    constructor(props)
    {
        super(props)
        this.i18next = getI18nObject()
        this.state={calendarName: "",submitting :false}

        this.makeCalendarCreateRequest = this.makeCalendarCreateRequest.bind(this)
        this.calendarNameValueChanged = this.calendarNameValueChanged.bind(this)
    }
    async makeCalendarCreateRequest(){
        this.setState({submitting: true})
        const url_api=process.env.NEXT_PUBLIC_API_URL+"calendars/create"

        const authorisationData=await getAuthenticationHeadersforUser()
        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({"caldav_accounts_id":this.props.caldav_accounts_id, "calendarName": this.state.calendarName,}),
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData, 'Content-Type':'application/json'}),
        }
        try    
        {
            const response = await fetch(url_api, requestOptions)
        .then(response => response.json())
        .then((body) =>{
            console.log(body)
            this.props.onResponse(body)

           
            
        });
        }
        catch(e)
        {
            this.props.onResponse(e.message)
        }

    }
    calendarNameValueChanged(e)
    {
        this.setState({calendarName: e.target.value})
    }
    render(){

        var button = this.state.submitting ? <Loading /> : ( <div style={{flex: 1, justifyContent:"space-between"}}> <Button variant="secondary" onClick={this.props.onClose} style={{marginBottom: 10}} >{this.i18next.t("BACK")}</Button> &nbsp;
         <Button onClick={this.makeCalendarCreateRequest} style={{marginBottom: 10}} >{this.i18next.t("ADD")}</Button>
         </div> 
        )
        return(
            <div style={{}}>
                <h3>Add New Calendar: {this.props.accountName}</h3>
                <h4></h4>
                <Form.Control onChange={this.calendarNameValueChanged} value={this.state.calendarName} style={{marginBottom: 10}}  placeholder="Enter Calendar Name" />
                <div style={{textAlign :"center"}}>{button}</div>
            </div>
        )
    }
}