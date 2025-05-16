import { Loading } from "@/components/common/Loading"
import { useAtomValue, useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { Accordion, Alert, Button, Col, Form, Row } from "react-bootstrap"
import { currentDateFormatAtom, currentSimpleDateFormatAtom } from "stateStore/SettingsStore"
import "react-datetime/css/react-datetime.css";
import { RRuleHelper } from "@/helpers/frontend/classes/RRuleHelper"
import Recurrence from "@/components/common/Recurrence";
import { getStandardDateFormat } from "@/helpers/frontend/settings"
import moment, { Moment } from "moment"
import { getEtagFromEventID_Dexie, getEtagFromURL_Dexie, getEventFromDexieByID, getEventURLFromDexie, saveEventToDexie } from "@/helpers/frontend/dexie/events_dexie"
import { returnGetParsedVTODO } from "@/helpers/frontend/calendar"
import ParentTaskView from "./ParentTaskView"
import { VTODO } from "@/helpers/frontend/classes/VTODO"
import { postNewEvent, preEmptiveUpdateEvent, rruleToObject, updateEvent } from "@/helpers/frontend/events"
import { RruleObject } from "types/recurrence"
import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie"
import { fixDueDate, fixDueDateWithFormat, getISO8601Date, isValidDateString, isValidResultArray, varNotEmpty } from "@/helpers/general"
import * as _ from 'lodash'
import { RecurrenceHelper } from "@/helpers/frontend/classes/RecurrenceHelper"
// import VTodoGenerator from 'vtodogenerator'
import VTodoGenerator from '@../../vtodogenerator/dist/index'
import { toast } from "react-toastify"
import { getCalDAVAccountIDFromCalendarID_Dexie, getCalendarURLByID_Dexie, getCalendarbyIDFromDexie, isValidCalendarsID } from "@/helpers/frontend/dexie/calendars_dexie"
import { generateNewTaskObject } from "@/helpers/frontend/tasks"
import { TaskEditorInputType } from "stateStore/TaskEditorStore"
import { getRandomString } from "@/helpers/crypto"
import { Labels } from "@/helpers/frontend/dexie/dexieDB"
import { SearchLabelArrayFunctional } from "@/components/common/SearchLabelArrayFunctional"
import { TaskPending } from "@/helpers/api/tasks"
import { getDefaultCalendarID } from "@/helpers/frontend/cookies"
import { Datepicker } from "@/components/common/Datepicker/Datepicker"
import { CalendarPicker } from "@/components/common/Calendarpicker"
import { PRIMARY_COLOUR } from "@/config/style"
import { moveEventModalInput, showMoveEventModal } from "stateStore/MoveEventStore"
import next from "next/types"
import { useTranslation } from "next-i18next"
import { VAlarmForm } from "@/components/valarm/VAlarmForm"
import { getParsedAlarmsFromTodo } from "@/helpers/frontend/VTODOHelpers"
import { vAlarm } from "@/types/valarm"

export const TaskEditorWithStateManagement = ({ input, onChange, showDeleteDailog, onServerResponse, closeEditor }: { input: TaskEditorInputType, onChange: Function, showDeleteDailog: Function, onServerResponse: Function, closeEditor: Function }) => {

    /**
     * Jotai
    */
    const dateFormat = useAtomValue(currentSimpleDateFormatAtom)
    const dateFullFormat = useAtomValue(currentDateFormatAtom)
    const showMoveModal = useSetAtom(showMoveEventModal)
    const setMoveEventInput = useSetAtom(moveEventModalInput)


    /**
     * Local State
     */
    const {t} = useTranslation()
    const [isSubmitting, setSubmitting] = useState(false)
    const [unParsedData, setUnparsedDataFromDexie] = useState("")
    const [taskDone, setTaskDone] = useState(false)
    const [summary, setSummary] = useState("")
    const [isRepeatingTask, setIsRepeatingTask] = useState(false)
    const [calendarOptions, setCalendarOptions] = useState<JSX.Element[]>([])
    const [taskStart, setTaskStart] = useState("")
    const [taskStartValid, setTaskStartValid] = useState(true)
    const [dueDate, setDueDate] = useState<string>("")
    const [dueDateValid, setDueDateValid] = useState(true)
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
    const [calendarDDLDisabled, setCalendarDDLDisabled] = useState(false)
    const [showMoveEventOption, setShowMoveEventOption] = useState(false)
    const [recurrenceObj, setRecurrenceObj] = useState<any>({})
    const [rawICS, setRawICS] = useState('')
    const [isTemplate, setIsTemplate] = useState(false)
    const [alarms, setVAlarm] = useState<vAlarm[]>([])
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
    useEffect(() => {
        let isMounted = true


        if (isMounted) {

            // generateCalendarDDL(calendar_id, calendarDDLDisabled)
        }
        return () => {
            isMounted = false
        }
    }, [calendar_id])
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

    const checkInputForNewTask = async (isRecurring?: boolean) => {
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
                                // generateCalendarDDL(event[0].calendar_id, true)
                                setCalendarDDLDisabled(true)
                            }

                        }
                    }

                } else {
                    //Process calendar_id
                    if (input.calendar_id) {

                        setCalendarID(input.calendar_id.toString())
                        // generateCalendarDDL(input.calendar_id, false)
                    } else {
                        // No input.
                        // Get default calendar from perferences and store.

                        const defaultCalendarID = await getDefaultCalendarID()
                        if (defaultCalendarID && await isValidCalendarsID(defaultCalendarID)) {
                            setCalendarID(defaultCalendarID)
                        }
                        // generateCalendarDDL(defaultCalendarID, false)
                    }

                }
                //Process summary info for new task.
                if (input.summary) {
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
                // console.log("isRepeatingTask", isRepeatingTask)
                if (!isRecurring) {
                    changeDoneStatus(true)
                }

            }

            //Process priority info.
            if (input.priority) {
                setPriority(input.priority.toString())
            }
            // Process due date info.
            // console.log("input.due", input.due)
            if (input.due && moment(input.due).isValid()) {
                setDueDate(moment(input.due).toISOString())
            }
            if (input.start && moment(input.start).isValid()) {
                setTaskStart(moment(input.start).toISOString())
            }
            if("priority" in input && input.priority){

                setPriority(input.priority.toString())
            }
            if("completion" in input && input.completion){

                setCompletion(input.completion.toString())
            }
            if("status" in input && input.status){
                console.log("input.status", input.status)
                setStatus(input.status.toString())
            }

            if("description" in input && input.description){

                setDescription(input.description.toString())
            }
            if ("rrule" in input && input.rrule) {
                /**
                 * This is a recurring task. Some clients like Tasks.org Android App let users create recurring tasks without any start date. In this case we set the tasks's recurrence to start from the "dtstamp" to make it compatible.
                 * 
                 */
                // console.log(parsedRecurrenceObj)
                setRrule(rruleToObject(input.rrule))

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
            processTaskData(unParsedData)
            const calendar_id = eventInfoFromDexie[0].calendar_id
            if (calendar_id) {
                setCalendarID(calendar_id)

                    setCalendarDDLDisabled(true)
                    setShowMoveEventOption(true)
            }
    
        }

        return null
    }
    const processTaskData = (unParsedData) =>{
        if (unParsedData) setRawICS(unParsedData)
        // console.log(unParsedData)
        const parsedData = returnGetParsedVTODO(unParsedData)
        if (unParsedData) setUnparsedDataFromDexie(unParsedData)
        setParsedDataFromDexie(parsedData)
        // generateCalendarDDL(calendar_id,true)
        if (parsedData) {
            if (TaskPending(parsedData) == false) {
                setTaskDone(true)
            }
            setSummary(parsedData["summary"])
            setUID(parsedData["uid"])
            // console.log(parsedData["due"], new Date(moment(parsedData["due"]).unix() * 1000).toString())
            if (parsedData["due"]) {
                // console.log(parsedData["due"],moment(parsedData["due"]).toISOString())
                // setDueDate(new Date(moment(parsedData["due"]).unix() * 1000).toString())
                setDueDate(moment(parsedData["due"]).toISOString())
            }
            setDescription(parsedData["description"])
            const parentID = VTODO.getParentIDFromRelatedTo(parsedData.relatedto)
            setParentID(parentID)
            if (parsedData["relatedto"]) {
                setRelatedTo(parsedData["relatedto"])
            }
            //Check and set repeating task parameters.
            setRrule(rruleToObject(parsedData["rrule"]))
            const isRecurring = parsedData["rrule"] ? true : false
            if (parsedData["rrule"]) {
                /**
                 * This is a recurring task. Some clients like Tasks.org Android App let users create recurring tasks without any start date. In this case we set the tasks's recurrence to start from the "dtstamp" to make it compatible.
                 * 
                 */
                if (!parsedData["start"]) {

                    if ("dtstamp" in parsedData) {
                        parsedData["start"] = parsedData["dtstamp"]

                    } else {
                        parsedData["start"] = moment(Date.now()).toString()
                    }
                }
                const parsedRecurrenceObj = new RecurrenceHelper(parsedData)
                // console.log(parsedRecurrenceObj)
                setRecurrenceObj(parsedRecurrenceObj)
                setIsRepeatingTask(true)
            }
            if (parsedData["priority"]) setPriority(parsedData["priority"])
            if (parsedData["completion"]) setCompletion(parsedData["completion"])
            if (parsedData["completed"]) setCompleted(parsedData["completed"])

            if (parsedData["category"]) setCategory(parsedData["category"])
            if (parsedData["status"]) setStatus(parsedData["status"])

            if (parsedData["start"]) {
                setTaskStart(new Date(moment(parsedData["start"]).unix() * 1000).toString())
            }
            if (parsedData["alarms"] && Array.isArray(parsedData["alarms"]) && parsedData["alarms"].length>0) {
                setVAlarm(parsedData["alarms"])
            }
            // console.log(parsedData)

            // getLabels(parsedData["category"])
            checkInputForNewTask(isRecurring)
        }
    }
    useEffect(() => {
        let isMounted = true


        if (isMounted) {



            fetchTaskInfoFromDexie(input.id)
            if (("isTemplate" in input) && input.isTemplate) {
                setIsTemplate(true)

            }
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
             * Probably to set done for the new recurrenceid.
             * {TODO}: Figure it out
             */
            recurrences = _.cloneDeep(recurrenceObj.newRecurrence)
            try {

                if (Object.keys(recurrenceObj.newObj).length > 0 && recurrences) {
                    const nextupKey = recurrenceObj.getNextUpKey()
                    if (!nextupKey) {
                        toast.error("NextUpKey is empty!")
                        return
                    }
                    recurrences[nextupKey] = recurrenceObj.newObj[nextupKey]
                    const completedDate = getISO8601Date(moment().toISOString())
                    /**
                     * If done, set next repeating instance as completed.
                     */
                    if (taskDone) {
                        recurrences[nextupKey]["completed"] = completedDate
                        recurrences[nextupKey]["completion"] = "100"
                        recurrences[nextupKey]["status"] = "COMPLETED"

                    } else {
                        recurrences[nextupKey]["completed"] = ""
                        recurrences[nextupKey]["completion"] = ""
                        recurrences[nextupKey]["status"] = ""
                    }


                    if (varNotEmpty(recurrences[nextupKey]["recurrenceid"]) == false || (varNotEmpty(recurrences[nextupKey]["recurrenceid"]) && recurrences[nextupKey]["recurrenceid"] == "")) {
                        recurrences[nextupKey]["recurrenceid"] = getISO8601Date(nextupKey)
                    }


                }
            } catch (e) {
                console.warn("Recurrence problem: " + summary, e,)
            }


        }

        if (!summary) {
            toast.error(t("CANT_CREATE_EMPTY_TASK"))
            return
        }
        let dueDateToSave = ""
        if (dueDate != null) {
            //dueDateToSave = fixDueDate(dueDate)
            dueDateToSave = moment(moment(dueDate).format(dateFullFormat)).toISOString()
        }
        // console.log("due date to save", dueDate, taskStart)
        const valid = isTemplate ? await checkifValid() : true
        if (valid) {
            setSubmitting(true)
            const todoData = { due: dueDate, start: taskStart, summary: summary, created: parsedDataFromDexie.created, completion: completion, completed: completed, status: status, uid: uid, categories: category, priority: priority, relatedto: relatedto, lastmodified: "", dtstamp: parsedDataFromDexie.dtstamp, description: description, rrule: rrule, recurrences: recurrences, valarms: alarms }
            const finalTodoData = await generateNewTaskObject(todoData, parsedDataFromDexie, unParsedData)
            const todo = new VTodoGenerator(finalTodoData, { strict: false })
            // console.log(todo, finalTodoData)
            try{

                const finalVTODO = todo.generate()
                // console.log(finalVTODO)
                if (isTemplate) {
                    if("templateReturn" in input && input.templateReturn && typeof(input.templateReturn) == "function"){
                        input.templateReturn({calendar_id:calendar_id,data:finalVTODO})
                    }
                    closeEditor()
    
                    return
                }
                if (isNewTask) {
                    const etag = getRandomString(32)
    
                    postNewTodo(calendar_id, finalVTODO, etag)
                } else {
                    // Make an update request.
                    if (input.id) {
    
                        const etag = await getEtagFromEventID_Dexie(input.id)
                        if (!etag) {
                            console.error("Etag is null!")
                            toast.error(t("ERROR_GENERIC"))
    
                        }
                        const eventURL = await getEventURLFromDexie(parseInt(input.id.toString()))
    
                        await updateTodoLocal(calendar_id, eventURL, etag, finalVTODO)
                    }
                }
            }catch(e){
                toast.error(e.message)
            }
           

        }

    }
    const postNewTodo = async (calendar_id, data, etag) => {
        const message = summary ? summary + ": " : ""
        toast.info(message + t("ACTION_SENT_TO_CALDAV"))
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
                // console.log(data)

                await saveEventToDexie(calendar_id, url, etag, data, "VTODO")
                const caldav_accounts_id = await getCalDAVAccountIDFromCalendarID_Dexie(calendar_id)
                postNewEvent(calendar_id, data, etag, caldav_accounts_id, calendarFromDexie[0].ctag, calendarFromDexie[0]["syncToken"], calendarFromDexie[0]["url"], "VTODO", fileName).then((body) => {
                    onServerResponse(body, summary)
                })
                closeEditor()
            } else {
                toast.error(t("ERROR_GENERIC"))
                console.error("postNewTodo: url is empty.")
            }

        } else {
            toast.error(t("ERROR_GENERIC"))
            console.error("postNewTodo: event from dexie was empty.")

        }




    }
    const updateTodoLocal = async (calendar_id, url, etag, data) => {
        const message = summary ? summary + ": " : ""
        toast.info(message + t("ACTION_SENT_TO_CALDAV"))
        const oldEvent = await preEmptiveUpdateEvent(calendar_id, url, etag, data, "VTODO")
        const caldav_accounts_id = await getCalDAVAccountIDFromCalendarID_Dexie(calendar_id)

        updateEvent(calendar_id, url, etag, data, caldav_accounts_id, "VTODO", oldEvent).then((body) => {
            onServerResponse(body, summary)

        })
        closeEditor()

    }
    const checkifValid = async () => {

        if(isTemplate){
            return true
        }
        var dueDateUnix = moment(dueDate).unix()
        var startDateUnix = moment(taskStart).unix()

        if (!dueDateValid) {
            toast.error(t("ERROR_DUE_DATE_INVALID"))
            return false
        }
        // console.log("taskStartValid", taskStartValid)
        // console.log("dueDateValid", dueDateValid)
        if (!taskStartValid) {
            toast.error(t("ERROR_START_DATE_INVALID"))
            return false
        }
        //console.log(dueDateUnix, startDateUnix)
        if (startDateUnix > dueDateUnix) {
            if (taskStart.toString().trim() != "" && varNotEmpty(taskStart) && dueDate.toString().trim() != "" && varNotEmpty(dueDate)) {
                toast.error(t("ERROR_ENDDATE_SMALLER_THAN_START"))

                return false
            }

        }
        if (!calendar_id || await isValidCalendarsID(calendar_id) == false) {
            toast.error(t("ERROR_PICK_A_CALENDAR"))
            return false
        }


        if (varNotEmpty(rrule) && RRuleHelper.isValidObject(rrule)) {
            if (varNotEmpty(taskStart) == false || (varNotEmpty(taskStart) && taskStart.toString().trim() == "")) {
                toast.error(t("ERROR_START_DATE_REQUIRED_FOR_RECCURENCE"))
                return false

            }
        }

        if (isRepeatingTask) {
            //Check if the task can even be saved.

        }
        return true
    }

    const taskSummaryChanged = (e) => {
        setSummary(e.target.value)
        onChange()
    }
    const startDateChange = (value, isValid) => {
        // console.log("new start value", value, isValid)
        setTaskStart(value)
        setTaskStartValid(isValid)
        onChange()
    }

    const dueDateChanged = (value, isValid) => {
        setDueDate(value)
        setDueDateValid(isValid)
        onChange()
        // console.log("value",typeof (value)==="string", value)
        // if (typeof (value) === "string") {
        //     console.log("string value", isValidDateString(value))
        //     if(moment(value).isValid()){
        //         setDueDate(value)
        //     }else{
        //         setDueDate("")
        //     }

        // } else {
        //     //probably a date object
        //     if (value) {
        //         setDueDate(value)

        //     }
        // }
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
        setCalendarID(e)
    }

    const taskDoneChanged = (e) => {
        setTaskDone(e.target.checked)
        if (!isRepeatingTask) {
            changeDoneStatus(e.target.checked)
        }

    }
    const statusValueChanged = (e) => {

        setStatus(e.target.value)
    }
    const getStatusDropdown = () => {

        var validStatuses = VTodoGenerator.getValidStatusValues()
        var finalOutput: JSX.Element[] = []
        for (const i in validStatuses) {
            finalOutput.push(<option key={validStatuses[i]} value={validStatuses[i]}>{t(validStatuses[i])}</option>)
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
    const copyMoveClicked = () => {
        setMoveEventInput({
            id: input.id
        })
        closeEditor()
        showMoveModal(true)

    }
    const alarmChanged = (alarms) =>{
        // console.log("alarms" , alarms)
        
        setVAlarm(alarms)
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



    const saveButton = !isSubmitting ? <Button size="sm" onClick={saveTask} >{t("SAVE")}</Button> : <Loading centered={true} />

    let repeatInfoMessage: JSX.Element = <></>
    let dueDateFixed = ""
    if (isRepeatingTask) {
        dueDateFixed = moment(recurrenceObj.getNextDueDate()).format(dateFullFormat)
        repeatInfoMessage = (<Alert variant="warning">{t("REPEAT_TASK_MESSAGE") + moment(recurrenceObj.getNextDueDate()).format(dateFormat)}</Alert>)
    }

    const templateEditing = isTemplate ? <Alert variant="warning">{t("EDITING_A_TEMPLATE")}</Alert> : <></>

    let deleteButton = <></>
    if (!isNewTask) {

        deleteButton = isSubmitting ? <Loading centered={true} /> : <div onClick={deleteTask} style={{ color: 'red', marginTop: 20, textAlign: "center" }}>{t("DELETE_TASK")}</div>
    }
    return (
        <div key={"TaskEditor_" + input.id}>
            {templateEditing}
            <div style={{ textAlign: "right" }}>
                {saveButton}
            </div>
            <Row style={{ height: "50px" }}>
                <Col>
                    <div style={{ height: "50px", display: "flex", justifyContent: "flex-start", alignContent: "flex-start" }}>

                        <Form.Check
                            label={t("TASK_DONE")+"?"}
                            className="align-middle"
                            style={{}}
                            checked={taskDone}
                            onChange={taskDoneChanged}
                        />
                    </div>
                </Col>
            </Row>
            <h4>{t("TASK")+" "+t("SUMMARY")}</h4>
            <div style={{ marginBottom: 10 }}><Form.Control onChange={taskSummaryChanged} autoFocus={true} value={summary} placeholder={t("ENTER_A_SUMMARY") ?? ""} /></div>
            {repeatInfoMessage}
            <h4>{t("CALENDAR")}</h4>
            <div style={{ marginBottom: 10 }}>
                <CalendarPicker onSelectedHook={calendarSelected} key={uid} calendar_id={calendar_id} disabled={calendarDDLDisabled} />
            </div>
            {showMoveEventOption ? <p onClick={copyMoveClicked} style={{ textAlign: "end", color: PRIMARY_COLOUR, fontSize: 14, }}>{t("COPY_MOVE")}</p> : null}

            <h4>{t("PARENT")+" "+t("TASK")}</h4>
            <div style={{ marginBottom: 10 }}>
                <ParentTaskView parentID={parentID} uid={uid} calendar_id={calendar_id} removeParentClicked={removeParentClicked} onParentSelect={onParentSelect} />
            </div>
            <h4>{t("START_DATE")}</h4>
            {/* <div style={{ marginBottom: 10 }}><Datetime value={moment(taskStart)} closeOnSelect={true} onChange={startDateChange} dateFormat={dateFormat} timeFormat="HH:mm" /></div> */}
            <div style={{ marginBottom: 10 }}>
                <Datepicker value={taskStart} onChangeHook={startDateChange} />
            </div>


            <h4>{t("DUE_DATE")}</h4>
            <Row style={{ marginBottom: 10 }}>
                {isRepeatingTask ? <p>{dueDateFixed}</p> : (<>
                    <Datepicker value={dueDate} onChangeHook={dueDateChanged} />
                </>)}
            </Row>
            <h4>{t("LABELS")}</h4>
            <div style={{ marginBottom: 10 }}>
                <SearchLabelArrayFunctional category={category} onLabelAdded={onLabelAdded} onLabelRemoved={removeLabel} />
            </div>
            <h4>{t("STATUS")}</h4>
            <div style={{ marginBottom: 10 }}>
                {getStatusDropdown()}
            </div>
            <h4>{t("PRIORITY")}</h4>
            <div style={{ marginBottom: 10 }}>
                <Form.Select onChange={priorityChanged} value={priority} >
                    <option value="0"></option>
                    <optgroup key="High" label={t("HIGH")!}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </optgroup>
                    <optgroup key="Medium" label={t("MEDIUM")!}>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                    </optgroup>
                    <optgroup key="Low" label={t("LOW")!}>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </optgroup>

                </Form.Select>
            </div>
            <h4>{t("COMPLETION")}</h4>
            <div>{completion}%</div>
            <Form.Range onChange={completionChanged} value={completion} />
            <h4>{t("NOTES")}</h4>
            <Form.Control as="textarea" onChange={descriptionChanged} value={description} placeholder={t("ENTER_NOTES") ?? ""} />
            <br />
            <VAlarmForm onChange={alarmChanged} input={alarms} />
            <br />
            <Recurrence i18next={t} onRruleSet={onRruleSet} rrule={rrule} />
            <br />
            {deleteButton}
            <br />
            <br />
            <p style={{ textAlign: "center" }}><b>{t('LAST_MODIFIED') + ": "}</b>{moment(lastmodified).format(getStandardDateFormat())}</p>
            <br />
            <br />
            <Accordion >
                <Accordion.Item eventKey="0">
                    <Accordion.Header>{t("RAW_ICS")}</Accordion.Header>
                    <Accordion.Body>
                        {rawICS}
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    )
}

