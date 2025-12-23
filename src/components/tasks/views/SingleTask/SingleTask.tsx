import { RecurrenceHelper } from "@/helpers/frontend/classes/RecurrenceHelper"
import { getAllLabelsFromDexie } from "@/helpers/frontend/dexie/dexie_labels"
import { ISODatetoHuman, timeDifferencefromNowinWords_FromUnixSeconds, timeDifferencefromNowinWords_Generic } from "@/helpers/frontend/general"
import { getISO8601Date, isValidResultArray, varNotEmpty } from "@/helpers/general"
import { letterSpacing } from "@mui/system"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import moment from "moment"
import { ContextMenuTrigger } from "rctx-contextmenu"
import { useEffect, useState } from "react"
import { Col, Row, Stack } from "react-bootstrap"
import { AiFillStar, AiOutlineStar } from "react-icons/ai"
import { MdRepeatOne, MdSpeakerNotes } from "react-icons/md"
import { currentDateFormatAtom, currentSimpleDateFormatAtom, currentSimpleTimeFormatAtom } from "stateStore/SettingsStore"
import { DescriptionIcon } from "./DescriptionIcon"
import { getEtagFromURL_Dexie, getEventColourbyID, getEventFromDexieByID, getEventURLFromDexie } from "@/helpers/frontend/dexie/events_dexie"
import { TaskPending } from "@/helpers/api/tasks"
import { RightclickContextMenuWithState } from "./RightclickContextMenuWithState"
import { showTaskEditorAtom, taskEditorInputAtom } from "stateStore/TaskEditorStore"
import ProgressBar from 'react-bootstrap/ProgressBar';
import { ParsedTask } from "types/tasks/tasks"
import { SummaryText } from "./SummaryText"
import { LabelListForTask } from "./LabelListForTask"
import { updateViewAtom } from "stateStore/ViewStore"
import { updateTodo_WithUI } from "@/helpers/frontend/tasks"
import { onServerResponse_UI } from "@/helpers/frontend/TaskUI/taskUIHelpers"
import { toast } from "react-toastify"
import { useTranslation } from "next-i18next"
import { RRuleHelper } from "@/helpers/frontend/classes/RRuleHelper"
import * as _ from 'lodash'
import { getRandomString } from "@/helpers/crypto"

