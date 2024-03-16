import { TaskArrayItem, TaskSection } from "@/helpers/frontend/TaskUI/taskUIHelpers"
import { getI18nObject } from "@/helpers/frontend/general"
import { Gantt, ViewMode, Task } from "gantt-task-react"
import "gantt-task-react/dist/index.css";
import { DummyTaskListComponent } from "../../gantt_Dummy/DummyTaskListComponent"
import { DummyTaskHeaderComponent } from "../../gantt_Dummy/DummyTaskHeaderComponent"
import { useEffect, useState } from "react"
import { getEventColourbyID, getEventFromDexieByID } from "@/helpers/frontend/dexie/events_dexie"
import { RecurrenceHelper } from "@/helpers/frontend/classes/RecurrenceHelper"
import { returnGetParsedVTODO } from "@/helpers/frontend/calendar"
import moment from "moment"
import { categoryArrayHasLabel } from "@/helpers/frontend/labels"
import { PRIMARY_COLOUR } from "@/config/style"
import { TaskType } from "gantt-task-react/dist/types/public-types"
import { TaskPending } from "@/helpers/api/tasks";
import { VTODO } from "@/helpers/frontend/classes/VTODO";
import { Loading } from "@/components/common/Loading";
import { GanttFilters } from "./GanttFilters";
import { useAtomValue, useSetAtom } from "jotai";
import { showTaskEditorAtom, taskEditorInputAtom } from "stateStore/TaskEditorStore";
import { Button, Col, Row } from "react-bootstrap";
import HelpGanttView from "../../GanttView/HelpGanttView";

const i18next = getI18nObject()


