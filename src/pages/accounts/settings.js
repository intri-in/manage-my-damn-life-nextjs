import AppBarGeneric from "@/components/common/AppBarGeneric";
import { Loading } from "@/components/common/Loading";
import { displayErrorMessageFromAPIResponse, getI18nObject } from "@/helpers/frontend/general";
import Head from "next/head";
import { Col, Container, ProgressBar, Row } from "react-bootstrap";
import Placeholder from 'react-bootstrap/Placeholder';
const { withRouter } = require("next/router");
const { Component } = require("react");
import Card from 'react-bootstrap/Card';
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { isValidResultArray, varNotEmpty } from "@/helpers/general";
import { BACKGROUND_GRAY } from "@/config/style";
import moment from "moment";
import { caldavAccountsfromServer } from "@/helpers/frontend/calendar";
import { Form } from "react-bootstrap";
class Settings extends Component {

    constructor(props) {
        super(props)
        this.i18next = getI18nObject()
        this.state = { userInfo: <Loading centered={true} padding={30} /> , calendarOptions:[], calendarsFromServer :[]}
        this.getUserInfo = this.getUserInfo.bind(this)
        this.getCalendarName = this.getCalendarName.bind(this)
        this.getAllUserSettings = this.getAllUserSettings.bind(this)
    }
    componentDidMount() {
        this.getUserInfo()
        this.getCalendarName()
        this.generateCalendarList()
        this.getAllUserSettings()
    }
    getAllUserSettings(){

    }
    async getUserInfo() {
        const url_api = process.env.NEXT_PUBLIC_API_URL + "users/info"

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

                        var isAdmin = body.data.message.level=="1" ? (   
                        <Row>
                            <Col xs={3}>
                                <b>{this.i18next.t("ADMIN")}</b>
                            </Col>
                            <Col xs={9}>
                                {this.i18next.t("YES")}
                            </Col>
                        </Row>
                        ):null

                        var userInfo = (
                            <div style={{padding: 20, background: BACKGROUND_GRAY}}>
                                <Row>
                                    <Col xs={3}>
                                        <b>{this.i18next.t("USERNAME")}</b>
                                    </Col>
                                    <Col xs={9}>
                                        {body.data.message.username}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col Col xs={3}>
                                        <b>{this.i18next.t("EMAIL")}</b>
                                    </Col>
                                    <Col xs={9}>
                                        {body.data.message.email}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col Col xs={3}>
                                        <b>{this.i18next.t("CREATED_ON")}</b>
                                    </Col>
                                    <Col xs={9}>
                                        {moment.unix(body.data.message.created).toString()}
                                    </Col>
                                </Row>
                                {isAdmin}

                            </div>
                        )
                            this.setState({userInfo: userInfo})
                    } else {
                        displayErrorMessageFromAPIResponse(body)
                    }
                }
                else {
                    toast.error(this.state.i18next.t("ERROR_GENERIC"))

                }


            });


     
    }

    async getCalendarName(){
        var calendarsFromServer = await caldavAccountsfromServer()
        this.setState({calendarsFromServer: calendarsFromServer})
        var calendarOutput = null
        if (isValidResultArray(calendarsFromServer)) {
            calendarOutput = []
            calendarOutput.push(<option key="calendar-select-empty" ></option>)
            for (let i = 0; i < calendarsFromServer.length; i++) {
                var tempOutput = []

                for (let j = 0; j < calendarsFromServer[i].calendars.length; j++) {
                    var value = calendarsFromServer[i].calendars[j].calendars_id
                    var key = j + "." + value
                    tempOutput.push(<option key={key} style={{ background: calendarsFromServer[i].calendars[j].calendarColor }} value={value}>{calendarsFromServer[i].calendars[j].displayName}</option>)
                }
                calendarOutput.push(<optgroup key={calendarsFromServer[i].account.name} label={calendarsFromServer[i].account.name}>{tempOutput}</optgroup>)

            }

            this.setState({ calendarOptions: (<Form.Select key="calendarOptions" onChange={this.calendarSelected} value={this.state.calendar_id}  >{calendarOutput}</Form.Select>) })

        }

    }
    async generateCalendarList() {
    }
    render() {


        return (
            <>
                <Head>
                    <title>{this.i18next.t("APP_NAME_TITLE") + " - " + this.i18next.t("SETTINGS")}</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <AppBarGeneric />
                <Container fluid>
                    <div style={{ padding: 20 }}>
                        <h1>{this.i18next.t("SETTINGS")}</h1>
                        <br />
                        <h2>{this.i18next.t("ACCOUNT_INFO")}</h2>
                        {this.state.userInfo}
                        <br />
                        <Row style={{display: "flex", alignItems: "center"}}>
                            <Col Col xs={3}>
                                {this.i18next.t("DEFAULT")+ " "+this.i18next.t("CALENDAR")}
                            </Col>
                            <Col Col xs={3}>
                                {this.state.calendarOptions}
                            </Col>
                        </Row>
                    </div>

                </Container>
            </>
        )
    }

}


export default withRouter(Settings)
