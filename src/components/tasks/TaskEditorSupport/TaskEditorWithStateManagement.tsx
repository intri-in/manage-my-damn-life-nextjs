import { Loading } from "@/components/common/Loading"
import { useAtomValue } from "jotai"
import { useEffect, useState } from "react"
import { Alert, Button, Col, Form, Row } from "react-bootstrap"
import { currentDateFormatAtom, currentSimpleDateFormatAtom } from "stateStore/SettingsStore"
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { getI18nObject } from "@/helpers/frontend/general"
import { RRuleHelper } from "@/helpers/frontend/classes/RRuleHelper"
import Recurrence from "@/components/common/Recurrence";
import { getStandardDateFormat } from "@/helpers/frontend/settings"
import moment from "moment"
import { getEtagFromEventID_Dexie, getEtagFromURL_Dexie, getEventFromDexieByID, getEventURLFromDexie, saveEventToDexie } from "@/helpers/frontend/dexie/events_dexie"
import { returnGetParsedVTODO } from "@/helpers/frontend/calendar"
import ParentTaskView from "./ParentTaskView"
import { VTODO } from "@/helpers/frontend/classes/VTODO"
import { postNewEvent, preEmptiveUpdateEvent, rruleToObject, updateEvent } from "@/helpers/frontend/events"
import { RruleObject } from "types/recurrence"
import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie"
import { fixDueDate, getISO8601Date, isValidResultArray, varNotEmpty } from "@/helpers/general"
import * as _ from 'lodash'
import { RecurrenceHelper } from "@/helpers/frontend/classes/RecurrenceHelper"
import VTodoGenerator from 'vtodogenerator'
import { toast } from "react-toastify"
import { getCalDAVAccountIDFromCalendarID_Dexie, getCalendarURLByID_Dexie, getCalendarbyIDFromDexie, isValidCalendarsID } from "@/helpers/frontend/dexie/calendars_dexie"
import { generateNewTaskObject } from "@/helpers/frontend/tasks"
import { TaskEditorInputType } from "stateStore/TaskEditorStore"
import { getRandomString } from "@/helpers/crypto"
import { Labels } from "@/helpers/frontend/dexie/dexieDB"
import { SearchLabelArrayFunctional } from "@/components/common/SearchLabelArrayFunctional"
import { TaskPending } from "@/helpers/api/tasks"
import { getDefaultCalendarID } from "@/helpers/frontend/cookies"

