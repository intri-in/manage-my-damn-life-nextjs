import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { Toastify } from '../Generic';
import 'react-toastify/dist/ReactToastify.css';
import { returnGetParsedVTODO, getTodosfromDB, getLatestCalendarEvents, saveEventstoDB, getAllEvents } from '@/helpers/frontend/calendar';
import { getI18nObject } from '@/helpers/frontend/general';
import { getAuthenticationHeadersforUser, getUserData } from '@/helpers/frontend/user';
import { TaskView } from './TaskView';
import { saveLabeltoDB } from '@/helpers/frontend/labels';
import { getEvents } from '@/helpers/frontend/events';
import { getMessageFromAPIResponse } from '@/helpers/frontend/response';
import { withRouter } from 'next/router';
import { Loading } from '../common/Loading';
import { getAPIURL, isValidResultArray, logVar } from '@/helpers/general';
import { fetchAllEventsFromDexie, fetchEventsForCalendarsFromDexie } from '@/helpers/frontend/dexie/events_dexie';
import { getCalDAVSummaryFromDexie, getNameForTaskList, getNameofCalDAVFromDexie } from '@/helpers/frontend/dexie/caldav_dexie';
import { getCalendarNameByIDFromDexie } from '@/helpers/frontend/dexie/calendars_dexie';
class TaskList extends Component {
    constructor(props) {
        super(props)
        var i18next = getI18nObject()
        this.i18next = i18next
        this.refreshCalendars = this.refreshCalendars.bind(this)
        this.state = { i18next: i18next, toast_placeholder: null, taskList: [], caldav_accounts_id: this.props.caldav_accounts_id, calendars_id: this.props.calendars_id, taskListName: "", taskListColor: '', view: props.view, isLoading:true }
        this.renderTaskListUI = this.renderTaskListUI.bind(this)
        this.asyncSaveLabelstoDB = this.asyncSaveLabelstoDB.bind(this)
        this.getCalendarName = this.getCalendarName.bind(this)
        this.fetchEvents = this.fetchEvents.bind(this)

    }
    componentDidMount() {
        //console.log(this.props.caldav_accounts_id, this.props.calendars_id)
        try {
            if (this.props.caldav_accounts_id && this.props.calendars_id) {
                this.fetchEvents()
                this.getCalendarName()

            }
            else {
                this.getAllTodosfromServer()
            }
        }
        catch (e) {
            console.log(e)
        }

    }
    componentDidUpdate(prevProps, prevState) {

        if (this.props.caldav_accounts_id !== prevProps.caldav_accounts_id || this.props.calendars_id !== prevProps.calendars_id || this.props.filter != prevProps.filter || this.props.updated != prevProps.updated || this.props.view != prevProps.view) {

            this.setState({ taskList: <Loading centered={true} padding={20} /> })
            if (this.props.caldav_accounts_id != null && this.props.calendars_id != null) {
                this.fetchEvents()
                this.getCalendarName()

            }
            else {
                this.getAllTodosfromServer()
            }
        }



    }
    async getAllTodosFromDexie() {
        //Formulates a response like the API.
        var toReturn = {
            success: true,
            data: {
                message: []
            }
        }
        const allSummary = await getCalDAVSummaryFromDexie()
        if (isValidResultArray(allSummary)) {
            for (const i in allSummary) {
                if (isValidResultArray(allSummary[i]["calendars"])) {
                    for (const j in allSummary[i]["calendars"]) {
                        let cal = allSummary[i]["calendars"][j]
                        let info = {
                            caldav_account: allSummary[i]["name"],
                            caldav_accounts_id: allSummary[i]["caldav_accounts_id"],
                            calendar: cal["displayName"],
                            color: cal["calendarColor"]
                        }
                        // console.log("cal", cal)
                        const events = await fetchEventsForCalendarsFromDexie(cal["calendars_id"])
                        let toAddToResult = {
                            info: info,
                            events: events
                        }
                        toReturn.data.message.push(toAddToResult)
                    }


                }
            }

        }


        return toReturn

    }
    async getAllTodosfromServer() {
        var responseFromServer = await this.getAllTodosFromDexie("todo")
        var output = []
        output.push(<h2 key={this.props.title} style={{ paddingTop: 10, paddingBottom: 10 }}>{this.props.title}</h2>)
        var combinedTodoList = [{}, {}, {}, {}]
        if (responseFromServer != null && responseFromServer.success == true && responseFromServer.data.message != null) {
            for (const i in responseFromServer.data.message) {
                var todoArray = responseFromServer.data.message[i].events
                getEvents(todoArray, this.props.filter).then(todoListSorted =>{
                    var taskListName = responseFromServer.data.message[i].info.caldav_account + ">>" + responseFromServer.data.message[i].info.calendar
                    if (todoListSorted[0]!=null && Object.keys(todoListSorted[0]).length>0) {
                        if(this.props.view=="tasklist")
                        {
                            output.push(<div key={taskListName}><h4  autoFocus style={{ paddingTop: 30,  }}>{taskListName}</h4><TaskView scheduleItem={this.props.scheduleItem} fetchEvents={this.props.fetchEvents} todoList={todoListSorted} context={this} filter={this.props.filter} view={this.props.view} listName={taskListName} listColor={responseFromServer.data.message[i].info.color} /></div>)
    
                        }else{
                            for(const k in todoListSorted[0])
                            {
                                combinedTodoList[0][k]=todoListSorted[0][k]
                            }
                            for(const k in todoListSorted[1])
                            {
                                combinedTodoList[1][k]=todoListSorted[1][k]
                            }
                            for(const k in todoListSorted[2])
                            {
                                combinedTodoList[2][k]=todoListSorted[2][k]
                                combinedTodoList[3][k]=responseFromServer.data.message[i].info.color
    
                            }
                            
                        }
                       /* output.push((
                            <>
                                {TaskView(todoListSorted, this, this.props.filter, "list", taskListName, "")}
                            </>
                        ))
                        */
    
                    }
                    if(this.props.view=="ganttview")
                    {
                        this.setState( {taskList: <TaskView fetchEvents={this.props.fetchEvents} todoList={combinedTodoList} context={this} filter={this.props.filter} view={this.props.view} listName={""}  />, isLoading:false})
                    }else{
                        if(this.state.taskList && Array.isArray(this.state.taskList)){

                            this.setState({ taskList: [...this.state.taskList,...output], isLoading:false })
                        }else{
                            this.setState({ taskList: output, isLoading:false })
                
                        }
                
                    }
                    
            
                } )


                
            }
        }
       

        
        // if(output.length==1)
        // {
        //     output=[]
        //     output.push(<h2 key={this.props.title} style={{ paddingTop: 10, paddingBottom: 10 }}>{this.props.title}</h2>)
        //     output.push(<div style={{margin: 20}}>{this.i18next.t("NOTHING_TO_SHOW")}</div>)
        // }

    }
    