export const GanttViewWithState = ({taskListSections}:{taskListSections: TaskSection[]}) =>{

    /**
     * Jotai
     */

    const setShowTaskEditorAtom = useSetAtom(showTaskEditorAtom)
    const setTaskEditorInputAtom = useSetAtom(taskEditorInputAtom)


    /**
     * Local State
     */
    const [viewDate, setViewDate] = useState(new Date())
    const [ganttTasks, setGanttTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showTasksWithoutDue, setShowTasksWithoutDue] = useState(false)
    const [showChildren, setShowChildren] = useState(true)
    const [showWithoutDue, setShowWithoutDue] = useState(true)
    const [view, setView] = useState(ViewMode.Week)

    const generateGanttList = async(taskList: TaskArrayItem[]) =>{

        let toReturn: Task[] = []
        for(const k in taskList)
        {
            // Get the task from dexie.
            const task = await getEventFromDexieByID(parseInt(taskList[k].id.toString()))
            if(task && task.length>0){
                
                const parsedTasks = returnGetParsedVTODO(task[0].data)
                if(parsedTasks && TaskPending(parsedTasks)){
                    let dueDate= new Date()
                    let hasDueDate = false
                    if (parsedTasks.rrule) {
                        //Repeating Object
                        var recurrenceObj = new RecurrenceHelper(parsedTasks)
                        
                        dueDate= new Date(moment(recurrenceObj.getNextDueDate()).toString())
                        hasDueDate = true
                    }else{
                        if(parsedTasks.due){
                            dueDate = new Date(moment(parsedTasks.due).toString())
                            hasDueDate = true
                        }
                    }
                    // console.log("due date", dueDate)
                    let startDate = new Date()
                    if (parsedTasks.start != null && parsedTasks.start != "" && parsedTasks.start != undefined) {
                        startDate = new Date(moment(parsedTasks.start).toString())
                    }else{
                        if(new Date(dueDate).getTime() < Date.now())
                        {
                            // Due date is in the past.
                            // Set Start date same as the due date.
                            
                            startDate = dueDate
                            
                        }else{
                            startDate = new Date(Date.now())
                        }
                    }
                    
                    if(moment(startDate).unix()>moment(dueDate).unix())
                    {
                        startDate= dueDate
                    }
                    
                    let type: TaskType = "task"
                    
                    if (parsedTasks.category != null && Array.isArray(parsedTasks.category) && parsedTasks.category.length > 0) {
                        if (categoryArrayHasLabel(parsedTasks.category, "Project")) {
                            type = "project"
                        } else if (categoryArrayHasLabel(parsedTasks.category, "milestone")) {
                            type = "milestone"
                        }
                    }
                    let backgroundColor =PRIMARY_COLOUR
                    if(task[0].calendar_events_id){
                        backgroundColor = await getEventColourbyID(parseInt(task[0].calendar_events_id.toString()))
                    }
                    // Add parent relationship, if any.
                    const parentID = VTODO.getParentIDFromRelatedTo(parsedTasks.relatedto)

                    let toPush: Task ={
                        start: startDate,
                        end: dueDate,
                        name: parsedTasks.summary,
                        id: taskList[k].id.toString(),
                        type: type,
                        progress: parsedTasks.completion,
                        isDisabled: false,
                        styles: { backgroundColor: backgroundColor, progressColor: 'white', progressSelectedColor: '#ff9e0d' },
                    }
                    if(parentID){
                        toPush["dependencies"]=[parsedTasks.relatedto]
                    }
                    let pushTask = true
                    if(!hasDueDate){
                        if(!showTasksWithoutDue){
                            pushTask= false
                        }
                        
                    }

                    if(pushTask){
                        if(showTasksWithoutDue && !hasDueDate){
                            //Probably a faux date.
                            toPush.isDisabled=true
                        }
                        toReturn.push(toPush)
                        if(showChildren==false)
                        {
                            continue
                        }
                        if(taskList[k].children && taskList[k].children.length>0)
                        {
                            //Recursively add children.
                            const childrenGanttTasks: Task[] = await generateGanttList(taskList[k].children)
                            if(childrenGanttTasks && childrenGanttTasks.length>0)
                            {
                                toReturn = [...toReturn, ...childrenGanttTasks]
                            }
                        }
                    }
                }
            }
        }
        return toReturn
    }

    const processTaskListSections  = async() =>{
        setIsLoading(true)
        let finalGanttArray : Task[]  = []
        for(const i in taskListSections){
            const ganttArray = await generateGanttList(taskListSections[i].tasks)
            if(ganttArray && ganttArray.length>0){
                finalGanttArray =[...finalGanttArray, ...ganttArray]
            }

        }
        // console.log(finalGanttArray)
        setGanttTasks(finalGanttArray)
        setIsLoading(false)
    }


    useEffect(()=>{
        let isMounted = true
        if(isMounted)
        {
            processTaskListSections()
        }
        return ()=>{
            isMounted = false
        }
        
    },[taskListSections])
    const taskClicked =async (e) =>{
        // console.log(e)
        if(e && e.id){

            setTaskEditorInputAtom({id: e.id})
            setShowTaskEditorAtom(true)
        }
    }
    const onDateChange  =(e) =>{

        setTaskEditorInputAtom({
            id:e.id,
            start: e.start,
            due: e.end
        })
        setShowTaskEditorAtom(true)
        // newData.start= moment(e.start).format("YYYYMMDD")
        // newData.due= moment(e.end).format("YYYYMMDD")
    }

    

    const onShowTaskWithoutDueChanged =(show)=>{
        setShowTasksWithoutDue(show)
    }
    const onViewChanged = (view: ViewMode) =>{
        setView(view)
    }
    const onShowChildrenChanged = (show) =>{
        setShowChildren(show)
    }
    const jumpToToday = () =>{
        setViewDate(new Date(Date.now()-(86400*1000*3)))
    }
    const getGanttView = ()  =>{
        if(isLoading){
            return <Loading centered={true} />
        }
        if(ganttTasks.length>0){

            return <Gantt viewMode={view}  TaskListTable={DummyTaskListComponent} onDoubleClick={taskClicked}  viewDate={viewDate}  todayColor="#FFF8DC" onDateChange={onDateChange} TaskListHeader={DummyTaskHeaderComponent} tasks={ganttTasks} />
        }

        return i18next.t("NOTHING_TO_SHOW")
    }
    return(
        <>
        <Row style={{flex:1, alignContent:"space-between"}}>
            <Col style={{textAlign: "center"}}>
                <Button variant="outline-info" onClick={jumpToToday} size="sm">{i18next.t("TODAY")}</Button>
            </Col>
            <Col>
                <HelpGanttView />
            </Col>
        </Row>

        <GanttFilters onViewChanged={onViewChanged} onShowChildrenChanged={onShowChildrenChanged} onShowTaskWithoutDueChanged={onShowTaskWithoutDueChanged} />
        {getGanttView()}
        </>
    )
}