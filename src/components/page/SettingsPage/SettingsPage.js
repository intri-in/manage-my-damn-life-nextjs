import AppBarGeneric from "@/components/common/AppBar";
import { Loading } from "@/components/common/Loading";
import { displayErrorMessageFromAPIResponse, getI18nObject } from "@/helpers/frontend/general";
import Head from "next/head";
import { Col, Container,  Row } from "react-bootstrap";
const { withRouter } = require("next/router");
const { Component } = require("react");
import { getAuthenticationHeadersforUser, logoutUser, logoutUser_withRedirect } from "@/helpers/frontend/user";
import { getAPIURL, isValidResultArray, logVar, varNotEmpty } from "@/helpers/general";
import { BACKGROUND_GRAY } from "@/config/style";
import moment from "moment";
import { caldavAccountsfromServer } from "@/helpers/frontend/calendar";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import ManageUsers from "@/components/admin/ManageUsers";
import Button from "react-bootstrap/Button";
import DefaultCalendarViewSelect from "@/components/accounts/DefaultCalendarViewSelect";
import { VERSION_NUMBER } from "@/config/constants";
import { setDefaultCalendarID } from "@/helpers/frontend/cookies";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import CalendarStartDayWeek from "@/components/settings/CalendarStartDayWeek";
import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie";
import { checkifCalendarIDPresentinDexieSummary, checkifCalendarUrlPresentinDexieSummary } from "@/helpers/frontend/dexie/dexie_helper";
import { SETTING_NAME_DEFAULT_CALENDAR } from "@/helpers/frontend/settings";
import MaintenanceTasks from "./MaintenanceTasks";
import { AutoSyncSetting } from "@/components/settings/AutoSyncSetting";
import { isDarkModeEnabled } from "@/helpers/frontend/theme";
import { TimeFormatSetting } from "./TimeFormatSetting";
import AdvancedSettings from "./AdvancedSettings";
class SettingsPage extends Component {

    constructor(props) {
        super(props)
        this.i18next = props.i18next
        this.state = { userInfo: <Loading centered={true} padding={30} /> , calendarOptions:[], calendarsFromServer :[], defaultCalendar:'', allowReg: 1, userManager: null}
        this.getUserInfo = this.getUserInfo.bind(this)
        this.getCalendarName = this.getCalendarName.bind(this)
        this.getAllUserSettings = this.getAllUserSettings.bind(this)
        this.renderAdminSettings = this.renderAdminSettings.bind(this)
        this.calendarSelected = this.calendarSelected.bind(this)
        this.getCalendarOutput = this.getCalendarOutput.bind(this)
        this.allowRegChanged = this.allowRegChanged.bind(this)
        this.caldavAccountButtonClicked = this.caldavAccountButtonClicked.bind(this)
    }
    componentDidMount() {
        this.getAllUserSettings()
        this.getUserInfo()
        this.getCalendarName()
    }
    async getAllUserSettings(){
        const url_api = getAPIURL() + "settings/get"

        const authorisationData = await getAuthenticationHeadersforUser()

        const requestOptions =
        {
            method: 'GET',
            headers: new Headers({ 'authorization': authorisationData }),
        }

            fetch(url_api, requestOptions)
            .then(response => response.json())
            .then((body) => {
                if(varNotEmpty(body) && varNotEmpty(body.success) && body.success==true)
                {
                    if(varNotEmpty(body.data.message.user) && Array.isArray(body.data.message.user))
                    {
                        for(const i in body.data.message.user)
                        {
                            if(body.data.message.user[i]["name"]=="DEFAULT_CALENDAR")
                            {
                                const defaultCalValue = body.data.message.user[i]["value"]
                                checkifCalendarUrlPresentinDexieSummary(defaultCalValue).then((resultofCheck) =>{
                                    
                                    if( resultofCheck){
                                        if (typeof window !== 'undefined') {
                                            localStorage.setItem(SETTING_NAME_DEFAULT_CALENDAR, defaultCalValue)
                                        }
                                        this.setState({defaultCalendar: defaultCalValue})
                                    }
                                })
                            }
                        }

                    }

                    if(varNotEmpty(body.data.message.admin))
                    {
                        // console.log("body.data.message.admin", body.data.message.admin)
                        for(const i in body.data.message.admin)
                        {
                            if(body.data.message.admin[i]["name"]=="GLOBAL_DISABLE_USER_REGISTRATION")
                            {
                                const value = body.data.message.admin[i]["value"]
                                let allowReg = (value && value=="0") ? 0 : 1
                               
                                this.setState({allowReg: allowReg})
                            }
                        }
                    }

                }else{
                    var message = getMessageFromAPIResponse(body)
                    console.error("getAllUserSettings", message, body)
                    // if(message==="PLEASE_LOGIN"){
                    //     logoutUser_withRedirect(this.props.router)
                    // }
                    
                }
            }).catch(e =>{
            console.error("getAllUserSettings", e)
            toast.error(this.i18next("ERROR_GETTING_SETTINGS"))

        })


    }
    caldavAccountButtonClicked()
    {
        this.props.router.push("/accounts/caldav")
    }
    async getUserInfo() {
        const url_api = getAPIURL() + "users/info"

        const authorisationData = await getAuthenticationHeadersforUser()

        const requestOptions =
        {
            method: 'GET',
            headers: new Headers({ 'authorization': authorisationData }),
        }

            fetch(url_api, requestOptions)
            .then(response => response.json())
            .then((body) => {
                if (varNotEmpty(body)) {
                    if (varNotEmpty(body.success) && body.success == true) {

                        var isAdminOutput = body.data.message.level=="1" ? (   
                        <Row>
                            <Col xs={3}>
                                <b>{this.i18next("ADMIN")}</b>
                            </Col>
                            <Col xs={9}>
                                {this.i18next("YES")}
                            </Col>
                        </Row>
                        ):null

                        var isAdmin = body.data.message.level=="1" ? true: false
                        var backGround =  isDarkModeEnabled() ? "black" : BACKGROUND_GRAY
                        var userInfo = (
                            <div style={{padding: 20, background: backGround}}>
                                <Row>
                                    <Col xs={3}>
                                        <b>{this.i18next("USERNAME")}</b>
                                    </Col>
                                    <Col xs={9}>
                                        {body.data.message.username}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col  xs={3}>
                                        <b>{this.i18next("EMAIL")}</b>
                                    </Col>
                                    <Col xs={9}>
                                        {body.data.message.email}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={3}>
                                        <b>{this.i18next("CREATED_ON")}</b>
                                    </Col>
                                    <Col xs={9}>
                                        {moment.unix(body.data.message.created).toString()}
                                    </Col>
                                </Row>
                                {isAdminOutput}

                            </div>
                        )
                            this.setState({userInfo: userInfo, isAdmin: isAdmin })
                    } else {
                        displayErrorMessageFromAPIResponse(body)
                    }
                }
                else {
                    console.error(this.i18next("ERROR_GENERIC"), body)

                }


            }).catch(e =>{
                toast.error(this.i18next("ERROR_GENERIC"))
                console.error( "getUserInfo" ,e)
            })


     
    }

