import { fetchAllEventsFromDexie, fetchEventsForCalendarsFromDexie } from "@/helpers/frontend/dexie/events_dexie"
import { filterEvents } from "@/helpers/frontend/events"
import { getI18nObject } from "@/helpers/frontend/general"
import {  useAtomValue, useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { calDavObjectAtom, currentPageTitleAtom, currentViewAtom, filterAtom, updateViewAtom } from "stateStore/ViewStore"
import { TaskArrayItem, TaskSection, arrangeTodoListbyHierarchyV2,  getCaldavAndCalendarNameForView } from "@/helpers/frontend/TaskUI/taskUIHelpers"
import { Loading } from "@/components/common/Loading"
import { TaskViewMain } from "./TaskViewMain/TaskViewMain"
import { DEFAULT_SORT_OPTION, sortTasksByRequest } from "@/helpers/frontend/TaskUI/taskSort"
import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie"
import { isValidResultArray } from "@/helpers/general"
import { TaskViewSectionsManager } from "./TaskViewMain/TaskViewSectionsManager"
import { GanttViewWithState } from "./GanttView/GanttViewWithState"

const i18next = getI18nObject()

export const TaskListFrameWork = () =>{
    /**
     * Jotai
     */
    const currentPageTitle = useAtomValue(currentPageTitleAtom)
    const currentPageFilter = useAtomValue(filterAtom)
    const currentCalDavObjectAtom= useAtomValue(calDavObjectAtom)
    const updateView = useAtomValue(updateViewAtom)
    const currentView = useAtomValue(currentViewAtom)

    const setPageTitleAtom = useSetAtom(currentPageTitleAtom)
    /**
     * Local State
     */
    const [taskListSection, setTaskListSection] = useState<TaskSection[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const nothingToShow =() =>{
        setIsLoading(false)
        setTaskListSection([])
    }
    const renderTaskListUI = (todoList: TaskSection[]) => {

        setTaskListSection(todoList)
        setIsLoading(false)

    }

    const fetchEventsForCalendar = async () => {
        const eventsFromDexie = await fetchEventsForCalendarsFromDexie(currentCalDavObjectAtom.calendars_id,"VTODO")
        // console.log(eventsFromDexie)
        getCaldavAndCalendarNameForView(currentCalDavObjectAtom.caldav_accounts_id, currentCalDavObjectAtom.calendars_id).then(name =>{
            setPageTitleAtom(name)
        })
        const filteredTodos = filterEvents(eventsFromDexie, currentPageFilter)
        const todoList_heirarchy = arrangeTodoListbyHierarchyV2(filteredTodos, eventsFromDexie)
        // console.log(todoList_heirarchy)
        const sortedTodoList = sortTasksByRequest(todoList_heirarchy, DEFAULT_SORT_OPTION)
        if (filteredTodos != null && Array.isArray(filteredTodos) && filteredTodos.length > 0) {
            let finalToPush:TaskSection[] = []
            finalToPush.push({
                name: null,
                tasks: sortedTodoList
            })
            renderTaskListUI(finalToPush)

        }else{
            nothingToShow()
        }

    }

    const fetchAllEvents = async () => {
        console.time("dexie_COMBINED_TASK_TIMER")
        const allSummary = await getCalDAVSummaryFromDexie()
        let finalToPush:TaskSection[] = []
        if (isValidResultArray(allSummary)) {
            for (const i in allSummary) {
                if (isValidResultArray(allSummary[i]["calendars"])) {
                    for (const j in allSummary[i]["calendars"]) {
                        let cal = allSummary[i]["calendars"][j]
                        const eventsFromDexie = await fetchEventsForCalendarsFromDexie(cal["calendars_id"], "VTODO")
                        const filteredTodos = filterEvents(eventsFromDexie, currentPageFilter)
                        const todoList_heirarchy = arrangeTodoListbyHierarchyV2(filteredTodos, eventsFromDexie)
                        const sortedTodoList = sortTasksByRequest(todoList_heirarchy, DEFAULT_SORT_OPTION)
                        // console.log("eventsFromDexie", eventsFromDexie,"filteredTodos",filteredTodos, "todoList_heirarchy", todoList_heirarchy, "sortedTodoList", sortedTodoList)
                        if(sortedTodoList.length>0){

                            finalToPush.push({
                                name: allSummary[i]["name"]+" >> "+cal["displayName"],
                                tasks: sortedTodoList
                            })
                        }
                      
                
                    }
                }
             
            }
        }
        // console.log(finalToPush, "finalToPush")
        renderTaskListUI(finalToPush)
        // console.log(currentPageFilter, filteredTodos, eventsFromDexie)
        
        // console.log("todoList_heirarchy", todoList_heirarchy)
        console.timeEnd("dexie_COMBINED_TASK_TIMER")
        
    }
    useEffect(() => {
        let isMounted = true
        if(isMounted)
        {
            if(("caldav_accounts_id" in currentCalDavObjectAtom) && ("calendars_id" in currentCalDavObjectAtom) && currentCalDavObjectAtom.calendars_id && currentCalDavObjectAtom.caldav_accounts_id){
                //Fetch events for the calendar.
                fetchEventsForCalendar()
            }else{
                //Fetch all events and apply filters.
                fetchAllEvents()
            }
        }
        return ()=>{
            isMounted = false
        }
    }, [currentPageFilter, updateView, currentCalDavObjectAtom])

    


    

    const view_Final = (currentView=="ganttview") ? <GanttViewWithState taskListSections={taskListSection} /> : <TaskViewSectionsManager taskListSections={taskListSection} />
    return(
        <>
        {isLoading ? <Loading centered={true} />: view_Final}
        <br />
        <br />
        </>
    )

}