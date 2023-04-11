import { PRIMARY_COLOUR } from "@/config/style"
import Row from 'react-bootstrap/Row';
import Col from "react-bootstrap/Col";
import { useRouter, withRouter } from "next/router";
import { Button, Spinner } from "react-bootstrap";
import React, { Component, useState } from 'react';
import { fetchLatestEvents, makeSyncRequest } from "@/helpers/frontend/sync";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
class AppBarGeneric extends Component {

  constructor(props) {
    super(props)
    this.state = {  isSyncing: this.props.isSyncing }
    this.logoClicked = this.logoClicked.bind(this)
    this.taskViewClicked = this.taskViewClicked.bind(this)
    this.syncButtonClicked = this.syncButtonClicked.bind(this)

  }
componentDidMount(){
  this.setState({isSyncing: this.props.isSyncing})
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
  render() {
    var syncButton = this.state.isSyncing ? (<Button size="sm" onClick={this.syncButtonClicked}>        <Spinner
    as="span"
    animation="border"
    size="sm"
    role="status"
    aria-hidden="true"
  /></Button>) : (<Button size="sm" onClick={this.syncButtonClicked}>Sync</Button>)
    return (
      <Navbar  expand="lg">
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse style={{background: PRIMARY_COLOUR}} id="basic-navbar-nav">
                <Nav className="me-auto">
                <Row style={{ padding: 10, justifyContent: 'center', display: 'flex', alignItems: "center",  }}>
                  <Col >
                    <div onClick={this.logoClicked} style={{ color: 'white' }}>Manage my Damn Life</div>
                  </Col>
                  <Col>
                    <div onClick={this.taskViewClicked} style={{ color: 'white' }}>Task View</div>
                  </Col>
                  <Col>
                    {syncButton}
                  </Col>
                  <Col>
                  </Col>

                </Row>
                </Nav>
                </Navbar.Collapse>

      </Navbar>
    )
  }
}

export default withRouter(AppBarGeneric)