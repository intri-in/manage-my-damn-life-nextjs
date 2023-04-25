import { getAllAddedCaldavAccounts } from "@/helpers/frontend/caldavaccountspage";
import { Component } from "react";
import { Button, Col, Row } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';
import { getI18nObject } from '@/helpers/frontend/general';
import AddCaldavAccount from "./AddCaldavAccount";
import { getCaldavAccountsfromServer } from "@/helpers/frontend/calendar";
import Alert from 'react-bootstrap/Alert';
import { fetchLatestEvents, refreshCalendarList } from "@/helpers/frontend/sync";
import { IoSyncCircleOutline } from "react-icons/io5";
import { PRIMARY_COLOUR } from "@/config/style";
import { toast } from "react-toastify";
import { Toastify } from "@/components/Generic";
import { Loading } from "../../Loading";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import AddNewCalendar from "../AddNewCalendar";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { getAPIURL } from "@/helpers/general";

export default class CaldavAccounts extends Component{
    constructor(props)
    {
        super(props)
        var i18n = getI18nObject()
        this.i18next = i18n
        this.state = {addedAccounts : null, i18n: i18n, addAccountScreenisVisible: false, showLoading: false, showAddCalendarModal: false, addCalendarModalBody: null, showDeleteAccountModal: false, calendartoDelete: null, }

        this.getCaldavAccountsfromDB = this.getCaldavAccountsfromDB.bind(this)
        this.showAddAccountModal = this.showAddAccountModal.bind(this)
        this.getCaldavAccountsfromDB()
        this.onAccountAddSuccess = this.onAccountAddSuccess.bind(this)
        this.syncButtonClicked = this.syncButtonClicked.bind(this)
        this.onAddAccountDismissed = this.onAddAccountDismissed.bind(this)
        this.calendarAddButtonClicked = this.calendarAddButtonClicked.bind(this)
        this.addCalendarModalHidden = this.addCalendarModalHidden.bind(this)
        this.addCalendarResponse = this.addCalendarResponse.bind(this)
        this.getDeleteAccountModal = this.getDeleteAccountModal.bind(this)
        this.deleteCaldavModalHidden = this.deleteCaldavModalHidden.bind(this)
        this.makeDeleteRequest = this.makeDeleteRequest.bind(this)

    }

    componentDidMount(){
        if(window!=undefined){
            const queryString = window.location.search;
            const params = new URLSearchParams(queryString);
            var message= params.get('message')
            if(message!=null && message!=undefined)
            {
                toast.info(this.i18next.t(message))
            }

        }
    }
    async syncButtonClicked()
    {
        this.setState({showLoading: true})
        toast.info(this.i18next.t("REFRESHING_CALENDAR_LIST"))

        this.getCaldavAccountsfromDB()
        var refresh = await refreshCalendarList()
        this.setState({showLoading: false})
    }
    caldavAccountDeleteClicked(calendarData)
    {
        this.setState({showDeleteAccountModal: true, calendartoDelete: calendarData})
    }
    calendarAddButtonClicked(calendarData)
    {
        console.log(calendarData)
        this.setState({showAddCalendarModal: true, addCalendarModalBody: (
            <AddNewCalendar onClose={this.addCalendarModalHidden} caldav_accounts_id={calendarData.account.caldav_accounts_id} onResponse={this.addCalendarResponse} accountName={calendarData.account.name} />
        )})
    }
    addCalendarResponse(response)
    {
        if(response!=null && response.success!= null && response.success==true && response.data.message[0].status>=200 && response.data.message[0].status<300)
        {
            // Successful creation.
            toast.success(this.i18next.t("CALENDAR_ADDED_SUCCESSFULLY."))
        }
        else
        {
            toast.error(this.i18next.t("ERROR_ADDING_CALENDER."))
            console.log(response)
        }
        refreshCalendarList().then((response) =>{
            this.getCaldavAccountsfromDB()
        }) 
        this.setState({showAddCalendarModal: false})

    }

    addCalendarModalHidden()
    {
        this.setState({showAddCalendarModal: false})

    }
    async getCaldavAccountsfromDB()
    {

        getCaldavAccountsfromServer().then((caldav_accounts) =>
        {

            if(caldav_accounts!=null && caldav_accounts.success==true)
            {
                if(caldav_accounts.data.message.length>0)
                {
                    var output=[];
                   /* output.push(<Row  style={{padding: 30}}>
                        <Col>
                            <b>No.</b>
                        </Col>
                        <Col>
                            <b>Name</b>
                        </Col>
                        <Col>
                            <b>Url</b>
                        </Col>
                        <Col>
                            <b>Calendars</b>
                        </Col>
                        <Col>
                        </Col>
                    </Row>)
                    */
                    for(let j=0; j<caldav_accounts.data.message.length; j++)
                    {
                        var calendars=[]
                        for (const i in caldav_accounts.data.message[j].calendars)
                        {
                            var border="3px solid "+caldav_accounts.data.message[j].calendars[i].calendarColor
                            var cal=(
                                <Col style={{borderBottom:border,  borderRadius:10, margin: 5 }}><p className="textDefault">{caldav_accounts.data.message[j].calendars[i].displayName}</p></Col>
                                )     
                                calendars.push(cal)                    
                        }
                       output.push
                       (
                        <div style={{background: "#f5f5f5", borderRadius: 10, padding: 20, margin: 10, marginBottom: 30 }}>
                            <Row>
                                <Col>
                                <h1>{caldav_accounts.data.message[j].account.name}</h1>
                                </Col>
                                <Col onClick={()=>this.caldavAccountDeleteClicked(caldav_accounts.data.message[j])} style={{textAlign: "right", color:"red"}}><AiOutlineDelete /></Col>
                            </Row>
                                <p>{
                                caldav_accounts.data.message[j].account.url
                            }</p>
                                <h2>{this.i18next.t("CALENDARS")} <AiOutlinePlusCircle onClick={()=>this.calendarAddButtonClicked(caldav_accounts.data.message[j])} /></h2>
                                <Row>{calendars}
                                </Row>
                                                            

                        </div>
                       )
                      
                    }
                    this.setState({addedAccounts: output})
                }else
                {
                    //Get 
    
                    this.setState({addedAccounts: this.state.i18n.t("NO_CALDAV_ACCOUNTS_TO_SHOW")})
                }
            }else{
                this.setState({addedAccounts: this.state.i18n.t(caldav_accounts.data.message)})
            }
            
        })
    }

