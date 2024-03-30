import { EventEditorViewManager } from "@/components/events/EventEditorViewManager"
import { TaskEditorViewManager } from "@/components/tasks/TaskEditorSupport/TaskEditorViewManager"
import { MoveEventModalViewManager } from "../MoveEvent/MoveEventModalViewManager"

export const GlobalViewManager = () =>{

    return(
        <>
        <TaskEditorViewManager />
        <EventEditorViewManager />
        <MoveEventModalViewManager />

        </>        
    )
}