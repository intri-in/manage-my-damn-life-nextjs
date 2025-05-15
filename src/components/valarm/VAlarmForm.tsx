import { getRandomString } from "@/helpers/crypto"
import { varNotEmpty } from "@/helpers/general"
import { attendeeType, vAlarm } from "@/types/valarm"
import moment from "moment"
import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { Button, Col, Form, Row } from "react-bootstrap"
import { AiOutlineDelete } from "react-icons/ai"
import { BsAlarm } from "react-icons/bs"
import { toast } from "react-toastify"

interface vAlarmVTODOGEN extends vAlarm {
    id: string,
    advancedTriggerMode: boolean
}

export const VAlarmForm = ({ input, onChange }: { input: vAlarm[], onChange: Function }) => {

    // const [alarmValue, setAlarmValue] = useState("")
    const [alarms, setAlarms] = useState<vAlarmVTODOGEN[]>([])
    const [description, setDescription] = useState("REMINDER!")
    const [alarmAction, setAlarmAction] = useState("DISPLAY")
    const [triggerValue, setTriggerValue] = useState(0)
    const [triggerDirection, setTriggerDirection] = useState("BEFORE")
    const [triggerRelatedto, setTriggerRelatedto] = useState("END")
    const [summary, setSummary] = useState("")
    const [attendeeList, setAttendeeLists] = useState("")
    const [alarmList, setAlarmList] = useState(<></>)
    const { t } = useTranslation()

    useEffect(() => {
        let isMounted = true
        if (isMounted) {

            // setAlarms(input) 
            // console.log("input", input)
            if (input && Array.isArray(input) && input.length > 0) {
                let inputNew: vAlarmVTODOGEN[] = []
                for (const i in input) {

                    inputNew.push({ id: getRandomString(6), advancedTriggerMode:true, ...input[i] })
                }
                setAlarms(inputNew)
            }

        }
        return () => {
            isMounted = false
        }
    }, [input])

    useEffect(() => {
        generateOutput()

    }, [alarms, input])


    const alarmActionSelected = (e) => {
        // console.log("e", e)
        setAlarmAction(e.target.value)
    }

    const parseAttendeeList = (): attendeeType[] => {

        let toReturn: attendeeType[] = []
        if (!attendeeList) {
            return []

        }
        const list = attendeeList.split('\n')
        if (list && Array.isArray(list) && list.length > 0) {
            for (const i in list) {

                const parsedAttendee = list[i].split(',')
                if (parsedAttendee && Array.isArray(parsedAttendee) && parsedAttendee.length == 2) {
                    toReturn.push({
                        commonName: parsedAttendee[0],
                        email: parsedAttendee[1]
                    })

                }

            }
            // console.log("toreutn", toReturn)
            return toReturn
        }
        return []
    }
    const newAlarmAdded = () => {

        //
        let shouldContinue = true
        let attendees: attendeeType[] = []

        if (alarmAction === "EMAIL") {
            //Check
            if (!summary) {
                toast.error(t("ERROR_ENTER_A_SUMMARY_FOR_ALARM"))
                shouldContinue = false
            }
            if (!attendeeList) {

                toast.error(t("ERROR_ENTER_A_VALID_ATTENDEE_LIST"))
                shouldContinue = false
            }
            attendees = parseAttendeeList()
            if (attendees.length < 1) {
                toast.error(t("ERROR_ENTER_A_VALID_ATTENDEE_LIST"))
                shouldContinue = false

            }

        }

        if (alarmAction == "EMAIL" || alarmAction == "DISPLAY") {
            if (!description) {
                toast.error(t("ERROR_ENTER_A_DESC_FOR_ALARM"))
                shouldContinue = false
            }
        }
        if (shouldContinue) {
            let finalValue = (triggerDirection == "BEFORE") ? -1 * triggerValue : triggerValue
            let newAlarm: vAlarmVTODOGEN = {
                advancedTriggerMode: true, id: getRandomString(6), action: alarmAction, trigger: { isRelated: true, value: finalValue, relatedTo: triggerRelatedto }, description: description, summary: summary, attendees: attendees
            }
            setAlarms(prevAlarms => {

                onChange([...prevAlarms, newAlarm])
                return [...prevAlarms, newAlarm]

            })

            setTriggerValue(0)
            setDescription("")
        }
    }

    const removeAlarm = (alarmtoRemove: string) => {
        setAlarms(prevAlarms => {
            let filtered = prevAlarms.filter(function (el) { return el.id != alarmtoRemove; });
            return filtered

        })

    }
    const generateOutput = () => {
        let toReturn: JSX.Element[] = []
        // console.log("alarms", alarms)
        if (alarms && Array.isArray(alarms) && alarms.length > 0) {
            for (const i in alarms) {
                // console.log("alarms[i].trigger.value", alarms[i].trigger.value)
                const direction = (parseInt(alarms[i].trigger.value.toString()) < 0) ? "BEFORE" : "AFTER"
                toReturn.push(
                    <Row style={{ padding: 10 }}>
                        <Col>
                            {`${alarms[i].action}, ${Math.abs(parseInt(alarms[i].trigger.value.toString()))} ${t("MINUTES").toLowerCase()} ${t(direction).toLowerCase()} ${t(alarms[i].trigger.relatedTo!).toLowerCase()}`}
                        </Col>
                        <Col style={{ display: 'flex', alignItems: "center", justifyContent: "right" }} className="col-3" > <AiOutlineDelete style={{ color: "red" }} onClick={() => removeAlarm(alarms[i].id)} /> </Col>

                    </Row>
                )
            }
        }


        setAlarmList(<div >{toReturn}</div>)

    }
    return (
        <div style={{ border: "1px solid gray", padding: 10 }} key="alarmInfo">
            <h4>{t("ALARMS")}</h4>
            {alarmList}
            <br />
            <p><small>{t("ADD_ALARM")}</small></p>
            <Form.Text>
                {t("ALARM_ACTION")}
            </Form.Text>
            <Form.Select value={alarmAction} onChange={alarmActionSelected} style={{ width: "80%" }} aria-label="action-select">
                <option value="AUDIO">{t("AUDIO")}</option>
                <option value="DISPLAY">{t("DISPLAY")}</option>
                <option value="EMAIL">{t("EMAIL")}</option>
            </Form.Select>
            <Form.Text>
                {t("WHEN")}
            </Form.Text>
            <Row>
                <Col md={4}>
                    <Form.Control
                        type="number"
                        value={triggerValue}
                        onChange={e => setTriggerValue(parseInt(e.target.value))}
                    />
                </Col>

                <Col md={8}>
                    <Form.Select value={triggerDirection} onChange={(e) => setTriggerDirection(e.target.value)} style={{ width: "80%" }}  >
                        <option value="BEFORE">{`${t("MINUTES").toLowerCase()} ${t("BEFORE").toLowerCase()}`}</option>
                        <option value="AFTER">{`${t("MINUTES").toLowerCase()} ${t("AFTER").toLowerCase()}`}</option>
                    </Form.Select>

                </Col>
            </Row>
            <Form.Select value={triggerRelatedto} onChange={(e) => setTriggerRelatedto(e.target.value)} style={{ width: "80%", marginTop: 10 }}  >
                <option value="END">{t("DUE_DATE")}</option>
                <option value="START">{t("START")}</option>
            </Form.Select>

            <Form.Text>
                {t("DESCRIPTION")}
            </Form.Text>

            <Form.Control as="textarea" onChange={(e) => setDescription(e.target.value)} value={description} />
            {
                (alarmAction === "EMAIL") &&
                <>
                    <Form.Text>
                        {t("SUMMARY")}
                    </Form.Text>
                    <Form.Control onChange={(e) => setSummary(e.target.value)} value={summary} />

                </>
            }
            {
                (alarmAction === "EMAIL") &&
                <>
                    <Form.Text>
                        {t("ATTENDEES")}
                    </Form.Text>
                    <p><small>{t("ATTENDEES_DESC")}</small></p>
                    <Form.Control as="textarea" onChange={(e) => setAttendeeLists(e.target.value)} value={attendeeList} />

                </>

            }

            <div style={{ marginTop: 20, padding: 10, textAlign: "center" }}>
                <Button size="sm" onClick={newAlarmAdded}>{t("ADD")}</Button>
            </div>

        </div>
    )

}