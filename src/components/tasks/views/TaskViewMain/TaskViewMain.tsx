import { TaskArrayItem } from "@/helpers/frontend/TaskUI/taskUIHelpers"
import { useEffect, useState } from "react";
import { Loading } from "@/components/common/Loading";
import { RenderTaskList } from "./RenderTaskList";
import { DEFAULT_SORT_OPTION } from "@/helpers/frontend/TaskUI/taskSort";
export const TaskViewMain = ({taskList}:{taskList: TaskArrayItem[]}) =>{
    const [taskListToRender, setTaskListtoRender] = useState(taskList)
    const [isLoading, setLoading] = useState(true)
    useEffect(()=>{
        let isMounted = true
        if(isMounted)
        {
            // refilterTaskList(showDone, labelList).then(()=>{
            //     setLoading(false)
            // })
        }
        return ()=>{
            isMounted = false
        } 
    },[])
    // useEffect( ()=>{
    //     let isMounted = true
    //     const filterDone = async () =>{
    //         const newTaskList = await removeDoneTasksFromTaskListArray(taskList)
    //         console.log(newTaskList)
    //         setTaskListtoRender(newTaskList)
    //     }
    //     if(isMounted && showDone==false)
    //     {
    //         filterDone()

    //     }else{

    //     }
    //     return ()=>{
    //         isMounted = false
    //     }        
    // },[showDone])
    
    return(
        <>
        {isLoading ? <Loading centered={true} />: <RenderTaskList sortBy={DEFAULT_SORT_OPTION} level={0} taskList={taskListToRender} />}
        </>
    )
}