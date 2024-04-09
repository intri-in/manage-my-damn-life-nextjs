import React, { useState, useEffect } from "react";
import { Row, Col, Badge } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { MdOutlineAddCircle } from "react-icons/md";
import Button from 'react-bootstrap/Button';
import { SECONDARY_COLOUR } from "@/config/style";
import { TaskEditorExitModal } from "../../tasks/TaskEditorExitModal";
import Offcanvas from 'react-bootstrap/Offcanvas';
import TaskEditor from "../../tasks/TaskEditor";
import { toast } from "react-toastify";
import { Toastify } from "../../Generic";
import { fetchLatestEvents, fetchLatestEventsWithoutCalendarRefresh } from "@/helpers/frontend/sync";
import { ISODatetoHumanISO, getI18nObject } from "@/helpers/frontend/general";
import QuickAdd from "@/helpers/frontend/classes/QuickAdd";
import { logError, logVar, varNotEmpty } from "@/helpers/general";
import moment, { Moment } from "moment";
import { APIRequests } from "@/helpers/frontend/classes/APIRequests";
import { getDefaultCalendarID } from "@/helpers/frontend/cookies";
import { withRouter } from "next/router";
import AddInfo from "./AddInfo";
import Stack from 'react-bootstrap/Stack';
import { fetchAllEventsFromDexie } from "@/helpers/frontend/dexie/events_dexie";
import { TaskEditorInputType, showTaskEditorAtom, taskEditorInputAtom } from "stateStore/TaskEditorStore";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { currentDateFormatAtom } from "stateStore/SettingsStore";
import { calDavObjectAtom } from "stateStore/ViewStore";

export function AddTaskFunctional(props) {
    const i18next = getI18nObject();

    /**
     * Jotai
     */
    const dateFormat = useAtomValue(currentDateFormatAtom)
    const showTaskEditor = useSetAtom(showTaskEditorAtom)
    const setTaskInputAtom = useSetAtom(taskEditorInputAtom)
    const calDavObject = useAtomValue(calDavObjectAtom)
    /**
     * Local State
     */
    const [newTaskSummary, setNewTaskSummary] = useState("");
    const [data, setData] = useState<TaskEditorInputType>({ id:null });
    const [quickAddResults, setQuickAddResults] = useState<JSX.Element[]>([]);
    const [todoList, setTodoList] = useState(null);

    useEffect(() => {
    }, []);





    const addTask = () => {
        openTaskEditor()
    };

    const taskSummaryChanged = (e) => {
        const parsedTaskFromUserInput = QuickAdd.parseSummary(e.target.value);
        let newTask: TaskEditorInputType ={id: null, summary: parsedTaskFromUserInput.summary, category: parsedTaskFromUserInput.label, priority: parseInt(parsedTaskFromUserInput.priority)}
        
        let dueDate: Moment | null = null;
        try {
            dueDate = moment(parsedTaskFromUserInput.due, dateFormat);
        } catch (e) {
            logVar(e, "taskSummaryChanged, QuickAdd");
        }
        // console.log("taskSummaryChanged", parsedTaskFromUserInput)
        processQuickAddResults(parsedTaskFromUserInput, dueDate);
        if(dueDate && dueDate.isValid()){
            newTask.due = new Date(dueDate.toString())
        }
        setNewTaskSummary(e.target.value);
        setData(newTask);
    };
    

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            openTaskEditor();
        }
        if (e.key === "Escape") {
            const newData = { id:null};
            setNewTaskSummary('');
            setData(newData);
        }
    };
    const openTaskEditor = () =>{

        let dataToPush = {...data}
        
        if(calDavObject && calDavObject.calendars_id){
            dataToPush.calendar_id= calDavObject.calendars_id
        }
        setTaskInputAtom(dataToPush)
        setNewTaskSummary("")

        showTaskEditor(true)

    }
    const processQuickAddResults = (newTask, dueDate) => {
        const output: JSX.Element[] = [];
        if (varNotEmpty(dueDate) && dueDate !== "" && dueDate.isValid() && varNotEmpty(dueDate._i) && dueDate._i !== "") {
            output.push(<div key={`due_${dueDate._i.toString()}`}><Badge key="QUICK_ADD_DUE" pill bg="warning" text="dark">{i18next.t("DUE") + ": " + dueDate._i.toString()}</Badge></div>);
        }
        if (varNotEmpty(newTask.label) && newTask.label.length > 0) {
            let labelNames = "";
            for (const k in newTask.label) {
                labelNames += newTask.label[k] + " ";
            }
            labelNames = labelNames.trim();
            output.push(<div><Badge pill bg="warning" text="dark">{i18next.t("LABEL") + ": [" + labelNames + "]"}</Badge></div>);
        }
        if (varNotEmpty(newTask.priority) && newTask.priority !== "") {
            output.push(<div><Badge key="QUICK_ADD_PRIORITY" pill bg="warning" text="dark">{i18next.t("PRIORITY") + ": " + newTask.priority}</Badge></div>);
        }
        setQuickAddResults([<div key="quick_add" style={{ margin: 5 }}>{output}</div>]);
    };


    var borderColor = '2px solid ' + SECONDARY_COLOUR;

    return (
        <>
            <div style={{ textAlign: "center", borderBottom: borderColor }}>
                <Stack gap={1} direction="horizontal" style={{ width: "100%", marginTop: 10, marginBottom: 10 }}>
                    <div style={{ width: "100%" }} >
                        <Form.Control value={newTaskSummary} onChange={taskSummaryChanged} onKeyDown={onKeyDown} type="text" placeholder="Add a task" />
                    </div>
                    <div className="ms-auto" ><AddInfo /></div>
                    <div ><Button size="sm" onClick={addTask}>Add</Button></div>
                </Stack>
                {quickAddResults}
            </div>

           
            {/* {toastPlaceholder} */}
        </>
    );
}

