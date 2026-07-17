import { TaskArrayItem } from "@/helpers/frontend/TaskUI/taskUIHelpers";
import { returnGetParsedVTODO } from "@/helpers/frontend/calendar";
import { getEventFromDexieByID } from "@/helpers/frontend/dexie/events_dexie";
import { ISODatetoHuman, timeDifferencefromNowinWords } from "@/helpers/frontend/general";
import { useEffect, useState } from "react";
import { SingleTask } from "../SingleTask/SingleTask";
import { sortTasksByRequest } from "@/helpers/frontend/TaskUI/taskSort";
import { TaskGroup } from "./TaskGroup";
import { useTranslation } from "next-i18next";

export const RenderTaskList = ({taskList, level, sortBy, }: {taskList: TaskArrayItem[], level: number, sortBy: string, }) =>{

    const [finalOutput, setFinalOutput] = useState<JSX.Element[]>([])
    const {t} = useTranslation()

    const renderList = async () =>{
        const results = await Promise.all(taskList.map(async (item) => {
            const id = parseInt(item.id.toString())
            const event = await getEventFromDexieByID(id)
            if(!event || !Array.isArray(event) || event.length===0){
                return null
            }
            const todo = event[0].parsedData ? event[0].parsedData : returnGetParsedVTODO(event[0].data)
            if(!todo){
                return null
            }
            return { item, event, todo }
        }))

        let final: JSX.Element[] = []
        const levelTask = level ? level : 0

        for(const result of results){
            if(!result) continue
            const { item, todo } = result

            let dueDate = ISODatetoHuman(todo.due)
            let timeDifference = timeDifferencefromNowinWords(dueDate)
            let secondaryText = ""
            if(dueDate!=null && dueDate!=""){
                secondaryText = dueDate+" "+timeDifference
            }

            const taskParent = <SingleTask key={item.id} id={item.id} level={levelTask} parsedTask={todo} />
            let taskChildren: JSX.Element | null = null
            if(item.children.length>0){
                const sortedKids = sortTasksByRequest(item.children, sortBy)
                taskChildren = <RenderTaskList sortBy={sortBy} taskList={sortedKids} level={levelTask+1} />
            }
            final.push(
                <TaskGroup key={`${item.id.toString()}_taskGroup`} keyName={`${item.id.toString()}_taskGroup`} parent={taskParent}>
                    {taskChildren}
                </TaskGroup>
            )
        }

        if(final.length>0){
            setFinalOutput(final)
        }else{
            setFinalOutput([<p key="RenderTaskList_nothing_toShow">{t("NOTHING_TO_SHOW")}</p>])
        }
    }

    useEffect(()=>{
        let isMounted = true
        renderList().catch(err => {
            console.error("RenderTaskList: renderList failed", err)
        })
        return ()=>{
            isMounted = false
        }
    },[taskList])

    return(
        <>
        {finalOutput}
        </>
    )
}