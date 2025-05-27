import React, { useState, useEffect } from "react";
import { Button, Col, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import AddCaldavAccount from "./AddCaldavAccount";
import AddNewCalendar from "../AddNewCalendar";
import { CaldavAccountTable } from "./CaldavAccountTable";
import { IoSyncCircleOutline } from "react-icons/io5";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import { useTranslation } from "next-i18next";

import {
  fetchLatestEventsV2,
  refreshCalendarListV2,
} from "@/helpers/frontend/sync";
import {
  deleteCalDAVAccountFromDexie,
  getAllCalDavAccountsFromDexie,
} from "@/helpers/frontend/dexie/caldav_dexie";
import { getAllCalendarsFromCalDavAccountIDFromDexie } from "@/helpers/frontend/dexie/calendars_dexie";
import { clearDexieDB } from "@/helpers/frontend/dexie/dexie_helper";
import { checkifCurrentUserInDexie, getUserIDForCurrentUser_Dexie } from "@/helpers/frontend/dexie/users_dexie";
import { Loading } from "../../Loading";
import { PRIMARY_COLOUR } from "@/config/style";
import { getAPIURL } from "@/helpers/general";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { useSession } from "next-auth/react";


export default function CaldavAccount({  }) {
//   const [addedAccounts, setAddedAccounts] = useState(t("NOTHING_TO_SHOW"));
  const {t} = useTranslation()
  const [addAccountScreenVisible, setAddAccountScreenVisible] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showAddCalendarModal, setShowAddCalendarModal] = useState(false);
  const [addCalendarModalBody, setAddCalendarModalBody] = useState(<></>);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [calendarToDelete, setCalendarToDelete] = useState(null);
  const [deleteAccountModal, setDeleteAccountModal] = useState(<></>);
  const [updated, setUpdated] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const queryString = window.location.search;
      const params = new URLSearchParams(queryString);
      const message = params.get("message");
      if (message) {
        toast.info(t(message));
      }
    }
  }, []);

  const refreshCalendarListPage = async () => {
    await refreshCalendarListV2();
    setUpdated(Date.now());
  };

  const syncButtonClicked = async () => {
    setShowLoading(true);
    toast.info(t("REFRESHING_CALENDAR_LIST"));
    // await clearDexieDB();
    // await checkifCurrentUserInDexie(session);
    await refreshCalendarListPage();
    setShowLoading(false);
    setUpdated(Date.now());
  };

  const calendarAddButtonClicked = (calendarData) => {
    setShowAddCalendarModal(true);
    setAddCalendarModalBody(
      <AddNewCalendar
        i18next={t}
        onClose={addCalendarModalHidden}
        caldav_accounts_id={calendarData.caldav_accounts_id}
        onResponse={addCalendarResponse}
        accountName={calendarData.name}
      />
    );
  };

  const addCalendarResponse = (response) => {
    if (
      response &&
      response.success &&
      response.data.message[0].status >= 200 &&
      response.data.message[0].status < 300
    ) {
      toast.success(t("CALENDAR_ADDED_SUCCESSFULLY."));
    } else {
      toast.error(t("ERROR_ADDING_CALENDER."));
      console.warn(response);
    }
    refreshCalendarListPage();
    fetchLatestEventsV2(true);
    setShowAddCalendarModal(false);
  };

  const addCalendarModalHidden = () => {
    setShowAddCalendarModal(false);
    setUpdated(Date.now());
  };

//   const renderCaldavAccountsFromDexie = async() => {
//     const userid = await getUserIDForCurrentUser_Dexie()
//     getAllCalDavAccountsFromDexie(userid).then((caldavAccounts) => {
//       if (caldavAccounts && Array.isArray(caldavAccounts) && caldavAccounts.length > 0) {
//         const output = caldavAccounts.map((account, index) => {
//           const calendars:JSX.Element[] = [];
//           getAllCalendarsFromCalDavAccountIDFromDexie(account.caldav_accounts_id).then((allCals) => {
//             allCals.forEach((cal) => {
//               const border = `3px solid ${cal.calendarColor}`;
//               calendars.push(
//                 <Col
//                   key={cal.calendars_id!}
//                   style={{ borderBottom: border, borderRadius: 10, margin: 5 }}
//                 >
//                   <p className="textDefault">{cal.displayName}</p>
//                 </Col>
//               );
//             });
//           });
//           return (
//             <div
//               key={index}
//               style={{
//                 background: "#f5f5f5",
//                 borderRadius: 10,
//                 padding: 20,
//                 margin: 10,
//                 marginBottom: 30,
//               }}
//             >
//               <Row>
//                 <Col>
//                   <h1>{account.name}</h1>
//                 </Col>
//                 <Col
//                   onClick={() => caldavAccountDeleteClicked(account)}
//                   style={{ textAlign: "right", color: "red" }}
//                 >
//                   <AiOutlineDelete />
//                 </Col>
//               </Row>
//               <p>{account.url}</p>
//               <h2>
//                 {t("CALENDARS")}{" "}
//                 <AiOutlinePlusCircle
//                   onClick={() => calendarAddButtonClicked(account)}
//                 />
//               </h2>
//               <Row>{calendars}</Row>
//             </div>
//           );
//         });

