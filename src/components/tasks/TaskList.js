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
 class TaskList extends Component {
    constructor(props) {
        super(props)
        var i18next = getI18nObject()
        this.i18next = i18next
        this.refreshCalendars = this.refreshCalendars.bind(this)
        this.state = { i18next: i18next, toast_placeholder: null, taskList: <div style={{margin:20}}><Loading centered={true} /></div>, caldav_accounts_id: this.props.caldav_accounts_id, calendars_id: this.props.calendars_id, taskListName: "", taskListColor: '', view:props.view }
        this.renderTaskListUI = this.renderTaskListUI.bind(this)
        this.asyncSaveLabelstoDB = this.asyncSaveLabelstoDB.bind(this)
        this.getCalendarName = this.getCalendarName.bind(this)

    }
    componentDidMount() {

        try {
            if (this.props.caldav_accounts_id != null && this.props.calendars_id != null && this.props.caldav_accounts_id.trim()!="" && this.props.calendars_id.trim() != "") {
                this.refreshCalendars()
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

        if (this.props.caldav_accounts_id !== prevProps.caldav_accounts_id || this.props.calendars_id !== prevProps.calendars_id || this.props.filter != prevProps.filter || this.props.updated!= prevProps.updated || this.props.view!= prevProps.view ) {
            
            this.setState({taskList: null})
            if (this.props.caldav_accounts_id != null && this.props.calendars_id != null) {
                this.refreshCalendars()
                this.getCalendarName()

            }
            else {
                this.getAllTodosfromServer()
            }
        }



    }
    async getAllTodosfromServer() {
        var responseFromServer = await getAllEvents("todo")
        var output = []
        output.push(<h2 key={this.props.title} style={{ paddingTop: 10, paddingBottom: 10 }}>{this.props.title}</h2>)
        var combinedTodoList = [{}, {}, {}, {}]
        if (responseFromServer != null && responseFromServer.success == true && responseFromServer.data.message != null) {
            for (const i in responseFromServer.data.message) {
                var todoArray = responseFromServer.data.message[i].events
                const todoListSorted = await getEvents(todoArray, this.props.filter)
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
            }
        }
        else{
            if(responseFromServer==null)
            {
                toast.error(this.i18next.t("ERROR_GENERIC"))
            }else{
                var message= getMessageFromAPIResponse(responseFromServer)
                if(message!=null)
                {
                    if(message=="PLEASE_LOGIN")
                    {
                        // Login required
                        var redirectURL="/login"
                        if(window!=undefined)
                        {


                            redirectURL +="?redirect="+window.location.pathname
                        }
                        this.props.router.push(redirectURL)


                    }else{
                        toast.error(this.i18next.t(message))

                    }
                }
                else
                {
                    toast.error(this.i18next.t("ERROR_GENERIC"))

                }

            }

        }

        if(this.props.view=="ganttview")
        {
        output.push(<TaskView fetchEvents={this.props.fetchEvents} todoList={combinedTodoList} context={this} filter={this.props.filter} view={this.props.view} listName={""}  />)
        }
        if(output.length==1)
        {
            output=[]
            output.push(<h2 key={this.props.title} style={{ paddingTop: 10, paddingBottom: 10 }}>{this.props.title}</h2>)
            output.push(<div style={{margin: 20}}>{this.i18next.t("NOTHING_TO_SHOW")}</div>)
        }
        this.setState({ taskList: output })


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
            const url_api = process.env.NEXT_PUBLIC_API_URL + "caldav/calendars/name?caldav_accounts_id=" + this.props.caldav_accounts_id + "&&calendars_id=" + this.props.calendars_id
            const authorisationData = await getAuthenticationHeadersforUser()

            const requestOptions =
            {
                method: 'GET',
                mode: 'cors',
                headers: new Headers({ 'authorization': authorisationData }),

            }

            const response = fetch(url_api, requestOptions)
                .then(response => response.json())
                .then((body) => {
                    //Save the events to db.
                    if (body.data.message != null && body.data.message.caldav_name != null) {
                        this.setState({ taskListName: body.data.message.caldav_name + " >> " + body.data.message.calendar_name, taskListColor:body.data.message.color })
                    }
                })

        }

    }
    renderTaskListUI(todoList) {

        /*
        this.setState({
            taskList: (<> <h4 style={{ paddingTop: 10, paddingBottom: 10 }}>{this.state.taskListName}</h4>
                {TaskView(todoList, this, this.props.filter, "list", "","", this.props.taskClicked )}</>)
        })

        */
        this.setState({taskList: (<> <h2 style={{ paddingTop: 10, paddingBottom: 10 }}>{this.state.taskListName}</h2><TaskView scheduleItem={this.props.scheduleItem} fetchEvents={this.props.fetchEvents} todoList={todoList} context={this} filter={this.props.filter} view={this.props.view} listColor={this.state.taskListColor} /></>)})

    }


    async refreshCalendars() {
        var userArray = await getUserData()
        var response = await getLatestCalendarEvents(this.props.caldav_accounts_id, this.props.calendars_id, "")

        if (response != null) {

            if (response.success == true) {
                const todoList = await getEvents(response.data.message, this.props.filter)
                console.log("todoList.length", todoList.length)
                if (todoList != null && Array.isArray(todoList) && todoList.length > 0) {
                    this.renderTaskListUI(todoList)
                }

            }
            else {
                var message= getMessageFromAPIResponse(response)
                if(message!=null)
                {
                    if(message=="PLEASE_LOGIN")
                    {
                        // Login required
                        var redirectURL="/login"
                        if(window!=undefined)
                        {


                            redirectURL +="?redirect="+window.location.pathname
                        }
                        this.props.router.push(redirectURL)


                    }else{
                        toast.error(this.i18next.t(message))

                    }
                }
                else
                {
                    toast.error(this.i18next.t("ERROR_GENERIC"))

                }
            }
        }else{
            
                toast.error(this.i18next.t("ERROR_GENERIC"))
            
               

            

        }


    }


    render() {

        return this.state.taskList
            
        

    }
}

export async function getStaticProps() {
    return {
        props: {

        },
    }

}

export default withRouter(TaskList)