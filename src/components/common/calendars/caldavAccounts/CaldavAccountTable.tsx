import { getAllCalDavAccountsFromDexie, getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie";
import { getAllCalendarsFromCalDavAccountIDFromDexie } from "@/helpers/frontend/dexie/calendars_dexie";
import { getI18nObject } from "@/helpers/frontend/general";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { getAPIURL } from "@/helpers/general";
import { useEffect, useState } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import { toast } from "react-toastify";

interface functionalProps {

    calendarAddButtonClicked: Function;
    caldavAccountDeleteClicked:Function;
    context: any;
    makeDeleteRequest: Function;
}


export const CaldavAccountTable = (props: functionalProps) =>{
    const i18next = getI18nObject()
    const [caldavAccounts, setCalDAVAccounts ] = useState([])
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
    const [calendartoDelete, setCalendartoDelete] = useState(null)

    var output=[];
    getCalDAVSummaryFromDexie().then(response =>{
        setCalDAVAccounts(response)
    }) 
    
   
    function makeDeleteRequest(calToDelete){
        props.makeDeleteRequest(calToDelete)
    }
    function getDeleteModal(){

        var body= (
            <>
            <p>{i18next.t("DELETE_CALDAV_ACCOUNT_CONFIRMATION")}</p>
            <h3>{calendartoDelete.name}</h3>
            </>
        )
        return  (
            <>
                <Modal centered show={showDeleteAccountModal} onHide={()=> setShowDeleteAccountModal(false)}>
                    <Modal.Header closeButton>
                    </Modal.Header>
                    <Modal.Body>{body}</Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={()=> setShowDeleteAccountModal(false)}>
                    {i18next.t("BACK")}
                    </Button>
                    <Button variant="danger" onClick={()=>makeDeleteRequest(calendartoDelete.caldav_accounts_id)}>
                        {i18next.t("DELETE")}
                    </Button>
                    </Modal.Footer>
                </Modal>
    
            </>
        )
    
    
    }
    
    function caldavAccountDeleteClicked(caldavAccount){
        setCalendartoDelete(caldavAccount)
        setShowDeleteAccountModal(true)
    }

    if(caldavAccounts && Array.isArray(caldavAccounts) && caldavAccounts.length>0){

        for(const i in caldavAccounts){
            var temp_cal = []
            var calendars = caldavAccounts[i]["calendars"]
            for (const j in calendars)
            {

                var border="3px solid "+calendars[j].calendarColor
                var cal=(
                    <Col style={{borderBottom:border,  borderRadius:10, margin: 5 }}><p className="textDefault">{calendars[j].displayName}</p></Col>
                    )     
                    temp_cal.push(cal)                    
            }
            
//                console.log("allCals", allCals)
            output.push
            (
            <div key={"cal_"+caldavAccounts[i].name} style={{background: "#f5f5f5", borderRadius: 10, padding: 20, margin: 10, marginBottom: 30 }}>
                <Row>
                    <Col>
                    <h1>{caldavAccounts[i].name}</h1>
                    </Col>
                    <Col onClick={()=> caldavAccountDeleteClicked(caldavAccounts[i])} style={{textAlign: "right", color:"red"}}><AiOutlineDelete /></Col>
                </Row>
                    <p>{
                    caldavAccounts[i].url
                }</p>
                    <h2>{i18next.t("CALENDARS")} <AiOutlinePlusCircle onClick={()=>props.calendarAddButtonClicked(caldavAccounts[i])} /></h2>
                    <Row>{temp_cal}
                    </Row>
                                                

            </div>
            )

        }
        

    }
    
    

    if(output.length == 0){
        return i18next.t("NOTHING_TO_SHOW")
    } 
    return(
        <>
        {output}
        {showDeleteAccountModal? getDeleteModal(): null}
        </>
    )
}