//         setAddedAccounts(output.length > 0 ? output : t("NOTHING_TO_SHOW"));
//       } else {
//         setAddedAccounts(t("NOTHING_TO_SHOW"));
//       }
//     });
//   };

  const showAddAccountModal = () => {
    setAddAccountScreenVisible(!addAccountScreenVisible);
  };

  const onAccountAddSuccess = () => {
    toast.success(t("CALDAV_ACCOUNT_ADDED_SUCCESSFULLY"));
    setAddAccountScreenVisible(false);
    setUpdated(Date.now());
    refreshCalendarListPage();
    fetchLatestEventsV2();
  };

  const onAddAccountDismissed = () => {
    setAddAccountScreenVisible(false);
  };

  const makeDeleteRequest  = async (caldav_account_id) => {
    const url_api = getAPIURL() + "v2/caldav/delete?caldav_account_id=" + caldav_account_id

    const authorisationData = await getAuthenticationHeadersforUser()
    const requestOptions =
    {
        method: 'DELETE',
        mode: 'cors',
        headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
    }

    const deleteCaldavModalHidden = () =>{
        setShowDeleteAccountModal(false)
        setCalendarToDelete(null)
    }
    const response = await fetch(url_api, requestOptions as RequestInit)
        .then(response => response.json())
        .then((body) => {
            // console.log("body", body)
            if (body != null && body.success != null) {
                var message = getMessageFromAPIResponse(body)

                if (body.success == true) {
                    //Delete CalDavFromDexie
                    deleteCalDAVAccountFromDexie(caldav_account_id)
                    deleteCaldavModalHidden()
                    toast.success(t(message))

                    refreshCalendarListPage()
                } else {

                    toast.error(t(message))

                }
            } else {
                toast.error(t("ERROR_GENERIC"))
            }


        }).catch(e => {
            // this.props.onResponse(e.message)
            console.log(e)
        })



}


  const syncButton = showLoading ? (
    <Loading centered={true} />
  ) : (
    <>
      <span onClick={syncButtonClicked}>{t("FORCE_SYNC")}</span>
      &nbsp;
      <IoSyncCircleOutline size={24} onClick={syncButtonClicked} />
    </>
  );

  if (addAccountScreenVisible) {
    return (
      <AddCaldavAccount
        onAddAccountDismissed={onAddAccountDismissed}
        onAccountAddSuccess={onAccountAddSuccess}
      />
    );
  } else {
    return (
      <>
        <Row>
          <Col>
            <h1>{t("CALDAV_ACCOUNTS")}</h1>
          </Col>
        </Row>
        <br />
        <Row>
          <Col style={{ textAlign: "right", margin: 20 }}>
            <Button onClick={showAddAccountModal}>{t("ADD")}</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <h2>{t("YOUR_ACCOUNTS")}</h2>
          </Col>
        </Row>
        <div style={{ textAlign: "right", color: PRIMARY_COLOUR, margin: 20 }}>
          {syncButton}
        </div>
        <Row style={{ margin: 20 }}>
          <Col>
            <CaldavAccountTable
              updated={updated}
              context={null}
              calendarAddButtonClicked={calendarAddButtonClicked}
              makeDeleteRequest={makeDeleteRequest}
            />
          </Col>
        </Row>
        <br />
        <Modal
          centered
          show={showAddCalendarModal}
          onHide={addCalendarModalHidden}
        >
          <Modal.Header closeButton></Modal.Header>
          <Modal.Body>{addCalendarModalBody}</Modal.Body>
        </Modal>
        {deleteAccountModal}
      </>
    );
  }
}