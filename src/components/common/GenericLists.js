import { Component } from "react";
import { FiSunrise } from "react-icons/fi";
import {MdToday} from 'react-icons/md'
import { getI18nObject } from '@/helpers/frontend/general';
import { AiFillStar, AiOutlineFilter, AiOutlineSetting } from "react-icons/ai";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { BsCalendar3 } from "react-icons/bs";
import ShowCalendarList from "./calendars/ShowCalendarList";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import Badge from 'react-bootstrap/Badge';
import { withRouter } from "next/router";
import FilterList from "../filters/FilterList";
import { toast } from "react-toastify";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import Link from "next/link";
import { SYSTEM_DEFAULT_LABEL_PREFIX } from "@/config/constants";
import { getAPIURL, logVar } from "@/helpers/general";
import { getAllLabelsFromDexie, updateLabelCacheInDexie } from "@/helpers/frontend/dexie/dexie_labels";
import { IoRefreshCircleOutline } from "react-icons/io5";
import { PRIMARY_COLOUR } from "@/config/style";
import { getThemeMode, isDarkModeEnabled } from "@/helpers/frontend/theme";
class GenericLists extends Component{
    constructor(props)
    {
        super(props)
        var i18next = getI18nObject()
        this.i18next = i18next
        this.state ={i18next: i18next, allFilters: null,height:0}
        this.generateLabelList = this.generateLabelList.bind(this)
        this.updateDimensions = this.updateDimensions.bind(this)
        this.filterSettingsMenuClicked = this.filterSettingsMenuClicked.bind(this)
        this.manageCalendarsClicked = this.manageCalendarsClicked.bind(this)
        this.labelSettingClicked = this.labelSettingClicked.bind(this)
        this.generateLabelListfromDexie = this.generateLabelListfromDexie.bind(this)
        this.updateLabelCache = this.updateLabelCache.bind(this)
    }

    componentDidMount()
    {
        this.generateLabelListfromDexie()
        //this.generateLabelList()
        if(window!=undefined)
        {
            this.setState({height: (window.innerHeight-100) + 'px'});
            window.addEventListener('resize', this.updateDimensions);

        }
    }
    updateDimensions = () => {
        this.setState({ height: window.innerHeight-100 });
      };

    filterSettingsMenuClicked()
    {
        this.props.router.push("/filters/manage")
    }

