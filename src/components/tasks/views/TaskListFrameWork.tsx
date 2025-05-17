import { fetchAllEventsFromDexie, fetchEventsForCalendarsFromDexie } from "@/helpers/frontend/dexie/events_dexie"
import { filterEvents } from "@/helpers/frontend/events"
import { useAtomValue, useSetAtom } from "jotai"
import { useCallback, useEffect, useState } from "react"
import { calDavObjectAtom, currentPageTitleAtom, currentViewAtom, filterAtom, updateViewAtom } from "stateStore/ViewStore"
import { TaskArrayItem, TaskSection, arrangeTodoListbyHierarchyV2, getCaldavAndCalendarNameForView, returnTaskListFilteredandSorted } from "@/helpers/frontend/TaskUI/taskUIHelpers"
import { Loading } from "@/components/common/Loading"
import { TaskViewMain } from "./TaskViewMain/TaskViewMain"
import { DEFAULT_SORT_OPTION, sortTasksByRequest } from "@/helpers/frontend/TaskUI/taskSort"
import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie"
import { isValidResultArray } from "@/helpers/general"
import { TaskViewSectionsManager } from "./TaskViewMain/TaskViewSectionsManager"
import { GanttViewWithState } from "./GanttView/GanttViewWithState"
import { PAGE_VIEW_JSON } from "@/helpers/viewHelpers/pages"


export const TaskListFrameWork = () => {
    /**
     * Jotai
     */
    const currentPageTitle = useAtomValue(currentPageTitleAtom)
    const currentPageFilter = useAtomValue(filterAtom)
    const currentCalDavObjectAtom = useAtomValue(calDavObjectAtom)
    const updateView = useAtomValue(updateViewAtom)
    const currentView = useAtomValue(currentViewAtom)

    const setPageTitleAtom = useSetAtom(currentPageTitleAtom)

    /**
     * Local State
     */
    const [taskListSection, setTaskListSection] = useState<TaskSection[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchEventsForCalendar = useCallback(async () => {
        if (!currentCalDavObjectAtom.calendars_id) {
            setTaskListSection([])
            return
        }
        // console.log("fetchEventsForCalendar: I WAS CALLED")
        console.time("dexie_fetchEventsForCalendarsFromDexie")

        const eventsFromDexie = await fetchEventsForCalendarsFromDexie(currentCalDavObjectAtom.calendars_id, "VTODO")
        // console.log(eventsFromDexie)
        console.timeEnd("dexie_fetchEventsForCalendarsFromDexie")

        getCaldavAndCalendarNameForView(currentCalDavObjectAtom.caldav_accounts_id, currentCalDavObjectAtom.calendars_id).then(name => {
            setPageTitleAtom(name)
        })
        console.time("dexie_returnTaskListFilteredandSorted")

        const sortedTodoList =  await returnTaskListFilteredandSorted(eventsFromDexie, currentPageFilter)
        console.timeEnd("dexie_returnTaskListFilteredandSorted")

        if (sortedTodoList != null && Array.isArray(sortedTodoList) && sortedTodoList.length > 0) {
            let finalToPush: TaskSection[] = []
            finalToPush.push({
                name: null,
                tasks: sortedTodoList
            })
            setTaskListSection(finalToPush)
    
        } else {
            setTaskListSection([])
        }

        setIsLoading(false)
    },[currentCalDavObjectAtom.caldav_accounts_id, currentCalDavObjectAtom.calendars_id, currentPageFilter, setPageTitleAtom])

    const fetchAllEvents = useCallback(async () => {
        
        // console.log("fetchAllEvents: I WAS CALLED")
        console.time("dexie_COMBINED_TASK_TIMER")
        // console.time("dexie_COMBINED_TASK_GET_CALSUMM")
    
        const allSummary = await getCalDAVSummaryFromDexie()
        // console.timeEnd("dexie_COMBINED_TASK_GET_CALSUMM")

        let finalToPush: TaskSection[] = []
        if (isValidResultArray(allSummary)) {
            for (const i in allSummary) {
                if (isValidResultArray(allSummary[i]["calendars"])) {
                    for (const j in allSummary[i]["calendars"]) {
                        let cal = allSummary[i]["calendars"][j]
                        const eventsFromDexie = await fetchEventsForCalendarsFromDexie(cal["calendars_id"], "VTODO")
                        // console.log("eventsFromDexie", eventsFromDexie, allSummary[i]["calendars"][j])
                        // console.time("dexie_returnTaskListFilteredandSorted")

                        const sortedTodoList = await returnTaskListFilteredandSorted(eventsFromDexie, currentPageFilter)
                        // console.timeEnd("dexie_returnTaskListFilteredandSorted")

                        // console.log("eventsFromDexie", eventsFromDexie,"filteredTodos",filteredTodos, "todoList_heirarchy", todoList_heirarchy, "sortedTodoList", sortedTodoList)
                        if (sortedTodoList.length > 0) {

                            finalToPush.push({
                                name: allSummary[i]["name"] + " >> " + cal["displayName"],
                                tasks: sortedTodoList
                            })
                        }


                    }
                }

            }
        }
        // console.log(finalToPush, "finalToPush")
        setTaskListSection(finalToPush)
        // console.log(currentPageFilter, filteredTodos, eventsFromDexie)
        // console.log("todoList_heirarchy", todoList_heirarchy)
        console.timeEnd("dexie_COMBINED_TASK_TIMER")
        setIsLoading(false)

    },[currentPageFilter])

    useEffect(() => {
        let isMounted = true
        if (isMounted) {
            
            if (("caldav_accounts_id" in currentCalDavObjectAtom) && ("calendars_id" in currentCalDavObjectAtom) && currentCalDavObjectAtom.calendars_id && currentCalDavObjectAtom.caldav_accounts_id) {
                //Fetch events for the calendar.
                fetchEventsForCalendar()
            } else {
                //Fetch all events and apply filters.
                fetchAllEvents()
            }

            // console.log("jotai",currentPageFilter, updateView, currentCalDavObjectAtom)
        }
        return () => {
            isMounted = false
        }
    }, [fetchAllEvents, fetchEventsForCalendar, currentPageFilter, updateView, currentCalDavObjectAtom])

    // useEffect(()=>{
    //     let isMounted = true
    //     if (isMounted) {

    //         if(window!=undefined && !urlParsed){
    //             const queryString = window.location.search;
    //             const params = new URLSearchParams(queryString);
    //             const pageName = params.get('name')
    //             console.log("pageName",urlParsed, pageName ,PAGE_VIEW_JSON[pageName!])
    //             if(pageName){
        
    //                 setFilterAtom(PAGE_VIEW_JSON[pageName])
    //                 setCalDavAtom({caldav_accounts_id: null, calendars_id: null})
    //                 setPageTitleAtom(t(pageName).toString())
    //                 setURLPased(true)
    //             }
        
    //         }
    //     }
    //     return () => {
    //         isMounted = false
    //     }
    // },[])




    const view_Final = (currentView == "ganttview") ? <GanttViewWithState taskListSections={taskListSection} /> : <TaskViewSectionsManager taskListSections={taskListSection} />
    return (
        <>
            {isLoading ? <Loading centered={true} /> : view_Final}
            {/* {view_Final} */}
            <br />
            <br />
        </>
    )

}