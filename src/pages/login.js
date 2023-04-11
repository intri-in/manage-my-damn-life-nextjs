import { Toastify } from '@/components/Generic';
import { PRIMARY_COLOUR, SECONDARY_COLOUR } from '@/config/style';
import { getI18nObject } from '@/helpers/frontend/general'
import Head from 'next/head'
import Image from 'next/image';
import Link from 'next/link';
import { withRouter } from 'next/router'
import { Component } from 'react'
import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuthenticationHeadersforUser, setLoginCookie } from '@/helpers/frontend/user';
import { getMessageFromAPIResponse } from '@/helpers/frontend/response';
class Login extends Component{

    constructor(props)
    {
        super(props)
        this.i18next = getI18nObject()
        this.state={password: "", username: "", showRegistrationLink: false}
        this.usernameChanged = this.usernameChanged.bind(this)
        this.passWordChanged = this.passWordChanged.bind(this)
        this.loginButtonClicked= this.loginButtonClicked.bind(this)
        this.processReponse = this.processReponse.bind(this)

    }
    componentDidMount()
    {
        if(window!=undefined){
            const queryString = window.location.search;
            const params = new URLSearchParams(queryString);
            var message= params.get('message')
            if(message!=null && message!=undefined)
            {
                toast.info(this.i18next.t(message))
            }

        }
      this.getRegistrationStatusFromServer().then((body)=>{
        if(body!=null && body.success!=null && body.success==true)
        {
            var showRegistrationLink = false
            if(body.data.message!=null)
            {
                if(body.data.message=="1" || body.data.message=="true" || body.data.message=="TRUE" )
                {
                    showRegistrationLink=true
                }
            }

            this.setState({showRegistrationLink: showRegistrationLink})

        }else{
            toast.error(this.i18next.t("CANT_GET_REGISTRATION_STATUS_FROM_SERVER"))
        }
      })
    }
    async getRegistrationStatusFromServer(){
        const url_api=process.env.NEXT_PUBLIC_API_URL+"users/settings/registrationstatus"
    
        const requestOptions =
        {
            method: 'GET',
            mode: 'cors',
    
        }
    
        return new Promise( (resolve, reject) => {
            const response =  fetch(url_api, requestOptions)
            .then(response => response.json())
            .then((body) =>{
                resolve(body)     
            })
        })
    
    }
    usernameChanged(e)
    {
        this.setState({username: e.target.value})
    }
    passWordChanged(e)
    {
        this.setState({password: e.target.value})
    }
    async loginButtonClicked()
    {
        var isValid= true
        if((this.state.username!=null && this.state.username.trim()=="") || this.state.username==null)
        {
            toast.error(this.i18next.t("INVALID_USERNAME"))
            isValid=false
        }

        if((this.state.password!=null && this.state.password.trim()=="") || this.state.password==null)
        {
            toast.error(this.i18next.t("ENTER_A_PASSWORD"))
            isValid=false
        }

        if(isValid)
        {
            const url_api=process.env.NEXT_PUBLIC_API_URL+"login/"

            const requestOptions =
            {
                method: 'POST',
                body: JSON.stringify({"password":this.state.password, "username": this.state.username,}),
                mode: 'cors',
                headers: new Headers({'Content-Type':'application/json'}),

            }
            try    
            {
                const response = await fetch(url_api, requestOptions)
            .then(response => response.json())
            .then((body) =>{
                console.log(body)
               this.processReponse(body)
                
            });
            }
            catch(e)
            {
                console.log(e.message)
            }
    
        }

    }
    processReponse(body)
    {

        if(body!=null && body.success!=null && body.success=="true")
        {
            var message= getMessageFromAPIResponse(body)
            if(message!=null)
            {
                if(message.userhash!=null && message.userhash!=undefined && message.ssid!=null && message.ssid!=undefined)
                {
                    //Save userhash and SSID 
                    setLoginCookie(message.userhash, message.ssid)
                    var redirectURL="/"
                    if(window!=undefined){
                        const queryString = window.location.search;
                        const params = new URLSearchParams(queryString);
                        var redirectTo = params.get('redirect')
                        if(redirectTo!=null && redirectTo!=undefined && redirectTo!="")
                        {
                            redirectURL=redirectTo

                        }
                    }

                    this.props.router.push(redirectURL)
                }else{
                    toast.error(this.i18next.t("ERROR_GENERIC"))

                }
            }
            else{
                toast.error(this.i18next.t("ERROR_GENERIC"))
            }
        }else
        {
            var message= getMessageFromAPIResponse(body)
            if(message!=null)
            {
                toast.error(this.i18next.t(message.toString()))

            }else{
                toast.error(this.i18next.t("ERROR_GENERIC"))

            }

        }
    }
    render(){
        var registrationLink = this.state.showRegistrationLink? (<div style={{textAlign:'center', color: "blue" }}><Link href="accounts/register"> Register</Link></div>) : null
        return(
              <>
        <Head>
          <title>{this.i18next.t("APP_NAME_TITLE")+" - "+this.i18next.t("LOGIN")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Container fluid>  
        <div style={{   margin: "0",    position: "absolute",  top: "50%",   left: "50%",  transform: "translate(-50%, -50%)"}}>
            <div style={{textAlign:'center', }}><Image alt='Logo' src="/logo.png" width={100} height={100} /></div>
            <h2 style={{textAlign:'center', }}>{this.i18next.t("APP_NAME")}</h2>
            <br />
            <h1>{this.i18next.t("LOGIN")}</h1>
            <Form.Control maxLength={40} value={this.state.username} onChange={this.usernameChanged} placeholder={this.i18next.t("ENTER_USERNAME")} />
            <br />
            <Form.Control onChange={this.passWordChanged} value={this.state.password} type="password" maxLength={40} placeholder={this.i18next.t("ENTER_A_PASSWORD")} />
            <br />
            <div style={{textAlign:'center',}}><Button onClick={this.loginButtonClicked} > {this.i18next.t("LOGIN")}</Button></div>
            <div style={{marginBottom:20}} />
            <div style={{textAlign:'center', color: "blue" }}><Link href="/accounts/resetpassword">{this.i18next.t("RESET_PASSWORD")}</Link></div>
            <br/>
            {registrationLink}
            
        </div> 
        <Toastify />     
        </Container>

        </>)
    }
}

export default withRouter(Login)