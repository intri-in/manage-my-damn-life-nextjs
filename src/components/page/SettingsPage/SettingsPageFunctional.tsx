import AppBarGeneric from "@/components/common/AppBar";
import { Loading } from "@/components/common/Loading";
import {
  displayErrorMessageFromAPIResponse,
  getI18nObject,
} from "@/helpers/frontend/general";
import Head from "next/head";
import { Col, Container, Form, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  getAuthenticationHeadersforUser,
  logoutUser_withRedirect,
} from "@/helpers/frontend/user";
import {
  getAPIURL,
  isValidResultArray,
  varNotEmpty,
} from "@/helpers/general";
import { BACKGROUND_GRAY } from "@/config/style";
import moment from "moment";
import { toast } from "react-toastify";
import ManageUsers from "@/components/admin/ManageUsers";
import DefaultCalendarViewSelect from "@/components/accounts/DefaultCalendarViewSelect";
import { VERSION_NUMBER } from "@/config/constants";
import { setDefaultCalendarID } from "@/helpers/frontend/cookies";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie";
import { checkifCalendarUrlPresentinDexieSummary } from "@/helpers/frontend/dexie/dexie_helper";
import { SETTING_NAME_DEFAULT_CALENDAR } from "@/helpers/frontend/settings";
import MaintenanceTasks from "./MaintenanceTasks";
import { AutoSyncSetting } from "@/components/settings/AutoSyncSetting";
import { isDarkModeEnabled } from "@/helpers/frontend/theme";
import { TimeFormatSetting } from "./TimeFormatSetting";
import AdvancedSettings from "./AdvancedSettings";
import ToastSettings from "./ToastSettings";
import CalendarStartDayWeek from "@/components/settings/CalendarStartDayWeek";
import { Caldav_Summary } from "@/types/generic";
 
interface SettingsPageProps {
  i18next: (key: string) => string;
  registrationDisabledFromEnv: boolean
}
 
interface CalendarSummary {
  name: string;
  calendars: {
    url: string;
    calendarColor: string;
    displayName: string;
  }[];
}
 