export const SingleTask = ({ parsedTask, level, id }: { parsedTask: ParsedTask, level: number, id: string | number }) => {

    /**
     * Jotai
    */
    const dateFormat = useAtomValue(currentDateFormatAtom)
    const setDateFormat = useSetAtom(currentSimpleDateFormatAtom)
    const setTimeFormat = useSetAtom(currentSimpleTimeFormatAtom)
    const setShowTaskEditor = useSetAtom(showTaskEditorAtom)
    const setTaskEditorInput = useSetAtom(taskEditorInputAtom)
    const updateView = useAtomValue(updateViewAtom)
    const setUpdateViewTime = useSetAtom(updateViewAtom)

    /**
     * Local State
     */
    const { t } = useTranslation()
    const [isRepeating, setIsRepeating] = useState(false)
    const [taskChecked, setTaskChecked] = useState(false)
    const [labelArray, setLabelArray] = useState<string[]>([])
    const [taskColour, setTaskColour] = useState("black")
    const [isDone, setIsDone] = useState(false)
    var marginLevel = level * 30 + 20

    const checkifRepeating = () => {
        if ("rrule" in parsedTask && parsedTask.rrule) {
            setIsRepeating(true)
        }

    }
    useEffect(() => {
        let isMounted = true
        const getTaskColour = async () => {
            const colour = await getEventColourbyID(id)
            setTaskColour(colour)
        }

        if (isMounted) {


            checkifRepeating()
            getTaskColour()
            if (parsedTask.categories) {
                setLabelArray(parsedTask.categories)
            }
            setIsDone(!TaskPending(parsedTask))

        }
        return () => {
            isMounted = false
        }
    }, [parsedTask, id, level])

    const checkBoxClicked = async () => {
        // setTaskChecked(prev => !prev)
        /**
        setTaskEditorInput({id: id,
            taskDone: true
        })
        setShowTaskEditor(true)
        // console.log(completedDate)
        setCompleted(completedDate!)
        setCompletion("100")
        setStatus("COMPLETED")
        
        */
        let newTask: ParsedTask = _.cloneDeep(parsedTask)
        console.log(newTask)
        const eventInfoFromDexie = await getEventFromDexieByID(parseInt(id.toString()))
        if (eventInfoFromDexie) {
            const calendar_id = eventInfoFromDexie[0].calendar_id
            if (isDone) {
                //Task is done. We have to mark it as pending.
                // console.log("task is clicked")
                if (!newTask["rrule"]) {

                    newTask["completed"] = ""
                    newTask["completion"] = "0"
                    newTask["status"] = ""
                }
            } else {
                //Task is pending. We have to mark it as done.
                const completedDate = moment().toISOString()
                if (!parsedTask.rrule) {

                    newTask["completed"] = completedDate
                    newTask["completion"] = "100"
                    newTask["status"] = "COMPLETED"
                } else {
                    // Recurring Task.
                    let dueDateToSave = parsedTask["due"]
                    let taskStartToSave = parsedTask["start"]
                    let rruleObject = RRuleHelper.stringToObject(parsedTask.rrule)

                    if (parsedTask["start"]) {
                        taskStartToSave = RRuleHelper.addRecurrenceDelaytoDate(rruleObject, parsedTask["start"]).toISOString()
                    }
                    if (parsedTask["due"]) {

                        dueDateToSave = RRuleHelper.addRecurrenceDelaytoDate(rruleObject, parsedTask["due"]).toISOString()

                    }
                    newTask["due"] = dueDateToSave
                    newTask["start"] = taskStartToSave
                    newTask['rrule'] = rruleObject
                    // console.log("rrule", newTask)



                }
            }
            //Add advancedTriggerMode to alarms.
            if (newTask["alarms"] && Array.isArray(newTask["alarms"])) {
                newTask.valarms = newTask["alarms"]
                for (const i in newTask["valarms"]) {
                    newTask["valarms"][i].advancedTriggerMode = true
                    newTask["valarms"][i].id = getRandomString(6)
                }
            }

            const eventURL = await getEventURLFromDexie(id)
            const eventEtag = await getEtagFromURL_Dexie(eventURL)
            let message = newTask["summary"] ? newTask["summary"] + ": " : ""

            updateTodo_WithUI(calendar_id, eventURL, eventEtag, newTask, null).then(reponse => {
                setUpdateViewTime(Date.now())
            })

            console.log(message + "Task updated!")

        }


    }

    const taskClicked = () => {
        setTaskEditorInput({ id: id })
        setShowTaskEditor(true)
    }

    const priorityStarClicked = () => {
        setTaskEditorInput({
            id: id,
            priority: 1
        })
        setShowTaskEditor(true)
    }


    let borderLeft = "1px solid  gray"
    let border = "1px solid  gray"
    if (taskColour) {
        borderLeft = "10px solid " + taskColour
        border = "1px solid " + taskColour
    }

    let dueDateColor = "green"

    let dueDateText = ""
    let dueDate = ISODatetoHuman(parsedTask.due!)
    dueDate = moment(parsedTask.due).format(dateFormat)
    console.log("dateFormat", dateFormat)
    // let timeDifferenceinWords = timeDifferencefromNowinWords_FromUnixSeconds(moment(parsedTask.due).unix())
    let timeDifferenceinWords = timeDifferencefromNowinWords_Generic(parsedTask.due)
    // if (isRepeating) {
    //     if (("recurrences" in parsedTask) && parsedTask.recurrences) {
    //         let recurrenceObj = new RecurrenceHelper(parsedTask)
    //         let newDueDate = recurrenceObj.getNextDueDate()
    //         let timeDifference = Math.floor((moment(newDueDate).unix() - Math.floor(Date.now() / 1000)) / 86400)
    //         if (timeDifference < 0) {
    //             dueDateColor = 'red'
    //         }

    //         timeDifferenceinWords = timeDifferencefromNowinWords_Generic(newDueDate)
    //         dueDateText = moment(newDueDate).format(dateFormat) + " " + timeDifferenceinWords
    //     }

    // } else {
    if (("due" in parsedTask) && parsedTask.due != null) {
        dueDateText = dueDate + " " + timeDifferenceinWords
        let timeDifference = Math.floor((moment(parsedTask.due).unix() - Math.floor(Date.now() / 1000)) / 86400)
        if (timeDifference < 0) {
            dueDateColor = 'red'
        }

    }

    // }
    let priorityColor = ""

    let priorityStar = (<AiOutlineStar color={priorityColor} size={12} />)
    if (parsedTask.priority != null) {
        if (parseInt(parsedTask.priority.toString()) < 3 && parseInt(parsedTask.priority.toString()) > 0) {
            priorityColor = "red"
            priorityStar = (<AiFillStar color={priorityColor} size={12} />)
        }
        else if (parseInt(parsedTask.priority.toString()) < 7 && parseInt(parsedTask.priority.toString()) > 0) {
            priorityColor = "gold"
            priorityStar = (
                <AiFillStar color={priorityColor} size={12} />)
        }
        else {
            priorityStar = (
                <AiOutlineStar color={priorityColor} size={12} />
            )
        }
    }
    let repeatingTaskIcon: JSX.Element | null = null

    if (isRepeating == true) {
        repeatingTaskIcon = <MdRepeatOne size={16} />
    }
    let hasDescriptionIcon: JSX.Element | null = null
    if (parsedTask.description) {
        hasDescriptionIcon = (<DescriptionIcon text={parsedTask.description} />)

    }


    priorityStar = (<div onClick={priorityStarClicked} style={{ padding: 0, verticalAlign: 'middle', textAlign: 'center' }} className="col-1">{priorityStar}</div>)


    return (
        <div key={id.toString()}>
            <ContextMenuTrigger key={id.toString() + "_" + parsedTask.uid + "_contextMenuTrigger"} id={"RIGHTCLICK_MENU_" + id} >
                <div style={{ marginLeft: marginLevel, }}>
                    <div style={{ border: '1px solid  gray', borderLeft: borderLeft, borderRadius: 20, padding: 10 }}>
                        <Row style={{ display: 'flex', }} >
                            <Col xs={1} sm={1} md={1} lg={1} style={{ justifyContent: 'center', display: 'flex', }} >
                                <input onChange={checkBoxClicked} className="" type="checkbox" checked={isDone} />
                            </Col>
                            <Col xs={9} sm={6} md={5} lg={5} onClick={taskClicked} >
                                <Row>
                                    <Col >
                                        <SummaryText text={parsedTask["summary"]} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col onClick={taskClicked} className="d-none d-sm-block" sm={3} md={5} lg={3}>
                                <SummaryText color={dueDateColor} text={dueDateText} />
                            </Col>
                            <Col onClick={taskClicked} className="d-none d-sm-none d-md-block d-none d-sm-block d-md-none d-lg-block" lg={1}>
                                <div style={{ width: "80%" }} className="textDefault">
                                    <LabelListForTask id={id.toString()} parsedTask={parsedTask} />
                                </div>

                            </Col>
                            <Col onClick={taskClicked} className="d-none d-sm-none d-md-block d-none d-sm-block d-md-none d-lg-block" lg={1} >
                                {repeatingTaskIcon} {hasDescriptionIcon}
                            </Col>
                            <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }} xs={1} sm={1} md={1} lg={1} >
                                {priorityStar}
                            </Col>
                        </Row>
                        <Row onClick={taskClicked}>
                            <Col>
                                {parsedTask.completion ? <ProgressBar style={{ height: 5 }} now={parseInt(parsedTask.completion?.toString())} variant="secondary" /> : null}
                            </Col>
                        </Row>
                    </div>
                </div>
            </ContextMenuTrigger>
            <RightclickContextMenuWithState parsedTask={parsedTask} id={id} />
        </div>
    )

}