    showAddAccountModal(visible)
    {
        this.setState((prevState, props) => ({
            addAccountScreenisVisible: !prevState.addAccountScreenisVisible 
          }));    }

    onAccountAddSuccess()
    {

        toast.success(this.i18next.t("CALDAV_ACCOUNT_ADDED_SUCCESSFULLY"))
        this.getCaldavAccountsfromDB()
        fetchLatestEvents()
        this.setState({ addAccountScreenisVisible: false})

    }
    onAddAccountDismissed()
    {
        this.setState({addAccountScreenisVisible: false})
    }
    deleteCaldavModalHidden(){
        this.setState({showDeleteAccountModal: false, calendartoDelete:null})
    }
    async makeDeleteRequest(caldav_account_id)
    {
        const url_api=getAPIURL()+"caldav/delete?caldav_account_id="+caldav_account_id

        const authorisationData=await getAuthenticationHeadersforUser()
        const requestOptions =
        {
            method: 'DELETE',
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData, 'Content-Type':'application/json'}),
        }
        try    
        {
            const response = await fetch(url_api, requestOptions)
        .then(response => response.json())
        .then((body) =>{
            if(body!=null && body.success!=null)
            {
                var message = getMessageFromAPIResponse(body)

                if(body.success==true)
                {
                    toast.success(this.i18next.t(message))

                    this.setState({showDeleteAccountModal: false, calendartoDelete: null})
                    this.getCaldavAccountsfromDB()
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
            this.props.onResponse(e.message)
        }


    }
    getDeleteAccountModal(){


        var body= this.state.calendartoDelete==null ? null :(
            <>
            <p>{this.i18next.t("DELETE_CALDAV_ACCOUNT_CONFIRMATION")}</p>
            <h3>{this.state.calendartoDelete.account.name}</h3>
            <b>{this.i18next.t("Total") +" "+ this.i18next.t("CALENDARS").toLowerCase()} : {this.state.calendartoDelete.calendars.length}</b>
            </>
        )
        return this.state.calendartoDelete==null? null: (
            <>
                <Modal centered show={this.state.showDeleteAccountModal} onHide={this.deleteCaldavModalHidden}>
                    <Modal.Header closeButton>
                    </Modal.Header>
                    <Modal.Body>{body}</Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={this.deleteCaldavModalHidden}>
                    {this.i18next.t("BACK")}
                    </Button>
                    <Button variant="danger" onClick={()=>this.makeDeleteRequest(this.state.calendartoDelete.account.caldav_accounts_id)}>
                        {this.i18next.t("DELETE")}
                    </Button>
                    </Modal.Footer>
                </Modal>

            </>
        )
    }
    render(){
        if(this.state.addAccountScreenisVisible)
        {
            return (
                <AddCaldavAccount onAddAccountDismissed={this.onAddAccountDismissed} onAccoundAddSuccess={this.onAccountAddSuccess} />
            )
        }
        else
        {
            var syncButton = this.state.showLoading ? (<div ><Loading /></div>) : (<IoSyncCircleOutline size={24} onClick={this.syncButtonClicked} />)

            var deleteAccountModal = this.getDeleteAccountModal()
            return(
                <>
                <Row>
                    <Col>
                    <h1>{this.i18next.t("CALDAV_ACCOUNTS")}</h1>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col style={{textAlign: 'right', margin: 20}}>
                    <Button onClick={this.showAddAccountModal} >{this.state.i18n.t("ADD")}</Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                    <h2>Your Accounts</h2>
                    </Col>
                </Row>
                <div style={{textAlign: 'right', color: PRIMARY_COLOUR, margin: 20}}>{syncButton}</div> 
                

                <Row style={{ margin: 20}}>
                    <Col>
                    {this.state.addedAccounts}
                    </Col>
                </Row>
                <br />
                {/* <Toastify /> */}
                <Modal centered show={this.state.showAddCalendarModal} onHide={this.addCalendarModalHidden}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>{this.state.addCalendarModalBody}</Modal.Body>
                </Modal>
                {deleteAccountModal}
                </>
            )
        }
       
    }
}