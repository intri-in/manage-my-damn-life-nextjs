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
import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie";
class ShowCalendarList extends Component{
    constructor(props)
    {
        super(props)
        this.i18 = getI18nObject()
        this.state = {finalOutput: null}
        this.getCaldavAccountsfromDB = this.getCaldavAccountsfromDB.bind(this)
        this.showAddCalendarScreen= this.showAddCalendarScreen.bind(this)
        this.addCalendarResponse = this.addCalendarResponse.bind(this)
        this.renderCalendarList = this.renderCalendarList.bind(this)
        this.getCaldavAccountsfromDexie = this.getCaldavAccountsfromDexie.bind(this)
    }
    componentDidMount()
    {
        //this.getCaldavAccountsfromDB()
        this.getCaldavAccountsfromDexie()
    }
    showAddCalendarScreen(caldav_account)
    {
        // console.log(caldav_account)
        this.setState({finalOutput: <AddNewCalendar onClose={()=>this.getCaldavAccountsfromDexie()} caldav_accounts_id={caldav_account.caldav_accounts_id} onResponse={this.addCalendarResponse} accountName={caldav_account.name} />})
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
        this.getCaldavAccountsfromDexie()

    }

    async getCaldavAccountsfromDexie(){
        const caldavSummary = await getCalDAVSummaryFromDexie()
        this.renderCalendarList(caldavSummary)
    }

    async renderCalendarList(caldavSummary){
        var finalOutput= []
        for(let j=0; j<caldavSummary.length; j++)
        {
            var accountInfo=(
                <Row>
                    <Col className="defaultTex">
                        {caldavSummary[j].name}

                    </Col>
                    <Col style={{textAlign: "right"}}><AiOutlinePlusCircle onClick={(e)=> this.showAddCalendarScreen(caldavSummary[j])} /></Col>
                </Row>
            )
            var calendars=[]
            if(!caldavSummary[j].calendars){
                continue
            }
            for (const i in caldavSummary[j].calendars)
            {
                var href="/tasks/list?caldav_accounts_id="+caldavSummary[j].caldav_accounts_id+"&&calendars_id="+caldavSummary[j].calendars[i].calendars_id
                var key=caldavSummary[j].caldav_accounts_id+"-"+caldavSummary[j].calendars[i].calendars_id
                // console.log(key)
                //<a style={{textDecoration: 'none'}} href={href}>
                var cal=(<ListGroup.Item key={key} className="textDefault" onClick={()=>this.props.calendarNameClicked(caldavSummary[j].caldav_accounts_id, caldavSummary[j].calendars[i].calendars_id)} style={{ borderColor:caldavSummary[j].calendars[i].calendarColor, borderLeftWidth: 10, marginBottom:10 }}>{caldavSummary[j].calendars[i].displayName}</ListGroup.Item>)
                calendars.push(cal)                    

            }
            finalOutput.push(<div key={caldavSummary[j].caldav_accounts_id}>{accountInfo}<ListGroup style={{marginBottom: 10}}>{calendars}</ListGroup> </div>)
            this.setState({finalOutput: finalOutput})

        }
    }
    async getCaldavAccountsfromDB()
    {
        // getCaldavAccountsfromServer().then((caldav_accounts) =>
        // {
        //     if(caldav_accounts!=null && caldav_accounts.success==true)
        //     {
        //         if(caldav_accounts.data.message.length>0)
        //         {

        //             this.renderCalendarList(caldav_accounts.data.message)


        //         }else{
        //             this.props.router.push("/accounts/caldav?message=ADD_A_CALDAV_ACCOUNT")
        //         }

        //     }else
        //     {
        //         if(caldav_accounts==null)
        //         {
        //             toast.error(this.i18.t("ERROR_GENERIC"))
        //         }else{
        //             var message= getMessageFromAPIResponse(caldav_accounts)
        //             console.error("getCaldavAccountsfromDB", message, caldav_accounts)

        //             if(message!=null)
        //             {

        //                 if(message!=="PLEASE_LOGIN")
        //                 {
        //                     toast.error(this.i18.t(message))

        //                 }
        //                 // if(message=="PLEASE_LOGIN")
        //                 // {
                         
        //                 //     // Login required
        //                 //     var redirectURL="/login"
        //                 //     if(window!=undefined)
        //                 //     {


        //                 //         redirectURL +="?redirect="+window.location.pathname
        //                 //     }
        //                 //     this.props.router.push(redirectURL)


        //                 // }else{
        //                 //     toast.error(this.i18.t(message))

        //                 // }
        //             }
        //             else
        //             {
        //                 toast.error(this.i18.t("ERROR_GENERIC"))

        //             }

        //         }

        //     }
        // })

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