const SettingsPage: React.FC<SettingsPageProps> = ({ i18next, registrationDisabledFromEnv }) => {
  const router = useRouter();
 
  const [userInfo, setUserInfo] = useState<React.ReactNode>(
    <Loading centered={true} padding={30} />
  );
  const [calendarsFromServer, setCalendarsFromServer] = useState<
    Caldav_Summary[]
  >([]);
  const [defaultCalendar, setDefaultCalendar] = useState<string>("");
  const [allowReg, setAllowReg] = useState<number>(1);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
 
  useEffect(() => {
    getAllUserSettings();
    getUserInfo();
    getCalendarName();
  }, []);
 
  async function getAllUserSettings() {
    const url_api = getAPIURL() + "settings/get";
    const authorisationData = await getAuthenticationHeadersforUser();
 
    const requestOptions: RequestInit = {
      method: "GET",
      headers: new Headers({ authorization: authorisationData }),
    };
 
    fetch(url_api, requestOptions)
      .then((response) => response.json())
      .then((body) => {
        if (varNotEmpty(body) && varNotEmpty(body.success) && body.success === true) {
          if (
            varNotEmpty(body.data.message.user) &&
            Array.isArray(body.data.message.user)
          ) {
            for (const item of body.data.message.user) {
              if (item["name"] === "DEFAULT_CALENDAR") {
                const defaultCalValue = item["value"];
                checkifCalendarUrlPresentinDexieSummary(defaultCalValue).then(
                  (resultofCheck) => {
                    if (resultofCheck) {
                      if (typeof window !== "undefined") {
                        localStorage.setItem(
                          SETTING_NAME_DEFAULT_CALENDAR,
                          defaultCalValue
                        );
                      }
                      setDefaultCalendar(defaultCalValue);
                    }
                  }
                );
              }
            }
          }
 
          if (varNotEmpty(body.data.message.admin)) {
            for (const item of body.data.message.admin) {
              if (item["name"] === "GLOBAL_DISABLE_USER_REGISTRATION") {
                const value = item["value"];
                const newAllowReg = value && value === "0" ? 0 : 1;
                setAllowReg(newAllowReg);
              }
            }
          }
        } else {
          const message = getMessageFromAPIResponse(body);
          console.error("getAllUserSettings", message, body);
        }
      })
      .catch((e) => {
        console.error("getAllUserSettings", e);
        toast.error(i18next("ERROR_GETTING_SETTINGS"));
      });
  }
 
  function caldavAccountButtonClicked() {
    router.push("/accounts/caldav");
  }
 
  async function getUserInfo() {
    const url_api = getAPIURL() + "users/info";
    const authorisationData = await getAuthenticationHeadersforUser();
 
    const requestOptions: RequestInit = {
      method: "GET",
      headers: new Headers({ authorization: authorisationData }),
    };
 
    fetch(url_api, requestOptions)
      .then((response) => response.json())
      .then((body) => {
        if (varNotEmpty(body)) {
          if (varNotEmpty(body.success) && body.success === true) {
            const adminStatus = body.data.message.level === "1";
 
            const isAdminOutput = adminStatus ? (
              <Row>
                <Col xs={3}>
                  <b>{i18next("ADMIN")}</b>
                </Col>
                <Col xs={9}>{i18next("YES")}</Col>
              </Row>
            ) : null;
 
            const backGround = isDarkModeEnabled() ? "black" : BACKGROUND_GRAY;
 
            const userInfoNode = (
              <div style={{ padding: 20, background: backGround }}>
                <Row>
                  <Col xs={3}>
                    <b>{i18next("USERNAME")}</b>
                  </Col>
                  <Col xs={9}>{body.data.message.username}</Col>
                </Row>
                <Row>
                  <Col xs={3}>
                    <b>{i18next("EMAIL")}</b>
                  </Col>
                  <Col xs={9}>{body.data.message.email}</Col>
                </Row>
                <Row>
                  <Col xs={3}>
                    <b>{i18next("CREATED_ON")}</b>
                  </Col>
                  <Col xs={9}>
                    {moment.unix(body.data.message.created).toString()}
                  </Col>
                </Row>
                {isAdminOutput}
              </div>
            );
 
            setUserInfo(userInfoNode);
            setIsAdmin(adminStatus);
          } else {
            displayErrorMessageFromAPIResponse(body);
          }
        } else {
          console.error(i18next("ERROR_GENERIC"), body);
        }
      })
      .catch((e) => {
        toast.error(i18next("ERROR_GENERIC"));
        console.error("getUserInfo", e);
      });
  }
 
  async function getCalendarName() {
    const calendars = await getCalDAVSummaryFromDexie();
    setCalendarsFromServer(calendars);
  }
 
  async function calendarSelected(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setDefaultCalendar(value);
    if (varNotEmpty(value) && value !== "") {
      updateDefaultCalendaronServer(value);
    }
  }
 
  async function updateDefaultCalendaronServer(calendar_id: string) {
    const authorisationData = await getAuthenticationHeadersforUser();
    const url_api = getAPIURL() + "settings/modify";
 
    const requestOptions: RequestInit = {
      method: "POST",
      body: JSON.stringify({ name: "DEFAULT_CALENDAR", value: calendar_id }),
      mode: "cors",
      headers: new Headers({
        authorization: authorisationData,
        "Content-Type": "application/json",
      }),
    };
 
    fetch(url_api, requestOptions)
      .then((response) => response.json())
      .then((body) => {
        if (varNotEmpty(body) && varNotEmpty(body.success) && body.success === true) {
          setDefaultCalendarID(calendar_id);
          toast.success(i18next("UPDATE_OK"));
        } else {
          toast.success(i18next("ERROR_GENERIC"));
          console.log("Setting update response:", body);
        }
        getAllUserSettings();
      })
      .catch((e) => {
        console.error("updateDefaultCalendaronServer", e);
        toast.error(e.message);
      });
  }
 
  function allowRegChanged(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = Number(e.target.value);
    setAllowReg(value);
    postAllowRegChanges(value);
  }
 
  async function postAllowRegChanges(newAllowReg: number) {
    const authorisationData = await getAuthenticationHeadersforUser();
    const url_api = getAPIURL() + "settings/modify";
 
    const requestOptions: RequestInit = {
      method: "POST",
      body: JSON.stringify({
        name: "GLOBAL_DISABLE_USER_REGISTRATION",
        value: newAllowReg,
      }),
      mode: "cors",
      headers: new Headers({
        authorization: authorisationData,
        "Content-Type": "application/json",
      }),
    };
 
    fetch(url_api, requestOptions)
      .then((response) => response.json())
      .then((body) => {
        if (varNotEmpty(body) && varNotEmpty(body.success) && body.success === true) {
          toast.success(i18next("UPDATE_OK"));
        } else {
          toast.success(i18next("ERROR_GENERIC"));
          console.error("Setting update response GLOBAL_DISABLE_USER_REGISTRATION:", body);
        }
      })
      .catch((e) => {
        toast.error(e.message);
      });
  }
 
  function renderAdminSettings() {
 
    const disabledMessage = registrationDisabledFromEnv ? (
      <p style={{ color: "red", textAlign: "center" }}>
        {i18next("USER_REG_DISABLED_FROM_ENV")}
      </p>
    ) : null;
 
    return (
      <>
        <h2>{i18next("ADMIN") + " " + i18next("SETTINGS")}</h2>
        <br />
        <Row style={{ display: "flex", alignItems: "center" }}>
          <Col xs={3}>{i18next("ALLOW_REGISTRATION")}</Col>
          <Col xs={9}>
            <Form.Select
              onChange={allowRegChanged}
              disabled={registrationDisabledFromEnv}
              value={allowReg}
              size="sm"
            >
              <option value={0}>{i18next("NO")}</option>
              <option value={1}>{i18next("YES")}</option>
            </Form.Select>
          </Col>
        </Row>
        {disabledMessage}
        <br />
        <ManageUsers i18next={i18next} />
      </>
    );
  }
 
  function getCalendarOutput() {
    if (!isValidResultArray(calendarsFromServer)) return null;
 
    const calendarOutput: React.ReactNode[] = [
      <option key="calendar-select-empty"></option>,
    ];
 
    for (let i = 0; i < calendarsFromServer.length; i++) {
      if (!isValidResultArray(calendarsFromServer[i].calendars)) continue;
 
      const tempOutput = calendarsFromServer[i].calendars.map((cal, j) => (
        <option
          key={`${j}.${cal.url}`}
          style={{ background: cal.calendarColor }}
          value={cal.url}
        >
          {cal.displayName}
        </option>
      ));
 
      calendarOutput.push(
        <optgroup key={calendarsFromServer[i].name} label={calendarsFromServer[i].name}>
          {tempOutput}
        </optgroup>
      );
    }
 
    return (
      <Form.Select
        key="calendarOptions"
        onChange={calendarSelected}
        value={defaultCalendar}
      >
        {calendarOutput}
      </Form.Select>
    );
  }
 
  const adminTable = isAdmin ? renderAdminSettings() : null;
 
  return (
    <Container fluid>
      <div style={{ padding: 20 }}>
        <h1>{i18next("SETTINGS")}</h1>
        <div style={{ textAlign: "right" }}>
          <Button onClick={caldavAccountButtonClicked} variant="outline-info">
            {i18next("MANAGE") + " " + i18next("CALDAV_ACCOUNTS")}
          </Button>{" "}
        </div>
        <br />
        <h2>{i18next("GENERAL_SETTINGS")}</h2>
        <div>
          <Row style={{ display: "flex", alignItems: "center" }}>
            <Col xs={3}>
              {i18next("DEFAULT") + " " + i18next("CALENDAR")}
            </Col>
            <Col xs={9}>{getCalendarOutput()}</Col>
          </Row>
          <br />
          <Row style={{ display: "flex", alignItems: "center" }}>
            <Col xs={3}>{i18next("CALENDAR_VIEW_DEFAULT")}</Col>
            <Col xs={9}>
              <DefaultCalendarViewSelect />
            </Col>
          </Row>
          <br />
          <CalendarStartDayWeek />
        </div>
        <br />
        <AutoSyncSetting />
        <br />
        <ToastSettings />
        <br />
        <h2>{i18next("DATE_TIME_FORMAT")}</h2>
        <TimeFormatSetting />
        <br />
        <br />
        <AdvancedSettings />
        <br />
        <br />
        <MaintenanceTasks />
        <br />
        <br />
        <h2>{i18next("ACCOUNT_INFO")}</h2>
        {userInfo}
        <br />
        <br />
        {adminTable}
        <p>
          <b>{i18next("VERSION")}: </b>
          {VERSION_NUMBER}
        </p>
      </div>
    </Container>
  );
};
 
export default SettingsPage;
 

