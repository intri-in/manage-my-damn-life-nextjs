import { PRIMARY_COLOUR } from "@/config/style"
import Row from 'react-bootstrap/Row';
import Col from "react-bootstrap/Col";
import { useRouter, withRouter } from "next/router";
import { Button, NavItem, NavLink, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import React, { Component, useRef, useState } from 'react';
import { fetchLatestEvents, fetchLatestEventsV2, isSyncing, makeSyncRequest } from "@/helpers/frontend/sync";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { getI18nObject } from "@/helpers/frontend/general";
import { AiOutlineSetting, AiOutlineUser } from "react-icons/ai";
import  {IoSyncCircleOutline}  from "react-icons/io5/index";
import { BiLogOut } from "react-icons/bi";
import { logoutUser, logoutUser_withRedirect } from "@/helpers/frontend/user";
import Link from "next/link";
import { getSyncTimeout, setSyncTimeout } from "@/helpers/frontend/settings";
import { toast } from "react-toastify";
import Dropdown from 'react-bootstrap/Dropdown';
import { getInstallCheckCookie, getUserNameFromCookie } from "@/helpers/frontend/cookies";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { getNextAuthSessionData, nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { installCheck, installCheck_Cookie } from "@/helpers/install";
import { IS_SYNCING, getValueFromLocalStorage } from "@/helpers/frontend/localstorage";


class AppBarGeneric_ClassComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {  isSyncing: this.props.isSyncing, username: "", installed: true }
    this.i18next = getI18nObject()
    this.logoClicked = this.logoClicked.bind(this)
    this.taskViewClicked = this.taskViewClicked.bind(this)
    this.syncButtonClicked = this.syncButtonClicked.bind(this)
    this.logOutClicked = this.logOutClicked.bind(this)
    this.settingsClicked = this.settingsClicked.bind(this)
    this.manageFilterClicked = this.manageFilterClicked.bind(this)
    this.labelManageClicked = this.labelManageClicked.bind(this)
    this.manageCaldavClicked = this.manageCaldavClicked.bind(this)
    this.notInstalledBannerClicked = this.notInstalledBannerClicked.bind(this)
  }
async componentDidMount(){
  this.setState({isSyncing: this.props.isSyncing})
  const installed = await installCheck_Cookie(this.props.router)
  if(!installed){
    this.setState({installed: false})
  }
  var context = this
 

  let username=""
  try{
    if(await nextAuthEnabled()){
      if(this.props.session)
      {
        
        const { data: session, status } = this.props.session
        if(status!="loading"){
          username = session.user.name

        }else{

        }
      }
    }else{
  
        username = getUserNameFromCookie()
    }
  
  }catch(e){
    
  }
  this.setState({username: username})

}

notInstalledBannerClicked(){
  this.props.router.push("/install")
}
componentDidUpdate(prevProps, prevState) {

  if (this.props.isSyncing !== prevProps.isSyncing) {
      
      this.setState({isSyncing: this.props.isSyncing})
  }


}


async syncButtonClicked() {
    this.setState({isSyncing: true})
   
    //Make a refresh Request for all caldav accounts.
    await fetchLatestEventsV2()
    this.setState({isSyncing: false})
    if(this.props.onSynComplete!=null)
    {
      this.props.onSynComplete()
    }
    
  }
  logoClicked() {
    this.props.router.push("/")
  }
  taskViewClicked() {
    this.props.router.push('/tasks/list')
  }
  logOutClicked()
  {
    logoutUser_withRedirect(this.props.router)
  }
  settingsClicked()
  {
    this.props.router.push("/accounts/settings")
  }
  manageFilterClicked()
  {
    this.props.router.push("/filters/manage")
  }
  labelManageClicked(){
    this.props.router.push("/labels/manage")

  }
  manageCaldavClicked(){
        this.props.router.push("/accounts/caldav")

  }
  render() {
  
    // const isSyncingFromLocal = getValueFromLocalStorage(IS_SYNCING)
    const spinningButton = this.state.isSyncing || (isSyncing())
    var syncButton = spinningButton ? (   <Spinner
    as="span"
    animation="border"
    size="sm"
    role="status"
    aria-hidden="true"
  />) : (<IoSyncCircleOutline size={24} onClick={this.syncButtonClicked} />)

    let notInstalledBanner = null
    if(!this.state.installed){
    notInstalledBanner = (<div onClick={this.notInstalledBannerClicked} style={{background: "darkred", textAlign:"center", color:"white"}}>{this.i18next.t("MMDL_NOT_INSTALLED")}</div>)
    }
    return (
      <>
            {notInstalledBanner}
            <Navbar className="nav-pills nav-fill" style={{background: PRIMARY_COLOUR, padding: 20}} variant="dark" sticky="top"  expand="lg">
                <Navbar.Brand  onClick={this.logoClicked} >
                        <Image
                  src="/logo.png"
                  width="30"
                  height="30"
                  className="d-inline-block align-top"
                  alt="Manage my Damn Life"
                />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse  id="basic-navbar-nav">
                <Nav style={{display: "flex",  margin:5,justifyContent:"space-evenly", alignItems:"center", }}  className="justify-content-end">
                    <Link style={{color: "white", textDecoration: "none"}} href="/"> {this.i18next.t("HOME")}</Link> &nbsp; &nbsp;
                    <Link style={{color: "white", textDecoration: "none"}} href="/tasks/list"> {this.i18next.t("TASK_VIEW")}</Link>&nbsp; &nbsp;
                   <Link style={{color: "white", textDecoration: "none"}} href="/calendar/view"> {this.i18next.t("CALENDAR_VIEW")}</Link>
                  <Nav.Item>
                  <Dropdown style={{color: "white"}} as={NavItem}>
                    <Dropdown.Toggle  style={{color: "white"}} as={NavLink}>                            
                      <AiOutlineSetting  size={24} /> 
                    </Dropdown.Toggle>
                    <Dropdown.Menu id="DDL_MENU_SETTINGS">
                      <Dropdown.Item onClick={this.labelManageClicked}>{this.i18next.t("LABEL_MANAGER")}</Dropdown.Item>
                      <Dropdown.Item onClick={this.manageFilterClicked}>{this.i18next.t("MANAGE_FILTERS")}</Dropdown.Item>
                      <Dropdown.Item onClick={this.manageCaldavClicked}>{this.i18next.t("MANAGE")+" "+this.i18next.t("CALDAV_ACCOUNTS")}</Dropdown.Item>
                      <Dropdown.Item onClick={this.settingsClicked}>{this.i18next.t("SETTINGS")}</Dropdown.Item>

                    </Dropdown.Menu>
                  </Dropdown>
                  </Nav.Item>

                </Nav>
               
                </Navbar.Collapse>
               

                <Nav style={{display: "flex", justifyContent:"space-evenly", alignItems:"center", }} className="justify-content-end"> 
                <NavItem style={{color:"white", display: "flex", margin:10,justifyContent:"space-evenly", alignItems:"center", }}>
                <OverlayTrigger key="KEY_USERNAME" placement='bottom'
              overlay={
                  <Tooltip id='tooltip_USERNAME'> 
                              {this.i18next.t("USERNAME")}

                  </Tooltip>
                }>
                  <div>
                  <AiOutlineUser /> 
                  {this.state.username}

                  </div>
                </OverlayTrigger>
                </NavItem>

                  <Nav.Item style={{}}>
                  <OverlayTrigger key="SYNC_KEY" placement='bottom'
              overlay={
                  <Tooltip id='tooltip_SYNC'> 
                              {this.i18next.t("SYNC")}

                  </Tooltip>
                }>
                  <div style={{color: "white", padding:5,}}>{syncButton} </div>
                </OverlayTrigger>
                  </Nav.Item>
                  <Nav.Item style={{ color: "white",  padding:5,}}>
                     <BiLogOut onClick={this.logOutClicked} size={24} /> 
                  </Nav.Item>
                </Nav>


      </Navbar>

      </>
    )
  }
}

export default withRouter(AppBarGeneric_ClassComponent)