import { Toastify } from "@/components/Generic";
import { getI18nObject } from "@/helpers/frontend/general";
import Head from "next/head";
import { withRouter } from "next/router";
import { Component } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { Loading } from "@/components/common/Loading";

class ResetPassword extends Component{

    constructor(props)
    {
        super(props)
        this.state={username: "", isWaiting: false, reqid: null, userhash: null, showNewPasswordForm:false , otp: "", password: "", passwordconfirm: ""}
        this.i18next = getI18nObject()
        this.getUsernameForm = this.getUsernameForm.bind(this)
        this.makeGetOTPRequest = this.makeGetOTPRequest.bind(this)
        this.usernameChanged = this.usernameChanged.bind(this)
        this.passWordChanged = this.passWordChanged.bind(this)
        this.reenterPasswordChanged = this.reenterPasswordChanged.bind(this)
        this.otpChanged = this.otpChanged.bind(this)
        this.makePassResetRequest = this.makePassResetRequest.bind(this)

    }
    makeGetOTPRequest(){
        var isValid= true
        if((this.state.username!=null && this.state.username.trim()=="") || this.state.username==null)
        {
            toast.error(this.i18next.t("INVALID_USERNAME"))
            isValid=false
        }

        if(isValid){
            this.setState({isWaiting: true})
            // Make a request to server and process the response.
            const url_api=process.env.NEXT_PUBLIC_API_URL+"users/requestotp?username="+this.state.username
            const requestOptions =
            {
                method: 'GET',
            }
    

        const response =  fetch(url_api, requestOptions)
        .then(response => response.json())
        .then((body) =>{
            //Save the events to db.
            console.log(body)
            if(body!=null)
            {
                if(body.success==true)
                {
                    var message = getMessageFromAPIResponse(body)
                    if(message!=null && message.userhash!=undefined && message.reqid!=null)
                    {
                        this.setState({reqid: message.reqid, userhash: message.userhash, showNewPasswordForm: true})
                        toast.success(this.i18next.t("OTP_SENT_TO_EMAIL"))
                     

                    }else{
                        toast.error(this.i18next.t("ERROR_GENERIC"))

                    }
                    
                }else{
                    var message = getMessageFromAPIResponse(body)
                    toast.error(this.i18next.t(message.toString()))
                }
            }
            else
            {
                toast.error(this.i18next.t("ERROR_GENERIC"))

            }
            this.setState({isWaiting: false})


        });
    
        }


    }
    usernameChanged(e)
    {
        this.setState({username: e.target.value})
    }
    passWordChanged(e)
    {
        this.setState({password: e.target.value})
    }
    reenterPasswordChanged(e)
    {
        this.setState({passwordconfirm: e.target.value})
    }
    otpChanged(e)
    {
        this.setState({otp: e.target.value })
    }
    async makePassResetRequest()
    {
        var isValid = true
        if((this.state.passwordconfirm!=null && this.state.passwordconfirm.trim()=="") || this.state.passwordconfirm==null)
        {
            toast.error(this.i18next.t("REENTER_PASSWORD"))
            isValid=false
            return false

        }

        if((this.state.password!=null && this.state.password.trim()=="") || this.state.password==null)
        {
            toast.error(this.i18next.t("ENTER_A_PASSWORD"))
            
            isValid=false
            return false

        }


        if((this.state.otp!=null && this.state.otp.trim()=="") || this.state.otp==null)
        {
            toast.error(this.i18next.t("ENTER_OTP"))
            
            isValid=false
            return false

        }

        if(this.state.passwordconfirm!=this.state.password)
        {
            toast.error(this.i18next.t("PASSWORD_DONT_MATCH"))
            isValid=false

        }

        if(isValid)
        {
            // Make request to server.
            this.setState({isWaiting: true})
            const url_api=process.env.NEXT_PUBLIC_API_URL+"users/modifypassword"

        
        
        
                const requestOptions =
                {
                    method: 'POST',
                    body: JSON.stringify({"otp":this.state.otp, "reqid": this.state.reqid, "userhash": this.state.userhash, 'password':this.state.password}),
                    mode: 'cors',
                    headers: new Headers({'Content-Type':'application/json'}),
                }
                try    
                {
                    fetch(url_api, requestOptions)
                .then(response => response.json())
                .then((body) =>{
                    console.log(body)
                    if(body!=null)
                    {
                        var message = getMessageFromAPIResponse(body)
                        console.log(message)
                        if(body.success==true)
                        {
                            //toast.success(this.i18next.t(message))
                            this.props.router.push("/login?message="+message)
                        }else{
                            toast.error(this.i18next.t(message))
                        }
                      
                    }else{
                        toast.error(this.i18next.t("ERROR_GENERIC"))
                    }
                   
                    
                });
                }
                catch(e)
                {
                    console.log(e)
                    toast.error(e.message)
                }
            
            
          
        
        }

        this.setState({isWaiting: false})


    }
    getUsernameForm()
    {
        var submitButton = this.state.isWaiting ? (<div style={{textAlign: 'center'}}><Loading /></div>): <div style={{textAlign: 'center'}}><Button  onClick={this.makeGetOTPRequest} > {this.i18next.t("SUBMIT")}</Button></div>

        return(<div>
            <Form.Control maxLength={40} value={this.state.username} onChange={this.usernameChanged} placeholder={this.i18next.t("ENTER_USERNAME")} />
            <br />
            <br />
            {submitButton}
            </div>
        )
    }
    getNewPasswordForm()
    {
        var submitButton = this.state.isWaiting ? (<div style={{textAlign: 'center'}}><Loading /></div>):  (<div style={{textAlign: 'center'}}><Button onClick={this.makePassResetRequest} > {this.i18next.t("SUBMIT")}</Button></div>)

        return(
        <div>
            <Form.Control maxLength={6} value={this.state.otp} onChange={this.otpChanged} placeholder={this.i18next.t("ENTER_OTP")} />
            <br />
            <Form.Control onChange={this.passWordChanged} value={this.state.password} type="password" maxLength={40} placeholder={this.i18next.t("ENTER_A_PASSWORD")} />
            <br />
            <Form.Control onChange={this.reenterPasswordChanged} value={this.state.passwordconfirm} type="password" maxLength={40} placeholder={this.i18next.t("REENTER_PASSWORD")} />
            <br />

            {submitButton}
        </div>
        )

    }
    render(){
        var currentForm =  this.state. showNewPasswordForm ? this.getNewPasswordForm(): this.getUsernameForm()
        return(<>
        <Head>
          <title>{this.i18next.t("APP_NAME_TITLE")+" - "+this.i18next.t("RESET_PASSWORD")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Container fluid>  
        <div style={{   margin: "0",    position: "absolute",  top: "50%",   left: "50%",  transform: "translate(-50%, -50%)"}}>
            <div style={{textAlign:'center', }}><Image alt='Logo' src="/logo.png" width={100} height={100} /></div>
            <h2 style={{textAlign:'center', }}>{this.i18next.t("APP_NAME")}</h2>
            <br />
            <h1>{this.i18next.t("RESET_PASSWORD")}</h1>
            <br/>
            {currentForm}
            <br />
            <div style={{textAlign : "center"}}><Link href="/login">Cancel</Link></div>

        </div> 
        {/*  <Toastify />     */}
        </Container>

        </>
            )
    }
}

export default withRouter(ResetPassword)