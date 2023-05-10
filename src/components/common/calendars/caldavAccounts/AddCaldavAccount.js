import { Component } from "react";
import { Button, Col, Row } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import validator from 'validator';
import 'react-toastify/dist/ReactToastify.css';
import { Toastify } from "@/components/Generic";
import {toast } from 'react-toastify';
import { getI18nObject } from "@/helpers/frontend/general";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import Spinner from 'react-bootstrap/Spinner';
import { addTrailingSlashtoURL, getAPIURL } from "@/helpers/general";
export default class AddCaldavAccount extends Component{
    constructor(props)
    {
        super(props)
        var i18next = getI18nObject()
        this.i18next=i18next
        this.state= {serverURL: '', accountName: '', username: '', password: '',  i18next: i18next, requestPending: false}
        this.serverURLValueChanged = this.serverURLValueChanged.bind(this)
        this.accountNameValueChanged = this.accountNameValueChanged.bind(this)
        this.serverUsernameValueChanged = this.serverUsernameValueChanged.bind(this)
        this.serverPasswordValueChanged = this.serverPasswordValueChanged.bind(this)
        this.addAccountButtonClicked = this.addAccountButtonClicked.bind(this)
        this.formisValid = this.formisValid.bind(this)
        this.makeServerRequest = this.makeServerRequest.bind(this)
        this.backButtonClicked = this.backButtonClicked.bind(this)
    }

    serverURLValueChanged(event)
    {
        this.setState({serverURL: event.target.value})
    }
    accountNameValueChanged(event)
    {
        this.setState({accountName: event.target.value})
    }
    serverUsernameValueChanged(event)
    {
        this.setState({username: event.target.value})
    }

    serverPasswordValueChanged(event){
        this.setState({password: event.target.value})

    }
    backButtonClicked()
    {
        this.props.onAddAccountDismissed()
    }

    addAccountButtonClicked()
    {
        if(this.formisValid()==true)
        {
            this.makeServerRequest()
        }
    }
    async makeServerRequest()
    {
        this.setState({requestPending: true})
        const url_api=getAPIURL()+"caldav/register?url="+ addTrailingSlashtoURL(this.state.serverURL)+"&&username="+this.state.username+"&&password="+this.state.password+"&&accountname="+this.state.accountName
        const authorisationData=await getAuthenticationHeadersforUser()
    
        const requestOptions =
        {
            method: 'GET',
            url: this.state.serverURL,
            username: this.state.username,
            password: this.state.password,
            accountname: this.state.accountName,
            headers: new Headers({'authorization': authorisationData}),
        }
    
        return new Promise( (resolve, reject) => {
            const response =  fetch(url_api, requestOptions)
            .then(response => response.json())
            .then((body) =>{
                //Save the events to db.
                this.setState({requestPending: false})
                if(body!=null)
                {
                    if(body.success==true)
                    {
                        this.props.onAccoundAddSuccess()

                    }else{
                        toast.error(this.state.i18next.t(body.data.message))
                    }
                }
                else
                {
                    toast.error(this.state.i18next.t("ERROR_GENERIC"))

                }
                
    
            });
        })

    }
    formisValid()
    {
        var formisValid=true
        if(this.state.serverURL!=null)
        {
            if(validator.isURL(addTrailingSlashtoURL(this.state.serverURL)))
            {
            }
            else{
                if(this.state.serverURL.startsWith("https://localhost") || this.state.serverURL.startsWith("http://localhost")){
                }
                else{
                    toast.error(this.state.i18next.t("ENTER_A_SERVER_NAME"))
                    return false

                }

            }

        }else{
            return false
        }

        if(this.state.accountName==null || this.state.accountName!=null && this.state.accountName.trim()=="")
        {
            toast.error(this.state.i18next.t("ENTER_ACCOUNT_NAME"))

            return false
        }

        if(this.state.password==null || this.state.password!=null && this.state.password.trim()=="")
        {
            toast.error(this.state.i18next.t("ENTER_CALDAV_PASSWORD"))

            return false
        }
        if(this.state.username==null || this.state.username!=null && this.state.username.trim()=="")
        {
            toast.error(this.state.i18next.t("ENTER_CALDAV_USERNAME"))

            return false
        }

        return formisValid
    }
    render(){

        var button =  !this.state.requestPending ? (<div><Button onClick={this.backButtonClicked} variant="secondary" >{this.i18next.t("BACK")}</Button> <Button onClick={this.addAccountButtonClicked} >{this.i18next.t("Add")}</Button> </div> ): (<Spinner animation="grow" variant="success" />)
        return(
            <>
            <Row>
                    <Col>
                    <h1>Add CalDAV Account</h1>
                    </Col>
            </Row>
            <br />
            <Form.Group className="mb-3">
                <Form.Label>Account Name</Form.Label>
                <Form.Control disabled={this.state.requestPending}   onChange={this.accountNameValueChanged}  placeholder="Enter a name for Caldav Account" />
                <Form.Label style={{marginTop: 30}}>Server URL</Form.Label>
                <Form.Control disabled={this.state.requestPending} onChange={this.serverURLValueChanged} type="URL" placeholder="Enter CalDAV server URL" />
                <Form.Label style={{marginTop: 30}}>CalDAV Username</Form.Label>
                <Form.Control disabled={this.state.requestPending} onChange={this.serverUsernameValueChanged} type="URL" placeholder={this.state.i18next.t("CALDAV_USERNAME_PLACEHOLDER")}/>

                <Form.Label style={{marginTop: 30}}>CalDAV Password</Form.Label>
                <Form.Control disabled={this.state.requestPending} onChange={this.serverPasswordValueChanged} type="password" placeholder={this.state.i18next.t("CALDAV_PASSWORD_PLACEHOLDER")} />

                <div style={{marginTop: 30, textAlign: 'center'}}>{button}</div>

            </Form.Group>

            {/* <Toastify /> */}
            </>
        )
    }
} 