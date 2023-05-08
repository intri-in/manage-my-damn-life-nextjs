import AppBarGeneric from "@/components/common/AppBarGeneric";
import DashboardView from "@/components/fullcalendar/DashboardView";
import { getI18nObject } from "@/helpers/frontend/general";
import Head from "next/head";
import { withRouter } from "next/router";
import { Component } from "react";
import "react-datetime/css/react-datetime.css";

class CalendarView extends Component{

    constructor(props)
    {
        super(props)
        this.i18next = getI18nObject()
        this.state = {updated: "", scheduleItem: null ,showListColumn: true, calendarAR: 1.35}
        this.fetchEvents = this.fetchEvents.bind(this)
        this.updateDimensions = this.updateDimensions.bind(this)
        this.showListColumnButtonClicked = this.showListColumnButtonClicked.bind(this)
        this.handleCloseOffcanvas = this.handleCloseOffcanvas.bind(this)

    }
    componentDidMount(){
        if (window != undefined) {
         // window.addEventListener('resize', this.updateDimensions);
    
          if (window.innerWidth < 900) {
            this.setState({ showListColumn: false })
    
          } else {
            this.setState({ showListColumn: true })
    
          }
        }
    
    
      }
    
      updateDimensions = () => {
        if (window.innerWidth < 700) {
          
          this.setState({ showListColumn: false, calendarAR: 0.3 })
    
        } else {
          this.setState({ showListColumn: true })
    
        }
      };
    
      showListColumnButtonClicked() {
        this.setState({ showLeftColumnOffcanvas: true, })
      }
      handleCloseOffcanvas() {
        this.setState({ showLeftColumnOffcanvas: false })
      }
    
    
    
      fetchEvents() {
        var updated = Math.floor(Date.now() / 1000)
        this.setState({updated: updated})
      }
    
    
    render(){
        
        return(<>
    <Head>
        <title>{this.i18next.t("APP_NAME_TITLE")} - {this.i18next.t("TASKS")}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric  onSynComplete={this.onSynComplete} />
        <div className='container-fluid'>
        <DashboardView initialView="dayGridMonth" calendarAR={this.state.calendarAR} scheduleItem={this.state.scheduleItem} />

        </div>
        </>)
    }
}

export default withRouter(CalendarView)