    async asyncSaveLabelstoDB(todoList) {
        if (todoList != null && Array.isArray(todoList) && todoList.length > 0) {
            for (const key in todoList[1]) {
                if (todoList[1][key].todo.category != null) {
                    for (const cat in todoList[1][key].todo.category) {
                        saveLabeltoDB(todoList[1][key].todo.category[cat])

                    }
                }

            }
        }




    }

    async getCalendarName() {
        if (this.props.calendars_id != null && this.props.caldav_accounts_id != null) {
            const taskListName = await getNameForTaskList(this.props.caldav_accounts_id, this.props.calendars_id)
            this.setState({ taskListName: taskListName, taskListColor: "body.data.message.color" })
            // const url_api = getAPIURL() + "caldav/calendars/name?caldav_accounts_id=" + this.props.caldav_accounts_id + "&&calendars_id=" + this.props.calendars_id
            // const authorisationData = await getAuthenticationHeadersforUser()

            // const requestOptions =
            // {
            //     method: 'GET',
            //     mode: 'cors',
            //     headers: new Headers({ 'authorization': authorisationData }),

            // }


            //     const response = fetch(url_api, requestOptions)
            //     .then(response => response.json())
            //     .then((body) => {
            //         //Save the events to db.
            //         if (body.data.message != null && body.data.message.caldav_name != null) {
            //             this.setState({ taskListName: body.data.message.caldav_name + " >> " + body.data.message.calendar_name, taskListColor:body.data.message.color })
            //         }
            //     }).catch(e =>
            //     {
            //         console.error(e, "TaskList:getCalendarName")
            //     })
        }

    }
    renderTaskListUI(todoList) {

        /*
        this.setState({
            taskList: (<> <h4 style={{ paddingTop: 10, paddingBottom: 10 }}>{this.state.taskListName}</h4>
                {TaskView(todoList, this, this.props.filter, "list", "","", this.props.taskClicked )}</>)
        })

        */
        this.setState({ taskList: (<> <h2 key={this.props.calendars_id + "_" + this.props.caldav_accounts_id + "headingName"} style={{ paddingTop: 10, paddingBottom: 10 }}>{this.state.taskListName}</h2><TaskView scheduleItem={this.props.scheduleItem} fetchEvents={this.props.fetchEvents} todoList={todoList} context={this} filter={this.props.filter} view={this.props.view} listColor={this.state.taskListColor} /></>) })

    }


    async fetchEvents() {
        const eventsFromDexie = await fetchEventsForCalendarsFromDexie(this.props.calendars_id)
        // console.log(eventsFromDexie)
        const todoList = await getEvents(eventsFromDexie, this.props.filter)
        if (todoList != null && Array.isArray(todoList) && todoList.length > 0) {
            this.renderTaskListUI(todoList)
        }
    }
    async refreshCalendars() {
        var userArray = await getUserData()
        var response = await getLatestCalendarEvents(this.props.caldav_accounts_id, this.props.calendars_id, "")
        if (response != null) {

            if (response.success == true) {
                //console.log(response.data.message)
                const todoList = await getEvents(response.data.message, this.props.filter)
                if (todoList != null && Array.isArray(todoList) && todoList.length > 0) {
                    this.renderTaskListUI(todoList)
                }

            }
            else {
                var message = getMessageFromAPIResponse(response)
                console.error("refreshCalendars", message, response)

                if (message != null) {

                    if (message != "PLEASE_LOGIN") {
                        toast.error(this.i18next.t(message))

                    }

                    // if(message=="PLEASE_LOGIN")
                    // {
                    //     // Login required
                    //     var redirectURL="/login"
                    //     if(window!=undefined)
                    //     {


                    //         redirectURL +="?redirect="+window.location.pathname
                    //     }
                    //     this.props.router.push(redirectURL)


                    // }else{

                    // }
                }
                else {
                    toast.error(this.i18next.t("ERROR_GENERIC"))

                }
            }
        } else {

            toast.error(this.i18next.t("ERROR_GENERIC"))





        }


    }


    render() {

        const result = this.state.isLoading ?  <Loading padding={20} centered={true} />: this.state.taskList
        return result


    }
}

export default withRouter(TaskList)