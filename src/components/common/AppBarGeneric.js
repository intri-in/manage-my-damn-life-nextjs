import { PRIMARY_COLOUR } from "@/config/style"
import Row from 'react-bootstrap/Row';
import Col from "react-bootstrap/Col";
import { useRouter, withRouter } from "next/router";
import { Button, NavItem, NavLink, Spinner } from "react-bootstrap";
import React, { Component, useState } from 'react';
import { fetchLatestEvents, makeSyncRequest } from "@/helpers/frontend/sync";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { getI18nObject } from "@/helpers/frontend/general";
import { AiOutlineSetting } from "react-icons/ai";
import  {IoSyncCircleOutline}  from "react-icons/io5/index";
import { BiLogOut } from "react-icons/bi";
import { logoutUser } from "@/helpers/frontend/user";
import Link from "next/link";
import { getSyncTimeout } from "@/helpers/frontend/settings";
import { toast } from "react-toastify";
import Dropdown from 'react-bootstrap/Dropdown';
class AppBarGeneric extends Component {

  constructor(props) {
    super(props)
    this.state = {  isSyncing: this.props.isSyncing }
    this.i18next = getI18nObject()
    this.logoClicked = this.logoClicked.bind(this)
    this.taskViewClicked = this.taskViewClicked.bind(this)
    this.syncButtonClicked = this.syncButtonClicked.bind(this)
    this.logOutClicked = this.logOutClicked.bind(this)
    this.settingsClicked = this.settingsClicked.bind(this)
    this.manageFilterClicked = this.manageFilterClicked.bind(this)
    this.labelManageClicked = this.labelManageClicked.bind(this)
    this.manageCaldavClicked = this.manageCaldavClicked.bind(this)
  }
componentDidMount(){
  this.setState({isSyncing: this.props.isSyncing})
 
  var context = this
  setInterval(() => {
    //context.syncButtonClicked()
    //toast.info("syncing")
    console.log("getSyncTimeout", getSyncTimeout())
  }, getSyncTimeout())


}


componentDidUpdate(prevProps, prevState) {

  if (this.props.isSyncing !== prevProps.isSyncing) {
      
      this.setState({isSyncing: this.props.isSyncing})
  }


}


async syncButtonClicked() {
    this.setState({isSyncing: true})
   
    //Make a refresh Request for all caldav accounts.
    await fetchLatestEvents()
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
    logoutUser()
    this.props.router.push("/login")
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
  
    var syncButton = this.state.isSyncing ? (   <Spinner
    as="span"
    animation="border"
    size="sm"
    role="status"
    aria-hidden="true"
  />) : (<IoSyncCircleOutline size={24} onClick={this.syncButtonClicked} />)


    return (
      <Navbar className="nav-pills nav-fill" style={{background: PRIMARY_COLOUR, padding: 20}} variant="dark" sticky="top"  expand="lg">
            <Navbar.Brand  onClick={this.logoClicked} >
                    <img
              src="/logo.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="Manage my Damn Life"
            />
                    </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse  id="basic-navbar-nav">
                <Nav style={{display: "flex", margin:5,justifyContent:"space-evenly", alignItems:"center", }}  className="justify-content-end">
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
                  <Nav.Item style={{}}>
                    <div style={{color: "white", padding:5,}}>{syncButton} </div>
                  </Nav.Item>
                  <Nav.Item style={{ color: "white",  padding:5,}}>
                      <BiLogOut onClick={this.logOutClicked} size={24} /> 
                  </Nav.Item>
                </Nav>


      </Navbar>
    )
  }
}

export default withRouter(AppBarGeneric)