import { PRIMARY_COLOUR } from "@/config/style"
import Row from 'react-bootstrap/Row';
import Col from "react-bootstrap/Col";
import { useRouter, withRouter } from "next/router";
import { Button, Spinner } from "react-bootstrap";
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
                <Nav className="me-auto">
                    <Link style={{color: "white", textDecoration: "none"}} href="/"> {this.i18next.t("HOME")}</Link> &nbsp; &nbsp;
                    <Link style={{color: "white", textDecoration: "none"}} href="/tasks/list"> Task View</Link>
                </Nav>
                <Nav>

                </Nav>
                <Nav>

                </Nav>
                </Navbar.Collapse>
                <Nav.Link style={{color: "white", textAlign:"center"}}></Nav.Link>
                <Nav.Link style={{color: "white", textAlign:"right"}}>{syncButton} <AiOutlineSetting onClick={this.settingsClicked} size={24} /> <BiLogOut onClick={this.logOutClicked} size={24} /> </Nav.Link>


      </Navbar>
    )
  }
}

export default withRouter(AppBarGeneric)