    async getCalendarName(){
        // var calendarsFromServer = await caldavAccountsfromServer()
        var calendars = await getCalDAVSummaryFromDexie()
        this.setState({calendarsFromServer: calendars})

    }
    async generateCalendarList() {
    }
    async calendarSelected(e)
    {

        this.setState({defaultCalendar: e.target.value })
        if(varNotEmpty(e.target.value) && e.target.value!="")
        {
            this.updateDefaultCalendaronServer(e.target.value)
        }

    }
    async updateDefaultCalendaronServer(calendar_id)
    {
        const authorisationData = await getAuthenticationHeadersforUser()

        //Make change settings request.
        const url_api = getAPIURL() + "settings/modify"
        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({ "name": "DEFAULT_CALENDAR", "value": calendar_id}),
            mode: 'cors',
            headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        }
        fetch(url_api, requestOptions)
                .then(response =>  response.json())
                .then((body) => {
                    if(varNotEmpty(body) && varNotEmpty(body.success) && body.success==true)
                    {
                        setDefaultCalendarID(calendar_id)
                        toast.success(this.i18next("UPDATE_OK"))
                    }else{
                        toast.success(this.i18next("ERROR_GENERIC"))
                        console.log("Setting update response:")
                        console.log(body)
    

                    }
                    this.getAllUserSettings()

                }).catch (e => {
                    console.error("updateDefaultCalendaronServer",e)
                    toast.error(e.message)
            })

    }
    allowRegChanged(e)
    {
        console.log(" e.target.value",  e.target.value)
        this.setState({allowReg: e.target.value})
        this.postAllowRegChanges(e.target.value)

    }
    async postAllowRegChanges(allowReg)
    {
        // if(allowReg==1)
        // {
        //     allowReg=0
        // }else{
        //     allowReg=1
        // }
        const authorisationData = await getAuthenticationHeadersforUser()

        
        //Make change settings request.
        const url_api = getAPIURL() + "settings/modify"
        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({ "name": "GLOBAL_DISABLE_USER_REGISTRATION", "value": allowReg}),
            mode: 'cors',
            headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        }
        fetch(url_api, requestOptions)
                .then(response =>  response.json())
                .then((body) => {
                    if(varNotEmpty(body) && varNotEmpty(body.success) && body.success==true)
                    {
                        toast.success(this.i18next("UPDATE_OK"))
                    }else{
                        toast.success(this.i18next("ERROR_GENERIC"))
                        console.error("Setting update response GLOBAL_DISABLE_USER_REGISTRATION:")                
                        console.error(body)
    

                    }

                }).catch (e => {
                    toast.error(e.message)
                })


    }
    renderAdminSettings(){

        var disabled=false
        if(varNotEmpty(process.env.NEXT_PUBLIC_DISABLE_USER_REGISTRATION) && (process.env.NEXT_PUBLIC_DISABLE_USER_REGISTRATION==true || process.env.NEXT_PUBLIC_DISABLE_USER_REGISTRATION=="true" ))
        {
            disabled=true
        }
        var disabledMessage = null
        if(disabled)
        {
            disabledMessage=(<p style={{color: "red", textAlign: "center"}}>{this.i18next('USER_REG_DISABLED_FROM_ENV')}</p>)
        }
        return(
            <>
            <h2>{this.i18next("ADMIN")+ " "+this.i18next("SETTINGS")}</h2>
            <br />
            <Row style={{display: "flex", alignItems: "center"}}>
                <Col xs={3}>
                    {this.i18next("ALLOW_REGISTRATION")}
                </Col>
                <Col xs={9}>
                <Form.Select onChange={this.allowRegChanged} disabled={disabled} value={this.state.allowReg} size="sm">
                    <option value={0}>{this.i18next("NO")}</option>
                    <option value={1}>{this.i18next("YES")}</option>
                </Form.Select>
                </Col>
            </Row>
            {disabledMessage}
            <br />
            <ManageUsers i18next={this.props.i18next} />
            </>
        )

    }
    getCalendarOutput()
    {
        let calendarsFromServer = this.state.calendarsFromServer
        let calendarOutput = null
        if (isValidResultArray(calendarsFromServer)) {
            calendarOutput = []
            calendarOutput.push(<option key="calendar-select-empty" ></option>)
            for (let i = 0; i < calendarsFromServer.length; i++) {
                let tempOutput = []
                if(!isValidResultArray(calendarsFromServer[i].calendars)){
                    continue
                }
                for (let j = 0; j < calendarsFromServer[i].calendars.length; j++) {
                    let value = calendarsFromServer[i].calendars[j].url
                    let key = j + "." + value
                    tempOutput.push(<option key={key} style={{ background: calendarsFromServer[i].calendars[j].calendarColor }} value={value}>{calendarsFromServer[i].calendars[j].displayName}</option>)
                }
                calendarOutput.push(<optgroup key={calendarsFromServer[i].name} label={calendarsFromServer[i].name}>{tempOutput}</optgroup>)

            }

            return (<Form.Select key="calendarOptions" onChange={this.calendarSelected} value={this.state.defaultCalendar} >{calendarOutput}</Form.Select>) 

        }

    }
    render() {
        var adminTable = this.state.isAdmin? this.renderAdminSettings(): null
        return (
            <>
                <Container fluid>
                    <div style={{ padding: 20 }}>
                        <h1>{this.i18next("SETTINGS")}</h1>
                        <div style={{textAlign: "right"}}><Button onClick={this.caldavAccountButtonClicked} variant="outline-info">{this.i18next("MANAGE")+" "+this.i18next("CALDAV_ACCOUNTS")}</Button>{' '}</div>
                        <br />
                        <h2>{this.i18next("GENERAL_SETTINGS")}</h2>
                        <div>
                        <Row style={{display: "flex", alignItems: "center"}}>
                            <Col  xs={3}>
                                {this.i18next("DEFAULT")+ " "+this.i18next("CALENDAR")}
                            </Col>
                            <Col  xs={9}>
                                {this.getCalendarOutput()}
                            </Col>
                        </Row>
                        <br />
                        <Row style={{display: "flex", alignItems: "center"}}>
                            <Col  xs={3}>
                                {this.i18next("CALENDAR_VIEW_DEFAULT")}
                            </Col>
                            <Col  xs={9}>
                                <DefaultCalendarViewSelect />
                            </Col>
                        </Row>
                        <br />
                        <CalendarStartDayWeek />
                        </div>
                        <br />
                        <AutoSyncSetting />
                        <br />
                        <br />
                        <h2>{this.i18next("DATE_TIME_FORMAT")}</h2>
                        <TimeFormatSetting />
                        <br />
                        <br />
                        <AdvancedSettings />
                        <br />
                        <br />
                        <MaintenanceTasks />
                        <br />
                        <br />
                        <h2>{this.i18next("ACCOUNT_INFO")}</h2>
                        {this.state.userInfo}
                        <br />
                        <br />
                        {adminTable}
                        <br />
                        {this.state.userManager}

                        <p><b>{this.i18next("VERSION")}: </b>{VERSION_NUMBER}</p>

                    </div>

                </Container>
            </>
        )
    }

}


export default withRouter(SettingsPage)
