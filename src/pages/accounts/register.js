import { Toastify } from '@/components/Generic';
import { getI18nObject } from '@/helpers/frontend/general';
import { getMessageFromAPIResponse } from '@/helpers/frontend/response';
import { getAPIURL } from '@/helpers/general';
import Head from 'next/head';
import Image from 'next/image';
import { withRouter } from 'next/router';
import { Component } from 'react'
import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { MdArrowBack, MdArrowBackIos } from 'react-icons/md';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import validator from 'validator';


class Register extends Component{

    constructor(props)
    {
        super(props)
        this.i18next = getI18nObject()
        this.state ={username: "", password: "", passwordconfirm: "", email: ""}
        this.usernameChanged = this.usernameChanged.bind(this)
        this.passWordChanged = this.passWordChanged.bind(this)
        this.reenterPasswordChanged = this.reenterPasswordChanged.bind(this)
        this.registerButtonClicked = this.registerButtonClicked.bind(this)
        this.goBackClicked = this.goBackClicked.bind(this)
        this.emailChanged = this.emailChanged.bind(this)

    }

    goBackClicked()
    {
        this.props.router.push("/login")
    }
    usernameChanged(e)
    {
        this.setState({username: e.target.value})
    }
    passWordChanged(e)
    {
        this.setState({password: e.target.value})
    }
    emailChanged(e)
    {
        this.setState({email: e.target.value})
    }
    reenterPasswordChanged(e)
    {
        this.setState({passwordconfirm: e.target.value})
    }
    registerButtonClicked()
    {
        var isValid= true
        if((this.state.username!=null && this.state.username.trim()=="") || this.state.username==null)
        {
            toast.error(this.i18next.t("INVALID_USERNAME"))
            isValid=false
            return false
        }

        if((this.state.email!=null && this.state.email.trim()=="") || this.state.email==null)
        {

            toast.error(this.i18next.t("INVALID_EMAIL"))
            isValid =false
            return false
        }
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

        if(this.state.passwordconfirm!=this.state.password)
        {
            toast.error(this.i18next.t("PASSWORD_DONT_MATCH"))
            isValid=false

        }

        if(isValid)
        {
            this.makeRequesttoServer()
            
        }

    }
    async makeRequesttoServer(){
        const url_api=getAPIURL()+"users/register"

        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({"password":this.state.password, "username": this.state.username, email: this.state.email}),
            mode: 'cors',
            headers: new Headers({'Content-Type':'application/json'}),

        }
        try    
        {
            const response = await fetch(url_api, requestOptions)
        .then(response => response.json())
        .then((body) =>{
            console.log(body)
           if(body!=null && body.success!=null)
           {
                var message = getMessageFromAPIResponse(body)

                if(body.success==true)
                {
                    if(message=="USER_INSERT_OK")
                    {
                        this.props.router.push("/login?message=USER_INSERT_OK")
                    }
                }else{
                    if(message=="ERROR_LOGIN_WITH_PASSWORD")
                    {
                        this.props.router.push("/login?message=ERROR_LOGIN_WITH_PASSWORD")

                    }else{
                        toast.error(this.i18next.t(message))

                    }

                }
           }else
           {
            toast.error(this.i18next.t("ERROR_GENERIC"))
           }
            
        });
        }
        catch(e)
        {
            console.log(e.message)
        }


    }
    render(){
        return(
            <>
                <Head>
                <title>{this.i18next.t("APP_NAME_TITLE")+" - "+this.i18next.t("REGISTER")}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                </Head>
                <Container fluid>  
                <div style={{   margin: "0",    position: "absolute",  top: "50%",   left: "50%",  transform: "translate(-50%, -50%)"}}>
                <div style={{textAlign:'center', }}><Image alt='Logo' src="/logo.png" width={100} height={100} /></div>
                <h2 style={{textAlign:'center', }}>{this.i18next.t("APP_NAME")}</h2>
                <br />
                <div onClick={this.goBackClicked} ><MdArrowBack size={24} /></div>
                <br />
                <h1>{this.i18next.t("REGISTER")}</h1>
                <Form.Control maxLength={40} value={this.state.username} onChange={this.usernameChanged} placeholder={this.i18next.t("ENTER_USERNAME")} />
                <br />
                <Form.Control maxLength={40} value={this.state.email} onChange={this.emailChanged} placeholder={this.i18next.t("ENTER_EMAIL")} />
                <br />
                <Form.Control onChange={this.passWordChanged} value={this.state.password} type="password" maxLength={40} placeholder={this.i18next.t("ENTER_A_PASSWORD")} />
                <br />
                <Form.Control onChange={this.reenterPasswordChanged} value={this.state.passwordconfirm} type="password" maxLength={40} placeholder={this.i18next.t("REENTER_PASSWORD")} />
                <br />
                <Button onClick={this.registerButtonClicked} > {this.i18next.t("REGISTER")}</Button>



                </div>
                </Container>
                {/* <Toastify /> */}
            </>
        )
    }
}


export default withRouter(Register)