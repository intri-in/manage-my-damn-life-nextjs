import { TaskArrayItem, TaskSection, filterTaskListArray, removeDoneTasksFromTaskListArray } from "@/helpers/frontend/TaskUI/taskUIHelpers";
import { useEffect, useState } from "react";
import { LocalTaskFilters, labelSelector } from "./LocalTaskFilters";
import { Loading } from "@/components/common/Loading";
import { RenderTaskList } from "./RenderTaskList";
import i18next from "i18next";
import { DEFAULT_SORT_OPTION, sortTasksByRequest } from "@/helpers/frontend/TaskUI/taskSort";

export const TaskViewSectionsManager = ({taskListSections}:{taskListSections: TaskSection[]}) =>{
    const [showDone, setShowDone] = useState(false)
    const [labelList, setLabelList] = useState<labelSelector[]>([])
    const [isLoading, setLoading] = useState(true)
    const [finalOutput, setFinalOutput] = useState<JSX.Element[]>([])
    const [sortOption, setSortOption] = useState(DEFAULT_SORT_OPTION)
    useEffect(()=>{
        let isMounted = true
        if(isMounted){
            //We render sections separately.
            generateFinalOutput(showDone, labelList, taskListSections)
            setLoading(false)
        }

        return ()=>{
            isMounted = false
        }
    },[taskListSections])
    const generateFinalOutput = async (showDoneLocal,labelListLocal, taskListSectionsLocal: TaskSection[], sortByLocal?:string ) =>{
        const toSortBy = sortByLocal ? sortByLocal: sortOption
        let finalOutput: JSX.Element[] = []
        // setLoading(true)
        if(taskListSectionsLocal.length==0)
        {
            setFinalOutput([<p key={"nothing_to_show"}>{i18next.t("NOTHING_TO_SHOW")}</p>])
            setLoading(false)
            return
        }
        for(const k in taskListSectionsLocal){
            const finalTaskList = await refilterAndSortTaskList(showDoneLocal, labelListLocal, taskListSectionsLocal[k].tasks, toSortBy)
            if(finalTaskList.length<=0){
                continue
            }
            if(taskListSectionsLocal[k].name){
                finalOutput.push(
                    <div style={{marginBottom:10}} key={taskListSectionsLocal[k].name+"_"+k}>
                        <b><small>{taskListSectionsLocal[k].name}</small></b>
                    </div>
                )    
            }
            finalOutput.push(
                <div style={{marginBottom: 20}} key={k+"_"+taskListSectionsLocal[k].name+"_TaskList"}>
                    <RenderTaskList sortBy="due_asc" level={0} taskList={finalTaskList} />
                </div>
            )
        }
        setFinalOutput(finalOutput)
    }
    const showDoneChangedHook =async (selected: boolean) =>{
        setShowDone(selected)
        generateFinalOutput(selected, labelList, taskListSections)
    }
    const refilterAndSortTaskList = async (showDoneLocal, labelListLocal, taskListLocal: TaskArrayItem[], sortByOption?:string) =>{
        
        const sortByOptionLocal = sortByOption ? sortByOption: sortOption
        let newTaskList_AfterDoneFilter: TaskArrayItem[] = []
        if(showDoneLocal==false){
            newTaskList_AfterDoneFilter = await removeDoneTasksFromTaskListArray(taskListLocal)
        }else{
            newTaskList_AfterDoneFilter=[...taskListLocal]
        }
        // Now we filter by Label.

        let newLabelArray: string[] = []
        for(const k in labelListLocal){
            if(labelListLocal[k].selected==true){
                newLabelArray.push(labelListLocal[k].name)
            }
        }
        let filter= {}
        if(newLabelArray.length!=0){
            filter = {logic: "or", filter:{label: newLabelArray}}
        }

        let finalListToReturn: TaskArrayItem[] = []


        finalListToReturn = await filterTaskListArray(newTaskList_AfterDoneFilter, filter)

        const newSortedRow = sortTasksByRequest(finalListToReturn, sortByOptionLocal)
        return newSortedRow


    }

    const sortSelectChangeHook = (value) =>{
        // const newTaskList = sortTasksByRequest(taskListToRender, value)
        // setTaskListtoRender(newTaskList)
        setSortOption(value)
        console.log("sort", value)
        generateFinalOutput(showDone, labelList, taskListSections, value)
    }
    const labelSelectedChangedHook = async (labelSelectorFromComp: labelSelector[]) =>{
        setLabelList(labelSelectorFromComp)
        
        let newLabelArray: string[] = []
        for(const k in labelSelectorFromComp){
            if(labelSelectorFromComp[k].selected==true){
                newLabelArray.push(labelSelectorFromComp[k].name)
            }
        }
        let filter= {}
        if(newLabelArray.length!=0){
            filter = {logic: "or", filter:{label: newLabelArray}}
        }
        generateFinalOutput(showDone, labelSelectorFromComp, taskListSections)
    }
    
    return(
        <>
            <LocalTaskFilters sortSelectChangeHook={sortSelectChangeHook} taskListSections={taskListSections} labelSelectedChangedHook={labelSelectedChangedHook} showDoneChangedHook={showDoneChangedHook} />
            <br />
            {isLoading ? <Loading centered={true} /> : finalOutput}
        </>
    )
}