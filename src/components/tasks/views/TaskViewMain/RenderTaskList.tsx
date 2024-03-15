import { TaskArrayItem } from "@/helpers/frontend/TaskUI/taskUIHelpers";
import { returnGetParsedVTODO } from "@/helpers/frontend/calendar";
import { getEventFromDexieByID } from "@/helpers/frontend/dexie/events_dexie";
import { ISODatetoHuman, getI18nObject, timeDifferencefromNowinWords } from "@/helpers/frontend/general";
import { useCallback, useEffect, useState } from "react";
import { SingleTask } from "../SingleTask/SingleTask";
import { sortTasksByRequest } from "@/helpers/frontend/TaskUI/taskSort";
import { TaskGroup } from "./TaskGroup";

const i18next = getI18nObject()
export const RenderTaskList = ({taskList, level, sortBy}: {taskList: TaskArrayItem[], level: number, sortBy: string}) =>{

    const [finalOutput, setFinalOutput] = useState<JSX.Element[]>([])
    const renderList = useCallback(async () =>{

        let final:JSX.Element[] = []
        for(const k in taskList){
            let levelTask = level ? level : 0
            const id = parseInt(taskList[k].id.toString())
            const event = await getEventFromDexieByID(id)
            if(event && Array.isArray(event) && event.length>0){
                const todo = returnGetParsedVTODO(event[0].data)
                if(todo){
                    let dueDate = ISODatetoHuman(todo.due)
                    let timeDifference = timeDifferencefromNowinWords(dueDate)
                    let secondaryText=""
                    if(dueDate!=null && dueDate!="")
                    {
                        secondaryText = dueDate+" "+timeDifference
                    }
                    const taskParent = <SingleTask key={taskList[k].id} id={taskList[k].id} level={levelTask} parsedTask={todo} />
                    let taskChildren: JSX.Element | null = null
                    if(taskList[k].children.length>0){
                        const sortedKids = sortTasksByRequest(taskList[k].children, sortBy)
                        
                        taskChildren = <RenderTaskList sortBy={sortBy} taskList={sortedKids} level={levelTask+1} />
                    }
                    final.push(
                    <TaskGroup keyName={taskList[k].id.toString()} parent={taskParent}>
                            {taskChildren}
                    </TaskGroup> )
                }
            }
            
        }
        if(final.length>0){

            setFinalOutput(final)
        }else{
            setFinalOutput([<p key="RenderTaskList_nothing_toShow">{i18next.t("NOTHING_TO_SHOW")}</p>])
        }
    },[setFinalOutput, level,sortBy, taskList])

    useEffect(()=>{
        let isMounted = true
        if(isMounted)
        {
            renderList()
        }
        return ()=>{
            isMounted = false
        }
    },[taskList, sortBy, renderList])
    return(
        <>
        {finalOutput}
        </>
    )
}