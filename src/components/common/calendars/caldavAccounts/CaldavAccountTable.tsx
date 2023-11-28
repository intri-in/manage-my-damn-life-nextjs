import { getAllCalDavAccountsFromDexie, getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie";
import { getAllCalendarsFromCalDavAccountIDFromDexie, updateCalendarColourbyID_Dexie } from "@/helpers/frontend/dexie/calendars_dexie";
import { getI18nObject } from "@/helpers/frontend/general";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { getAPIURL } from "@/helpers/general";
import { useEffect, useState } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import ColourPicker from "../../ColourPIcker";

interface functionalProps {

    calendarAddButtonClicked: Function;
    caldavAccountDeleteClicked: Function;
    context: any;
    makeDeleteRequest: Function;
}


export const CaldavAccountTable = (props: functionalProps) => {
    const i18next = getI18nObject()
    const [caldavAccounts, setCalDAVAccounts] = useState([])
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
    const [calendartoDelete, setCalendartoDelete] = useState(null)
    const [updated, setUpdatedVal] = useState(Date.now())

    var output = [];
    useEffect(() => {
        getCalDAVSummaryFromDexie().then(response => {
            setCalDAVAccounts(response)
        })
    }, [updated])

    function makeDeleteRequest(calToDelete) {
        setShowDeleteAccountModal(false)
        props.makeDeleteRequest(calToDelete)
    }
    function getDeleteModal() {

        var body = (
            <>
                <p>{i18next.t("DELETE_CALDAV_ACCOUNT_CONFIRMATION")}</p>
                <h3>{calendartoDelete.name}</h3>
            </>
        )
        return (
            <>
                <Modal centered show={showDeleteAccountModal} onHide={() => setShowDeleteAccountModal(false)}>
                    <Modal.Header closeButton>
                    </Modal.Header>
                    <Modal.Body>{body}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteAccountModal(false)}>
                            {i18next.t("BACK")}
                        </Button>
                        <Button variant="danger" onClick={() => makeDeleteRequest(calendartoDelete.caldav_accounts_id)}>
                            {i18next.t("DELETE")}
                        </Button>
                    </Modal.Footer>
                </Modal>

            </>
        )


    }

    function caldavAccountDeleteClicked(caldavAccount) {
        setCalendartoDelete(caldavAccount)
        setShowDeleteAccountModal(true)
    }

    function calendarColourChanged(newColour, keyName) {
        console.log(newColour, keyName)
        if (newColour && keyName) {
            //Make update Calendar Colour Request.
            updateCalendarColourbyID_Dexie(keyName, newColour).then(resultofUpdate => {
                toast.success(i18next.t("UPDATE_OK"))
                setUpdatedVal(Date.now())
            })
        }
    }
    if (caldavAccounts && Array.isArray(caldavAccounts) && caldavAccounts.length > 0) {

        for (const i in caldavAccounts) {
            var temp_cal = []
            var calendars = caldavAccounts[i]["calendars"]
            for (const j in calendars) {
                var border = "3px solid " + calendars[j].calendarColor
                var cal = (
                    <Row key={calendars[j].displayName} xs={5} style={{ border: border, borderRadius: 10, margin: 5, padding: 5 }}>
                        <Col>
                            <h5 className="textDefault">{calendars[j].displayName}</h5>
                        </Col>
                        <Col className="d-flex justify-content-center">
                            <ColourPicker onChange={calendarColourChanged} colour={calendars[j].calendarColor} keyName={calendars[j].calendars_id} />
                        </Col>

                    </Row>
                )
                temp_cal.push(cal)
            }

            //                console.log("allCals", allCals)
            output.push
                (
                    <div key={"cal_" + caldavAccounts[i].name} style={{ background: "#f5f5f5", borderRadius: 10, padding: 20, margin: 10, marginBottom: 30 }}>
                        <Row>
                            <Col>
                                <h1>{caldavAccounts[i].name}</h1>
                            </Col>
                            <Col onClick={() => caldavAccountDeleteClicked(caldavAccounts[i])} style={{ textAlign: "right", color: "red" }}><AiOutlineDelete /></Col>
                        </Row>
                        <p>{
                            caldavAccounts[i].url
                        }</p>
                        <h2>{i18next.t("CALENDARS")} <AiOutlinePlusCircle onClick={() => props.calendarAddButtonClicked(caldavAccounts[i])} /></h2>
                        <Row>{temp_cal}
                        </Row>


                    </div>
                )

        }


    }



    if (output.length == 0) {
        return i18next.t("NOTHING_TO_SHOW")
    }
    return (
        <>
            {output}
            {showDeleteAccountModal ? getDeleteModal() : null}
        </>
    )
}