const i18next = getI18nObject()
export const TaskEditorWithStateManagement = ({ input, onChange, showDeleteDailog, onServerResponse, closeEditor }: { input: TaskEditorInputType, onChange: Function, showDeleteDailog: Function, onServerResponse: Function, closeEditor: Function }) => {

    /**
     * Jotai
    */
    const dateFormat = useAtomValue(currentSimpleDateFormatAtom)
    const dateFullFormat = useAtomValue(currentDateFormatAtom)


    /**
     * Local State
     */
    const [isSubmitting, setSubmitting] = useState(false)
    const [unParsedData, setUnparsedDataFromDexie] = useState("")
    const [taskDone, setTaskDone] = useState(false)
    const [summary, setSummary] = useState("")
    const [isRepeatingTask, setIsRepeatingTask] = useState(false)
    const [calendarOptions, setCalendarOptions] = useState<JSX.Element[]>([])
    const [taskStart, setTaskStart] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [priority, setPriority] = useState("")
    const [status, setStatus] = useState("")
    const [completion, setCompletion] = useState("0")
    const [completed, setCompleted] = useState("")
    const [description, setDescription] = useState("")
    const [rrule, setRrule] = useState<RruleObject>(RRuleHelper.getEmptyObject())
    const [lastmodified, setLastModified] = useState(Date.now())
    const [isNewTask, setIsNewTask] = useState(false)
    const [parsedDataFromDexie, setParsedDataFromDexie] = useState<{} | undefined | any>({})
    const [calendar_id, setCalendarID] = useState("")
    const [uid, setUID] = useState("")
    const [parentID, setParentID] = useState("")
    const [relatedto, setRelatedTo] = useState<"" | any>("")
    const [category, setCategory] = useState<string[]>([])

    const changeDoneStatus = (isDone: boolean) => {
        if (isDone) {
            const completedDate = getISO8601Date(moment().toISOString())
            // console.log(completedDate)
            setCompleted(completedDate!)
            setCompletion("100")
            setStatus("COMPLETED")
        } else {
            setCompleted("")
            setStatus("")
            if (completion && parseInt(completion) == 100) {
                setCompletion("0")
            }

        }
    }
    const generateCalendarDDL = async (calendar_id, disabled: boolean) => {

        let calendarOutput: JSX.Element[] = []
        const calendarsFromServer = await getCalDAVSummaryFromDexie()
        if (isValidResultArray(calendarsFromServer)) {
            calendarOutput.push(<option key="calendar-select-empty" ></option>)

            for (let i = 0; i < calendarsFromServer.length; i++) {
                let tempOutput: JSX.Element[] = []
                if (!isValidResultArray(calendarsFromServer[i].calendars)) {
                    continue
                }
                for (let j = 0; j < calendarsFromServer[i].calendars.length; j++) {
                    const value = calendarsFromServer[i].calendars[j].calendars_id
                    const key = j + "." + value
                    tempOutput.push(<option key={key} style={{ background: calendarsFromServer[i].calendars[j].calendarColor }} value={value}>{calendarsFromServer[i].calendars[j].displayName}</option>)
                }
                calendarOutput.push(<optgroup key={calendarsFromServer[i].name} label={calendarsFromServer[i].name}>{tempOutput}</optgroup>)

            }

            setCalendarOptions([<Form.Select key="calendarOptions" onChange={calendarSelected} disabled={disabled} value={calendar_id}>{calendarOutput}</Form.Select>])

        }

        // console.log("this.state.calendar_id at DDL", this.state.calendar_id)
    }

    const checkInputForNewTask = async () => {
        if (input) {
            if (!input.id) {
                //Task is New.
                // Set variables for the new task.
                if (input.parentId) {
                    // Sub task is probably being added.
                    const event = await getEventFromDexieByID(parseInt(input.parentId))
                    if (event && event.length > 0) {
                        const parsedEvent = returnGetParsedVTODO(event[0].data)
                        if (parsedEvent) {
                            const parentTaskUID = parsedEvent["uid"]
                            if (event[0].calendar_id) {

                                setCalendarID(event[0].calendar_id)
                                if (parentTaskUID && input.parentId) {
                                    setParentID(parentTaskUID)
                                    setRelatedTo(parentTaskUID)
                                }
                                generateCalendarDDL(event[0].calendar_id, true)
                            }

                        }
                    }

                }else{
                    //Process calendar_id
                    if(input.calendar_id){

                        setCalendarID(input.calendar_id.toString())
                        generateCalendarDDL(input.calendar_id, false)
                    }else{
                        // No input.
                        // Get default calendar from perferences and store.
                        
                        const defaultCalendarID = await getDefaultCalendarID()
                        if(defaultCalendarID){
                            setCalendarID(defaultCalendarID)
                        }
                        generateCalendarDDL(defaultCalendarID, false)
                    }

                }
                //Process summary info for new task.
                if(input.summary){
                    setSummary(input.summary)
                }
            }

            //Process label info .
            if (input.category && Array.isArray(input.category) && input.category.length > 0) {
                setCategory(input.category)
            }

            //Process done info .
            if (input.taskDone) {
                setTaskDone(true)
                changeDoneStatus(true)

            }

            //Process priority info.
            if (input.priority) {
                setPriority(input.priority.toString())
            }
            // Process due date info.
            console.log("input.due", input.due)
            if (input.due) {
                setDueDate(new Date(moment(input.due).unix() * 1000).toString())
            }
            if (input.start){
                setTaskStart(new Date(moment(input.start).unix() * 1000).toString())
            }
        }
    }

    const fetchTaskInfoFromDexie = async (idInput) => {

        let id_local = idInput
        if (typeof (input.id) !== "number") {
            id_local = parseInt(idInput)
        }
        if (!id_local) {
            setIsNewTask(true)
            checkInputForNewTask()
            return
        }
        const eventInfoFromDexie = await getEventFromDexieByID(id_local)
        if (eventInfoFromDexie && Array.isArray(eventInfoFromDexie) && eventInfoFromDexie.length > 0) {
            const unParsedData = eventInfoFromDexie[0].data
            const parsedData = returnGetParsedVTODO(unParsedData)
            if (unParsedData) setUnparsedDataFromDexie(unParsedData)
            setParsedDataFromDexie(parsedData)
            const calendar_id = eventInfoFromDexie[0].calendar_id
            if (calendar_id) {
                setCalendarID(calendar_id)
            }
            generateCalendarDDL(calendar_id,true)
            if (parsedData) {
                if (TaskPending(parsedData) == false) {
                    setTaskDone(true)
                }
                setSummary(parsedData["summary"])
                setUID(parsedData["uid"])
                if (parsedData["due"]) {
                    setDueDate(new Date(moment(parsedData["due"]).unix() * 1000).toString())
                }
                setDescription(parsedData["description"])
                const parentID = VTODO.getParentIDFromRelatedTo(parsedData.relatedto)
                setParentID(parentID)
                if (parsedData["relatedto"]) {
                    setRelatedTo(parsedData["relatedto"])
                }
                //Check and set repeating task parameters.
                setRrule(rruleToObject(parsedData["rrule"]))
                if (parsedData["rrule"]) {
                    setIsRepeatingTask(true)
                }
                if (parsedData["priority"]) setPriority(parsedData["priority"])
                if (parsedData["completion"]) setCompletion(parsedData["completion"])
                if (parsedData["completed"]) setCompleted(parsedData["completed"])

                if (parsedData["category"]) setCategory(parsedData["category"])
                if (parsedData["start"]) {
                    setTaskStart(new Date(moment(parsedData["start"]).unix() * 1000).toString())
                }
                // console.log(parsedData)
                // getLabels(parsedData["category"])
                checkInputForNewTask()
            }
        }

        return null
    }

    useEffect(() => {
        let isMounted = true
        
    
        if (isMounted) {

            fetchTaskInfoFromDexie(input.id)
        }
        return () => {
            isMounted = false
        }
    }, [input])

    const saveTask = async () => {
        let recurrences: null | {} = null
        if (isRepeatingTask) {
            /**
             * Forgot why we need to do this.
             * {TODO}: Figure it out
             */
            let recurrenceObj = new RecurrenceHelper(parsedDataFromDexie)
            recurrences = _.cloneDeep(recurrenceObj.newRecurrence)
            if (Object.keys(recurrenceObj.newObj).length > 0 && recurrences) {
                const nextupKey = recurrenceObj.getNextUpKey()
                recurrences[nextupKey] = recurrenceObj.newObj[nextupKey]

                if (varNotEmpty(recurrences[nextupKey]["recurrenceid"]) == false || (varNotEmpty(recurrences[nextupKey]["recurrenceid"]) && recurrences[nextupKey]["recurrenceid"] == "")) {
                    recurrences[nextupKey]["recurrenceid"] = getISO8601Date(nextupKey)
                }

            }
        }

        if (!summary) {
            toast.error(i18next.t("CANT_CREATE_EMPTY_TASK"))
            return
        }
        let dueDateToSave = ""
        if (dueDate != null && dueDate != "") {
            dueDateToSave = fixDueDate(dueDate)
        }
        const valid = await checkifValid()
        if (valid) {
            if (taskDone) {

            }
            setSubmitting(true)
            const todoData = { due: dueDate, start: taskStart, summary: summary, created: parsedDataFromDexie.created, completion: completion, completed: completed, status: status, uid: uid, categories: category, priority: priority, relatedto: relatedto, lastmodified: "", dtstamp: parsedDataFromDexie.dtstamp, description: description, rrule: rrule, recurrences: recurrences }
            const finalTodoData = await generateNewTaskObject(todoData, parsedDataFromDexie, unParsedData)
            var todo = new VTodoGenerator(finalTodoData, { strict: false })
            var finalVTODO = todo.generate()
            console.log(todo, finalTodoData, finalVTODO)

            if (isNewTask) {
                const etag = getRandomString(32)

                postNewTodo(calendar_id, finalVTODO, etag)
            } else {
                // Make an update request.
                if (input.id) {

                    const etag = await getEtagFromEventID_Dexie(input.id)
                    if (!etag) {
                        console.error("Etag is null!")
                        toast.error(i18next.t("ERROR_GENERIC"))

                    }
                    const eventURL = await getEventURLFromDexie(parseInt(input.id.toString()))

                    await updateTodoLocal(calendar_id, eventURL, etag, finalVTODO)
                }
            }

        }

    }
    const postNewTodo = async (calendar_id, data, etag) => {
        const message = summary ? summary + ": " : ""
        toast.info(message + i18next.t("ACTION_SENT_TO_CALDAV"))
        let fileName = getRandomString(64) + ".ics"
        const calendarFromDexie = await getCalendarbyIDFromDexie(calendar_id)
        if (calendarFromDexie && calendarFromDexie.length > 0) {
            let url = calendarFromDexie[0].url
            if (url) {
                const lastChar = url.substr(-1);
                if (lastChar != '/') {
                    url = url + '/';
                }

                url += fileName
                console.log(data)

                await saveEventToDexie(calendar_id, url, etag, data, "VTODO")
                const caldav_accounts_id = await getCalDAVAccountIDFromCalendarID_Dexie(calendar_id)
                postNewEvent(calendar_id, data, etag, caldav_accounts_id, calendarFromDexie[0].ctag, calendarFromDexie[0]["syncToken"], calendarFromDexie[0]["url"], "VTODO", fileName).then((body) => {
                    onServerResponse(body, summary)
                })
                closeEditor()
            } else {
                toast.error(i18next.t("ERROR_GENERIC"))
                console.error("postNewTodo: url is empty.")
            }

        } else {
            toast.error(i18next.t("ERROR_GENERIC"))
            console.error("postNewTodo: event from dexie was empty.")

        }




    }
    const updateTodoLocal = async (calendar_id, url, etag, data) => {
        const message = summary ? summary + ": " : ""
        toast.info(message + i18next.t("ACTION_SENT_TO_CALDAV"))
        const oldEvent = await preEmptiveUpdateEvent(calendar_id, url, etag, data, "VTODO")
        const caldav_accounts_id = await getCalDAVAccountIDFromCalendarID_Dexie(calendar_id)

        updateEvent(calendar_id, url, etag, data, caldav_accounts_id, "VTODO", oldEvent).then((body) => {
            onServerResponse(body, summary)

        })
        closeEditor()

    }
    const checkifValid = async () => {
        var dueDateUnix = moment(fixDueDate(dueDate)).unix()
        var startDateUnix = moment(taskStart).unix()
        //console.log(dueDateUnix, startDateUnix)
        if (startDateUnix > dueDateUnix) {
            if (taskStart.toString().trim() != "" && varNotEmpty(taskStart) && dueDate.toString().trim() != "" && varNotEmpty(dueDate)) {
                toast.error(i18next.t("ERROR_ENDDATE_SMALLER_THAN_START"))

                return false
            }

        }
        if (!calendar_id || await isValidCalendarsID(calendar_id) == false) {
            toast.error(i18next.t("ERROR_PICK_A_CALENDAR"))
            return false
        }


        if (varNotEmpty(rrule) && RRuleHelper.isValidObject(rrule)) {
            if (varNotEmpty(taskStart) == false || (varNotEmpty(taskStart) && taskStart.toString().trim() == "")) {
                toast.error(i18next.t("ERROR_START_DATE_REQUIRED_FOR_RECCURENCE"))
                return false

            }
        }
        return true
    }

    const taskSummaryChanged = (e) => {
        setSummary(e.target.value)
        onChange()
    }
    const startDateChange = (value) => {
        if (typeof (value) === "string") {
            setTaskStart(value)
        } else {
            //probably a date object
            if (value._d) {
                setTaskStart(value._d)

            }
        }
        onChange()
    }

    const dueDateChanged = (value) => {
        if (typeof (value) === "string") {
            setDueDate(value)
        } else {
            //probably a date object
            if (value._d) {
                setDueDate(value._d)

            }
        }
        onChange()
    }
    const priorityChanged = (e) => {
        setPriority(e.target.value)
        onChange()
    }
    const completionChanged = (e) => {
        setCompletion(e.target.value)
        onChange()
    }

    const descriptionChanged = (e) => {
        setDescription(e.target.value)
        onChange()
    }
    const onRruleSet = (rrule) => {
        var newRRULE = RRuleHelper.parseObject(rrule)
        setRrule(newRRULE)
        onChange()
    }
    const deleteTask = () => {
        showDeleteDailog()
    }

    const removeParentClicked = () => {
        const newRelatedTo = VTODO.removeParentFromRelatedTo(relatedto)
        setParentID("")
        setRelatedTo(newRelatedTo)
        onChange()

    }
    const onParentSelect = (uid) => {
        let newRelatedTo = _.cloneDeep(relatedto)
        newRelatedTo = VTODO.addParentToRelatedTo(uid, newRelatedTo)
        const parentID = VTODO.getParentIDFromRelatedTo(newRelatedTo)
        setRelatedTo(newRelatedTo)
        setParentID(parentID)
        onChange()
    }

    const calendarSelected = (e) => {
        setCalendarID(e.target.value)
    }
    
    const taskDoneChanged = (e) => {
        setTaskDone(e.target.checked)
        changeDoneStatus(e.target.checked)

    }
    const statusValueChanged = (e) => {

        setStatus(e.target.value)
    }
    const getStatusDropdown = () => {

        var validStatuses = VTodoGenerator.getValidStatusValues()
        var finalOutput: JSX.Element[] = []
        for (const i in validStatuses) {
            finalOutput.push(<option key={validStatuses[i]} value={validStatuses[i]}>{validStatuses[i]}</option>)
        }

        return (<Form.Select key="status_ddl" value={status} onChange={statusValueChanged} >
            {finalOutput}
        </Form.Select>)

    }

    const removeLabel = (newArray) => {
        // let newArray: string[] = []
        // console.log(label, category)
        // for (const i in category) {
        //     if (category[i] != label) {
        //         newArray.push(category[i])
        //     }
        // }
        setCategory(newArray)
        // getLabels(newArray)
        onChange()
    }
    const onLabelAdded = (newLabelArray) => {
        setCategory(newLabelArray)
        onChange()
    }
    // const getLabels =  async (categoryArray?) => {
    //     console.log("getLabels", categoryArray, category)
    //     let labelArray: JSX.Element[] = []
    //     const allLabelsFromDexie = await getAllLabelsFromDexie()
    //     if (isValidResultArray(category)) {

    //         for (const i in categoryArray) {
    //             let labelColour: string | undefined = ""
    //             if (isValidResultArray(allLabelsFromDexie)) {
    //                 for (let j = 0; j < allLabelsFromDexie.length; j++) {
    //                     if (allLabelsFromDexie[j].name == categoryArray[i]) {
    //                         labelColour = (("colour" in allLabelsFromDexie[j]) && allLabelsFromDexie[j].colour) ? allLabelsFromDexie[j].colour: "black"
    //                     }
    //                 }
    //             }

    //             labelArray.push(<span onClick={()=>removeLabel(categoryArray[i])} id={categoryArray[i]} key={categoryArray[i]+"_"+i} className="badge rounded-pill textDefault" style={{ marginLeft: 3, marginRight: 3, padding: 3, backgroundColor: labelColour, color: "white" }}>{categoryArray[i]}</span>)

    //         }
    //     }
    //     labelArray.push(<div key={uid + "search"} style={{ marginTop: 10, marginBottom: 10 }}></div>)

    //     setLabelOutput(labelArray)
    // }


   
    const saveButton = !isSubmitting ? <Button size="sm" onClick={saveTask} >Save</Button> : <Loading centered={true} />

    let repeatInfoMessage: JSX.Element = <></>
    let dueDateFixed = ""
    if (isRepeatingTask) {
        const repeatingInfo = new RecurrenceHelper(parsedDataFromDexie)
        dueDateFixed = moment(repeatingInfo.getNextDueDate()).format(dateFullFormat)
        repeatInfoMessage = (<Alert variant="warning">{i18next.t("REPEAT_TASK_MESSAGE") + moment(new Date(repeatingInfo.getNextDueDate())).format(dateFormat)}</Alert>)
    }


    return (
        <div key={"TaskEditor_" + input.id}>
            <div style={{ textAlign: "right" }}>
                {saveButton}
            </div>
            <Row style={{ height: "50px" }}>
                <Col>
                    <div style={{ height: "50px", display: "flex", justifyContent: "flex-start", alignContent: "flex-start" }}>

                        <Form.Check
                            label="Task Done?"
                            className="align-middle"
                            style={{}}
                            checked={taskDone}
                            onChange={taskDoneChanged}
                        />
                    </div>
                </Col>
            </Row>
            <h4>Task Summary</h4>
            <div style={{ marginBottom: 10 }}><Form.Control onChange={taskSummaryChanged} autoFocus={true} value={summary} placeholder="Enter a summary" /></div>
            {repeatInfoMessage}
            <h4>Calendar</h4>
            <div style={{ marginBottom: 10 }}>{calendarOptions}</div>
            <h4>Parent Task</h4>
            <div style={{ marginBottom: 10 }}>
                <ParentTaskView parentID={parentID} uid={uid} calendar_id={calendar_id} removeParentClicked={removeParentClicked} onParentSelect={onParentSelect} />
            </div>
            <h4>Start Date</h4>
            <div style={{ marginBottom: 10 }}><Datetime value={moment(taskStart)} onChange={startDateChange} dateFormat={dateFormat} timeFormat="HH:mm" /></div>
            <h4>Due Date</h4>
            <Row style={{ marginBottom: 10 }}>
                {isRepeatingTask ? <p>{dueDateFixed}</p> : <Datetime value={moment(dueDate)} input={true} onChange={dueDateChanged} dateFormat={dateFormat} timeFormat="HH:mm" closeOnSelect={true} />}
            </Row>
            <h4>Labels</h4>
            <div style={{ marginBottom: 10 }}>
                <SearchLabelArrayFunctional category={category} onLabelAdded={onLabelAdded} onLabelRemoved={removeLabel} />
            </div>
            <h4>{i18next.t("STATUS")}</h4>
            <div style={{ marginBottom: 10 }}>
                {getStatusDropdown()}
            </div>
            <h4>Priority</h4>
            <div style={{ marginBottom: 10 }}>
                <Form.Select onChange={priorityChanged} value={priority} >
                    <option value="0"></option>
                    <optgroup key="High" label="High">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </optgroup>
                    <optgroup key="Medium" label="Medium">
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                    </optgroup>
                    <optgroup key="Low" label="Low">
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </optgroup>

                </Form.Select>
            </div>
            <h4>Completion</h4>
            <div>{completion}%</div>
            <Form.Range onChange={completionChanged} value={completion} />
            <h4>Notes</h4>
            <Form.Control as="textarea" onChange={descriptionChanged} value={description} placeholder="Enter your notes here." />
            <br />
            <Recurrence onRruleSet={onRruleSet} rrule={rrule} />
            <br />
            {isSubmitting ? <Loading centered={true} /> : <div onClick={deleteTask} style={{ color: 'red', marginTop: 20, textAlign: "center" }}>Delete Task</div>}
            <br />
            <br />
            <p style={{ textAlign: "center" }}><b>{i18next.t('LAST_MODIFIED') + ": "}</b>{moment(lastmodified).format(getStandardDateFormat())}</p>
            <br />
            <br />
        </div>
    )
}