    updateLabelCache(){
        toast.info(this.i18next.t("UPDATING_LABEL_CACHE"))
        updateLabelCacheInDexie().then(()=>{
            this.generateLabelList()
        })
    }
    async generateLabelListfromDexie(){
        const labels = await getAllLabelsFromDexie()
        var temp_Labelcomponent=[]
        if(labels!=null)
        {
            for (const key in labels)
            {      
                //temp_Labelcomponent.push((<><Button size="sm" value={labels[key].name} onClick={this.props.labelClicked} style={{margin: 5, backgroundColor: labels[key].colour, color: 'white'}} >{labels[key].name}</Button>{' '}</>))
                var border="1px solid "+labels[key].colour
                if(!labels[key].name.startsWith(SYSTEM_DEFAULT_LABEL_PREFIX+"-"))
                {
                    temp_Labelcomponent.push(<Badge  key={labels[key].name} value={labels[key].name} onClick={this.props.labelClicked} bg="light" pill style={{margin: 5, borderColor:"pink", border:border, color: labels[key].colour,  textDecorationColor : 'white'}} >{labels[key].name}</Badge>)

                }
            }

            this.setState({allFilters: temp_Labelcomponent})
        }
    }
    async generateLabelList()
    {
        const url_api=getAPIURL()+"caldav/calendars/labels"
        const authorisationData=await getAuthenticationHeadersforUser()
    
        const requestOptions =
        {
            method: 'GET',
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData}),
    
        }
    
        return new Promise( (resolve, reject) => {

            
                const response =  fetch(url_api, requestOptions)
                .then(response =>{
                    return response.json()
                } )
                .then((body) =>{
                    if(body!=null && body.success!=null)
                    {
                        if(body.success.toString()=="true")
                        {
                            //Save the events to db.
                            var labels= body.data.message
                            var temp_Labelcomponent=[]
                            if(labels!=null)
                            {
                                for (const key in labels)
                                {      
                                    
                                    //temp_Labelcomponent.push((<><Button size="sm" value={labels[key].name} onClick={this.props.labelClicked} style={{margin: 5, backgroundColor: labels[key].colour, color: 'white'}} >{labels[key].name}</Button>{' '}</>))
                                    var border="1px solid "+labels[key].colour
                                    if(!labels[key].name.startsWith(SYSTEM_DEFAULT_LABEL_PREFIX+"-"))
                                    {
                                        temp_Labelcomponent.push(<Badge  key={labels[key].name} value={labels[key].name} onClick={this.props.labelClicked} bg="light" pill style={{margin: 5, borderColor:"pink", border:border, color: labels[key].colour,  textDecorationColor : 'white'}} >{labels[key].name}</Badge>)
    
                                    }
                                }
    
                                this.setState({allFilters: temp_Labelcomponent})
                            }
                                
                        }else{
                            var message= getMessageFromAPIResponse(body)
                            console.error("generateLabelList", message, body)

                            if(message!=null)
                            {
                                if(message=="PLEASE_LOGIN")
                                {
                                    // Login required
                                    // var redirectURL="/login"
                                    // if(window!=undefined)
                                    // {
        
        
                                    //     redirectURL +="?redirect="+window.location.pathname
                                    // }
                                    // this.props.router.push(redirectURL)
        
        
                                }
                            }
                            else
                            {
                                toast.error(this.i18next.t("ERROR_GENERIC"))
        
                            }
        
                        }
    
                    }
                    else{
                        toast.error(this.i18next.t("ERROR_GENERIC"))
    
                    }
                  
        
                }).catch(e =>{
                    console.error(e,"GenericLists: generateLabelList")
                    //toast.error("GenericLists: generateLabelList: "+e.message)
                })
           
        })
    
    
        /*
        getAllLablesFromDB().then((labels) => {
            var temp_Labelcomponent=[]
            if(labels!=null)
            {
                for (const key in labels)
                {      
                    temp_Labelcomponent.push((<><Button style={{backgroundColor: labels[key].colour, color: 'white'}} >{labels[key].name}</Button>{' '}</>))
                }
    
                this.setState({allFilters: temp_Labelcomponent})
            }
    
        })
        */

    }

    labelSettingClicked()
    {
        this.props.router.push("/labels")
    }
    manageCalendarsClicked()
    {
        this.props.router.push("/accounts/caldav")
    }
    render(){
        const darkMode= isDarkModeEnabled() 
        const borderBottomColor = darkMode ? "white" : "black"
        const settingButtonColor = darkMode ? "white" : PRIMARY_COLOUR
        return(
                <div style={{overflowY: 'scroll',  height: this.state.height,}}>
                    <div onClick={this.props.myDayClicked} style={{ margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}} className="row">
                        <div className="col">
                            <FiSunrise className="textDefault"  />                         <span className="textDefault">{this.state.i18next.t("MY_DAY")}</span>

                        </div>
                    </div>
                    <div onClick={this.props.dueTodayClicked} style={{margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}}  className="row">
                        <div className="col">
                            <MdToday className="textDefault" /> <span className="textDefault" >{this.state.i18next.t("DUE_TODAY")}</span>
                        </div>
                    </div>
                    <div onClick={this.props.dueThisWeek} style={{margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}}  className="row">
                        <div className="col">
                            <MdToday className="textDefault"/> <span className="textDefault">                        Due in Next Seven Days
</span>
                        </div>
                    </div>
                    <div onClick={this.props.highPriorityClicked} style={{margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}}  className="row">
                        <div  className="col">
                            <AiFillStar className="textDefault"/> <span className="textDefault">  High Priority
</span>
                        </div>
                    </div>

                    <div onClick={this.props.allTasksClicked} style={{margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}}  className="row">
                        <div  className="col">
                            <MdToday className="textDefault"/> <span className="textDefault">  All tasks
</span>
                        </div>
                    </div>

                    <br />
                    <div style={{margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', }} className="row">
                    <Col><h3><AiOutlineFilter />{this.i18next.t("FILTERS")}</h3></Col>
                    <Col style={{textAlign:"right"}}><Link href="/filters/manage"> <AiOutlineSetting color={settingButtonColor} /></Link></Col>
                    </div>
                    <Row style={{margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', }} >
                    <Col><FilterList filterClicked={this.props.filterClicked} /></Col>
                    </Row>
                    <Row style={{marginLeft: 20, marginRight: 20, padding: 5, justifyContent: 'center', alignItems:'center', display: "flex" }} >
                        <Col><h3>By Labels</h3></Col>
                        <Col> <h3 style={{textAlign: "right"}}><IoRefreshCircleOutline onClick={this.updateLabelCache} color={settingButtonColor} />&nbsp;&nbsp;<Link href="/labels/manage"><AiOutlineSetting  color={settingButtonColor}/></Link></h3></Col>
                    </Row>
                    <div style={{marginLeft: 20, marginRight: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}}  className="row">
                        <div className="col-12">
                            {this.state.allFilters}
                        </div>
                    </div>
                    <div style={{marginTop: 40, marginLeft: 20, marginRight: 20, padding: 5, justifyContent: 'center', alignItems:'center', }} className="row">
                        <Col>
                        <h3><BsCalendar3 /> Calendars</h3>
                        </Col>
                        <Col style={{textAlign:"right"}}><Link href="/accounts/caldav"><AiOutlineSetting color={settingButtonColor} /></Link> </Col>

                    </div>
                    <Row style={{ marginTop: 10, marginLeft: 20, marginRight: 20, padding: 5, justifyContent: 'center', alignItems:'center', }}>
                        <ShowCalendarList calendarNameClicked={this.props.calendarNameClicked} />
                    </Row>

            </div>
        )
    }
}

export default withRouter(GenericLists)