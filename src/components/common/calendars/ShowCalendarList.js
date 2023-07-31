import { getCaldavAccountsfromServer } from "@/helpers/frontend/calendar";
import { Component } from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import { Router, useRouter, withRouter } from 'next/router'
import Link from 'next/link'
import { Row, Col } from "react-bootstrap";
import { AiOutlinePlusCircle } from "react-icons/ai";
import AddNewCalendar from "./AddNewCalendar";
import { toast } from "react-toastify";
import { refreshCalendarList } from "@/helpers/frontend/sync";
import { Loading } from "../Loading";
import { getI18nObject } from "@/helpers/frontend/general";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { Toastify } from "@/components/Generic";
import 'react-toastify/dist/ReactToastify.css';
class ShowCalendarList extends Component{
    constructor(props)
    {
        super(props)
        this.i18 = getI18nObject()
        this.state = {finalOutput: null}
        this.getCaldavAccountsfromDB = this.getCaldavAccountsfromDB.bind(this)
        this.showAddCalendarScreen= this.showAddCalendarScreen.bind(this)
        this.addCalendarResponse = this.addCalendarResponse.bind(this)
    }
    componentDidMount()
    {
        this.getCaldavAccountsfromDB()
    }
    showAddCalendarScreen(caldav_account)
    {
        console.log(caldav_account)
        this.setState({finalOutput: <AddNewCalendar onClose={this.getCaldavAccountsfromDB} caldav_accounts_id={caldav_account.account.caldav_accounts_id} onResponse={this.addCalendarResponse} accountName={caldav_account.account.name} />})
    }

    addCalendarResponse(response)
    {
        if(response!=null && response.success!= null && response.success==true && response.data.message[0].status>=200 && response.data.message[0].status<300)
        {
            // Successful creation.
            toast.success("Calendar added successfully.")
        }
        else
        {
            toast.error("Calendar couldn't be added. Check the console log.")
            console.log(response)
        }
        refreshCalendarList().then((response) =>{
            this.getCaldavAccountsfromDB()
        }) 

    }
    async getCaldavAccountsfromDB()
    {
        getCaldavAccountsfromServer().then((caldav_accounts) =>
        {
            var finalOutput= []
            if(caldav_accounts!=null && caldav_accounts.success==true)
            {
                if(caldav_accounts.data.message.length>0)
                {

                    for(let j=0; j<caldav_accounts.data.message.length; j++)
                    {
                        var accountInfo=(
                            <Row>
                                <Col className="defaultTex">
                                    {caldav_accounts.data.message[j].account.name}

                                </Col>
                                <Col style={{textAlign: "right"}}><AiOutlinePlusCircle onClick={()=> this.showAddCalendarScreen(caldav_accounts.data.message[j])} /></Col>
                            </Row>
                        )
                        var calendars=[]
                        for (const i in caldav_accounts.data.message[j].calendars)
                        {
                            var href="/tasks/list?caldav_accounts_id="+caldav_accounts.data.message[j].account.caldav_accounts_id+"&&calendars_id="+caldav_accounts.data.message[j].calendars[i].calendars_id
                            var key=caldav_accounts.data.message[j].account.caldav_accounts_id+"-"+caldav_accounts.data.message[j].calendars[i].calendars_id
                            //<a style={{textDecoration: 'none'}} href={href}>
                            var cal=(<ListGroup.Item key={key} className="textDefault" onClick={()=>this.props.calendarNameClicked(caldav_accounts.data.message[j].account.caldav_accounts_id, caldav_accounts.data.message[j].calendars[i].calendars_id)} style={{ borderColor:caldav_accounts.data.message[j].calendars[i].calendarColor, borderLeftWidth: 10, marginBottom:10 }}>{caldav_accounts.data.message[j].calendars[i].displayName}</ListGroup.Item>)
                            calendars.push(cal)                    

                        }
                        finalOutput.push(<div key={caldav_accounts.data.message[j].account.caldav_accounts_id}>{accountInfo}<ListGroup style={{marginBottom: 10}}>{calendars}</ListGroup> </div>)
                    }


                }else{
                    this.props.router.push("/accounts/caldav?message=ADD_A_CALDAV_ACCOUNT")
                }

                this.setState({finalOutput: finalOutput})
            }else
            {
                if(caldav_accounts==null)
                {
                    toast.error(this.i18.t("ERROR_GENERIC"))
                }else{
                    var message= getMessageFromAPIResponse(caldav_accounts)
                    console.error("getCaldavAccountsfromDB", message, caldav_accounts)

                    if(message!=null)
                    {

                        if(message!=="PLEASE_LOGIN")
                        {
                            toast.error(this.i18.t(message))

                        }
                        // if(message=="PLEASE_LOGIN")
                        // {
                         
                        //     // Login required
                        //     var redirectURL="/login"
                        //     if(window!=undefined)
                        //     {


                        //         redirectURL +="?redirect="+window.location.pathname
                        //     }
                        //     this.props.router.push(redirectURL)


                        // }else{
                        //     toast.error(this.i18.t(message))

                        // }
                    }
                    else
                    {
                        toast.error(this.i18.t("ERROR_GENERIC"))

                    }

                }

            }
        })

    }

    render(){
        return(
               <>
               {this.state.finalOutput}
               {/* <Toastify /> */}
               </> 
            
        )
    }
} 

export default withRouter(ShowCalendarList)