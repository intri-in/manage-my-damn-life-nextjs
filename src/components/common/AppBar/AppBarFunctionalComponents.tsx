import { PRIMARY_COLOUR } from "@/config/style";
import { useRouter } from "next/router";
import { Button, NavItem, NavLink, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import React, { useEffect, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { getI18nObject } from "@/helpers/frontend/general";
import { AiOutlineSetting, AiOutlineUser } from "react-icons/ai";
import { IoSyncCircleOutline } from "react-icons/io5/index";
import { BiLogOut } from "react-icons/bi";
import Link from "next/link";
import Dropdown from 'react-bootstrap/Dropdown';
import Image from "next/image";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { isDarkModeEnabled, setThemeMode } from "@/helpers/frontend/theme";
import { installCheck_Cookie } from "@/helpers/install";
import { fetchLatestEventsV2, isSyncing } from "@/helpers/frontend/sync";
import { logoutUser_withRedirect } from "@/helpers/frontend/user";
import { getUserNameFromCookie } from "@/helpers/frontend/cookies";

const AppBarFunctionalComponents = ({ session, onSynComplete }:{isSyncing, session, onSynComplete}) => {
  const [username, setUsername] = useState("");
  const [installed, setInstalled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const router = useRouter();
  const i18next = getI18nObject();

  useEffect(() => {
    setUsernameFromSession();
    checkInstallation();
    setDarkModeEnabled(isDarkModeEnabled());
  }, []);


  const setUsernameFromSession = async () => {
    try {
      if (session && session.data) {
        const { data: sessionData, status } = session;
        if (status !== "loading") {
          setUsername(sessionData.user.name);
        }
      }else{
        setUsername(getUserNameFromCookie())
      }
    } catch (error) {
      console.warn("Error setting username from session:", error);
    }
  };

  const checkInstallation = async () => {
    try {
      const isInstalled = await installCheck_Cookie(router);
      if(isInstalled){
        setInstalled(isInstalled);
      }
    } catch (error) {
      console.error("Error checking installation:", error);
    }
  };

  const syncButtonClicked = async () => {
    try {
      await fetchLatestEventsV2();
    } catch (error) {
      console.error("Error syncing data:", error);
    }
  };

  const logoClicked = () => {
    router.push("/");
  };

  const taskViewClicked = () => {
    router.push("/tasks/list");
  };

  const logOutClicked = () => {
    logoutUser_withRedirect(router);
  };

  const settingsClicked = () => {
    router.push("/accounts/settings");
  };

  const manageFilterClicked = () => {
    router.push("/filters/manage");
  };

  const labelManageClicked = () => {
    router.push("/labels/manage");
  };

  const manageCaldavClicked = () => {
    router.push("/accounts/caldav");
  };

  const flipThemeMode = () => {
    const newMode = isDarkModeEnabled() ? "light" : "dark";
    setThemeMode(newMode);
    setDarkModeEnabled(isDarkModeEnabled());
  };

  const spinningButton = isSyncing();
  const syncButton = spinningButton ? (
    <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
  ) : (
    <IoSyncCircleOutline size={24} onClick={syncButtonClicked} />
  );

  const darkModeButton = darkModeEnabled ? (
    <MdOutlineDarkMode onClick={flipThemeMode} size={24} />
  ) : (
    <MdOutlineLightMode onClick={flipThemeMode} size={24} />
  );

  const notInstalledBannerClicked = () =>{
    router.push("/install")
  }

  let notInstalledBanner: JSX.Element | null = null;
  if (!installed) {
    notInstalledBanner = (
      <div onClick={notInstalledBannerClicked} style={{ background: "darkred", textAlign: "center", color: "white" }}>{i18next.t("MMDL_NOT_INSTALLED")}</div>
    );
  }

  return (
    <>
      {notInstalledBanner}
      <Navbar className="nav-pills nav-fill" style={{ background: PRIMARY_COLOUR, padding: 20 }} sticky="top" expand="lg">
        <Navbar.Brand onClick={logoClicked}>
          <Image
            src="/logo.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="Manage my Damn Life"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav style={{ display: "flex", margin: 5, justifyContent: "space-evenly", alignItems: "center" }} className="justify-content-end">
            <Link style={{ color: "white", textDecoration: "none" }} href="/">{i18next.t("HOME")}</Link> &nbsp; &nbsp;
            <Link style={{ color: "white", textDecoration: "none" }} href="/tasks/list">{i18next.t("TASK_VIEW")}</Link>&nbsp; &nbsp;
            <Link style={{ color: "white", textDecoration: "none" }} href="/calendar/view">{i18next.t("CALENDAR_VIEW")}</Link>
            <Nav.Item>
              <Dropdown style={{ color: "white" }} as={NavItem}>
                <Dropdown.Toggle style={{ color: "white" }} as={NavLink}>
                  <AiOutlineSetting size={24} />
                </Dropdown.Toggle>
                <Dropdown.Menu id="DDL_MENU_SETTINGS">
                  <Dropdown.Item onClick={labelManageClicked}>{i18next.t("LABEL_MANAGER")}</Dropdown.Item>
                  <Dropdown.Item onClick={manageFilterClicked}>{i18next.t("MANAGE_FILTERS")}</Dropdown.Item>
                  <Dropdown.Item onClick={manageCaldavClicked}>{i18next.t("MANAGE") + " " + i18next.t("CALDAV_ACCOUNTS")}</Dropdown.Item>
                  <Dropdown.Item onClick={settingsClicked}>{i18next.t("SETTINGS")}</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
        <Nav style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center" }} className="justify-content-end">
          <NavItem style={{ color: "white", display: "flex", margin: 10, justifyContent: "space-evenly", alignItems: "center" }}>
            <OverlayTrigger key="KEY_USERNAME" placement='bottom'
              overlay={
                <Tooltip id='tooltip_USERNAME'>
                  {i18next.t("USERNAME")}
                </Tooltip>
              }>
              <div>
                <AiOutlineUser />
                {username}
              </div>
            </OverlayTrigger>
          </NavItem>
          <Nav.Item style={{}}>
            <OverlayTrigger key="DARK_MODE_KEY" placement='bottom'
              overlay={
                <Tooltip id='tooltip_DARK_MODE_KEY'>
                  {i18next.t("THEME_MODE")}
                </Tooltip>
              }>
              <div style={{ color: "white", padding: 5 }}>{darkModeButton} </div>
            </OverlayTrigger>
          </Nav.Item>
          <Nav.Item style={{}}>
            <OverlayTrigger key="SYNC_KEY" placement='bottom'
              overlay={
                <Tooltip id='tooltip_SYNC'>
                  {i18next.t("SYNC")}
                </Tooltip>
              }>
              <div style={{ color: "white", padding: 5 }}>{syncButton} </div>
            </OverlayTrigger>
          </Nav.Item>
          <Nav.Item style={{ color: "white", padding: 5 }}>
            <BiLogOut onClick={logOutClicked} size={24} />
          </Nav.Item>
        </Nav>
      </Navbar>
    </>
  );
};

export default AppBarFunctionalComponents;
