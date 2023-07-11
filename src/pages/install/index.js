import { Loading } from "@/components/common/Loading";
import { getI18nObject } from "@/helpers/frontend/general";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { getAPIURL, logVar, varNotEmpty } from "@/helpers/general";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { withRouter } from "next/router";
import { Component } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";

class StartInstall extends Component{
    constructor(props)
    {
        super(props)
        this.i18next = getI18nObject()
        this.state ={output: null}
        this.checkifInstalled = this.checkifInstalled.bind(this)
        this.installButtonClicked = this.installButtonClicked.bind(this)
        this.continueClicked = this.continueClicked.bind(this)
    }
    componentDidMount()
    {
        this.checkifInstalled()
    }

    continueClicked()
    {
        this.props.router.push("/accounts/register")
    }

    getInstallFinishedOKForm()
    {
        return(
            <>
            <Alert variant="success">
                {this.i18next.t("INSTALL_SUCESSFUL")}
            </Alert>

            <Button onClick={this.continueClicked}>{this.i18next.t("CONTINUE")}</Button>

            </>
        )
    }
    installButtonClicked()
    {
        this.setState({output: <Loading centered={true} />})
        const url_api = getAPIURL() + "install/go"


        const requestOptions =
        {
            method: 'GET',
            //headers: new Headers({ 'authorization': authorisationData }),
        }

            fetch(url_api, requestOptions)
            .then(response => {
                return response.json()

            }).then((body) => {
                console.log("MMDL INSTALL REPONSE:", body)
                if(varNotEmpty(body) && varNotEmpty(body.success)){
                    if(body.success==true)
                    {
                        this.setState({output: this.getInstallFinishedOKForm()})
                    }else{
                        var message = getMessageFromAPIResponse(body)
                        this.setState({output: (
                        <Alert variant="danger">
                        {this.i18next.t(message)}
                        <br />
                        <br />
                        {this.i18next.t("ERROR_GENERIC")}
                      </Alert>)})
                        }
                }else{
                    this.setState({output: ( <Alert variant="danger">
                    {this.i18next.t("ERROR_GENERIC")}
                  </Alert>)})

                }
            }).catch(e => {
                console.error("installButtonClicked" ,e)
                this.setState({output: ( <Alert variant="danger">
                {this.i18next.t("ERROR_GENERIC")}
              </Alert>)})

            })
    }

    getInstallForm()
    {
        return(
            <>
            <Alert variant="success">
                                {this.i18next.t("READY_TO_INSTALL")}
            </Alert>
            <br />
            <Button onClick={this.installButtonClicked}>{this.i18next.t("INSTALL")}</Button>
            </>
        )
    }
    async checkifInstalled(){
        const url_api = getAPIURL() + "install/check"


        const requestOptions =
        {
            method: 'GET',
            //headers: new Headers({ 'authorization': authorisationData }),
        }

            fetch(url_api, requestOptions)
            .then(response => {
                
                return response.json()
            
            })
            .then((body) => {
                if(varNotEmpty(body) && varNotEmpty(body.success)){

                    if (body.success==true){
                            //Already installed.
                            this.setState({output: ( <Alert variant="success">
                                {this.i18next.t("ALREADY_INSTALLED")}
                              </Alert>)})
                            this.props.router.push("/")

                    }
                    else{
                      var message = getMessageFromAPIResponse(body)
                      if(message=="ERROR_DB_CON_ERROR")
                      {
                        this.setState({output: ( <Alert variant="danger">
                        {this.i18next.t("ERROR_DB_CON_ERROR")}
                        <br />
                        <br />
                        {JSON.stringify(body.data.details)}
                      </Alert>)})
                      }else if(message=="NOT_INSTALLED")
                      {
                        this.setState({output: this.getInstallForm()})
                      }
                    }
                } else{
                    this.setState({output: ( <Alert variant="danger">
                    {this.i18next.t("ERROR_GENERIC")}
                  </Alert>)})


                }
               

            }).catch(e =>{
            console.error( "checkifInstalled" , e)
            this.setState({output: ( <Alert variant="danger">
            {this.i18next.t("ERROR_GENERIC")}
          </Alert>)})

            })

    }

    render(){
        return(
        <>
        <Head>
          <title>{this.i18next.t("APP_NAME_TITLE")+" - "+this.i18next.t("INSTALL")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Container fluid>  
        <div style={{   margin: "0",    position: "absolute",  top: "50%",   left: "50%",  transform: "translate(-50%, -50%)"}}>
            <div style={{textAlign:'center', }}><Image alt='Logo' src="/logo.png" width={100} height={100} /></div>
            <h2 style={{textAlign:'center', }}>{this.i18next.t("APP_NAME")}</h2>
            <br />
            <h1>{this.i18next.t("Install")}</h1>
            <br/>
            {this.state.output}
            
        </div> 
        </Container>
        </>)
    }
}

export default withRouter(StartInstall)