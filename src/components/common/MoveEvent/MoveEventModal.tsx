import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { moveEventModalInput } from 'stateStore/MoveEventStore';
import { CalendarPicker } from '../Calendarpicker';
import { deleteEventByURLFromDexie, deleteEventFromDexie, getEventFromDexieByID, saveEventToDexie } from '@/helpers/frontend/dexie/events_dexie';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import { Loading } from '../Loading';
import { getRandomString } from '@/helpers/crypto';
import { getCalDAVAccountIDFromCalendarID_Dexie, getCalendarbyIDFromDexie } from '@/helpers/frontend/dexie/calendars_dexie';
import { deleteEventFromServer, getParsedEvent, handleDeleteEventUI, postNewEvent } from '@/helpers/frontend/events';
import { returnGetParsedVTODO } from '@/helpers/frontend/calendar';
import VTodoGenerator from 'vtodogenerator'
import { Calendar_Events, Calendars } from '@/helpers/frontend/dexie/dexieDB';
import { getObjectForAPICallV2, makeGenerateICSRequest } from '@/helpers/frontend/ics';
import { useTranslation } from 'next-i18next';


export const MoveEventModal = ({show, handleClose, onServerResponse}:{show:boolean, handleClose: () => void, onServerResponse: Function}) => {
    
    /**
     * Jotai
    */

    const moveInput = useAtomValue(moveEventModalInput)
    /**
     * Local State
     */
    const {t} = useTranslation()
    const [currentCalID, setCurrentCalID] = useState<string | number>("")
    const [calendar_id, setCalendarsID] = useState<string | number>("")
    const [copyChecked, setCopyChecked] = useState(false)
    const [moveChecked, setMoveChecked] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [parsedEvent, setParsedEvent] = useState<{} | null | undefined>({})
    const [summary, setSummary] = useState("")
    const [type, setType] = useState("")
    const [eventFromDexie, setEventFromDexie] = useState<Calendar_Events[]>([])
    useEffect(()=>{
        let isMounted = true
        if (isMounted) {

            if(moveInput.id){
                processInput()
                setIsLoading(false)
            }

        }
        return () => {
            isMounted = false
        }

    },[moveInput.id])

    const processInput = async () =>{
        if(moveInput.id){

            const eventFromDexie = await getEventFromDexieByID(parseInt(moveInput.id.toString()))
            if(eventFromDexie && eventFromDexie.length > 0){
                setEventFromDexie(eventFromDexie)
                if(eventFromDexie[0].calendar_id){
                    if(eventFromDexie[0].type) setType(eventFromDexie[0].type)
                    if(eventFromDexie[0].type=="VTODO"){
                        const tempParsed = returnGetParsedVTODO(eventFromDexie[0].data)
                        setParsedEvent(tempParsed)
                        if(tempParsed && tempParsed.summary){
                            setSummary(tempParsed.summary)
                        }
                    }else{
                        const tempParsed = getParsedEvent(eventFromDexie[0].data)
                        if(tempParsed && tempParsed.summary){
                            setSummary(tempParsed.summary)
                        }
                        setParsedEvent(tempParsed)
                    }
                    setCalendarsID(eventFromDexie[0].calendar_id)
                    setCurrentCalID(eventFromDexie[0].calendar_id)
                }
            }
        }

    }

    const onCalendarSelect = (calId) =>{
        setCalendarsID(calId)
    }
    const handleChangeofCal = async () =>{
        if(moveChecked){
            // User wants to move.
            // Check if the target calendar is the same.
            if(calendar_id.toString()==currentCalID){
                toast.error(t("CANT_MOVE_TO_SAME_CALENDAR"))
                return
            }
            // Move the event.
            setIsLoading(true)
            copyEvent(true)
        }else{
            setIsLoading(true)
            copyEvent(false)
        }

    }
    const handleDelete = async (eventFromDexie: Calendar_Events[], caldav_accounts_id)=>{
        // console.log(eventFromDexie[0].url)
        await deleteEventByURLFromDexie(eventFromDexie[0].url)
        //Make delete request to server.
        const responseDelete = await deleteEventFromServer(caldav_accounts_id,eventFromDexie[0].calendar_id,eventFromDexie[0].url,eventFromDexie[0].etag, eventFromDexie[0])
        onServerResponse(responseDelete,summary)
        
        handleClose()
    }
    const copyEvent =  async (deleteTask) =>{
        if(!moveInput.id){
            toast.error(t("ERROR_GENERIC"))
            return
        }
        let parsedEventLocal: {} | undefined = {...parsedEvent}

        if(type=="VTODO"){
            
            if(parsedEventLocal && ("uid" in parsedEventLocal)){
                parsedEventLocal.uid=""
                // console.log("parsedEventLocal", parsedEventLocal)
                const todo = new VTodoGenerator(parsedEventLocal, { strict: false })
                const finalVTODO = todo.generate()

                // console.log(finalVTODO)
                goMakeRequests(finalVTODO, deleteTask)
            }

        }else if(eventFromDexie[0].type=="VEVENT"){
            parsedEventLocal = {...parsedEvent}
            parsedEventLocal["uid"]=""
            // console.log("parsedEventLocal", parsedEventLocal)
            const obj = getObjectForAPICallV2(parsedEventLocal)
            const ics = await makeGenerateICSRequest({ obj })
            goMakeRequests(ics, deleteTask)
        }
                
                // Make the request to server.
           
    }
    const goMakeRequests = async(finalVTODO, deleteTask) =>{
        const etag = getRandomString(16)

        const calendarFromDexie = await getCalendarbyIDFromDexie(calendar_id)
        const caldav_accounts_id = await getCalDAVAccountIDFromCalendarID_Dexie(calendar_id)
        const fileName = getRandomString(64) + ".ics"
        let url = calendarFromDexie[0].url
        if (url) {
            const lastChar = url.substr(-1);
            if (lastChar != '/') {
                url = url + '/';
            }
            
            url += fileName
        }

        await saveEventToDexie(calendar_id, url, etag, finalVTODO, type)
        toast.info(t("ACTION_SENT_TO_CALDAV"))
        const responseBody = await postNewEvent(calendar_id, finalVTODO, etag, caldav_accounts_id, calendarFromDexie[0].ctag, calendarFromDexie[0]["syncToken"], calendarFromDexie[0]["url"], type, fileName)
        // console.log("responseBody", responseBody)
        if(!deleteTask){
            onServerResponse(responseBody, summary)
            handleClose()
            return
        }else{
            if(responseBody && responseBody.success==true){
                //Task was successfully copied.
                //Make a request to delete it from the original calendar.
                handleDelete(eventFromDexie, caldav_accounts_id)
                
            }else{
                toast.error(t("ERROR_GENERIC"))
                console.error("copyEvent responseBody", responseBody)
            }


        }
    }
    const moveCheckedChanged = (e) =>{
        setMoveChecked(e.target.checked)
        setCopyChecked(!e.target.checked)
    }

    const copyCheckedChanged = (e) =>{
        setMoveChecked(!e.target.checked)
        setCopyChecked(e.target.checked)
    }
    return (
      <>
        <Modal centered show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{t("COPY_MOVE")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h1>{`${t("SUMMARY")}:`}</h1>
            <p className='textDefault'>{summary}</p>

            <h2>{t("CURRENT_CALENDAR")}</h2>
            <CalendarPicker disabled={true} key="current_calendar" onSelectedHook={onCalendarSelect} calendar_id={currentCalID} />
            <br />
            <Form.Check // prettier-ignore
            type="radio"
            inline
            onChange={moveCheckedChanged}
            name="group1"
            checked={moveChecked}
            id="move"
            label={t("MOVE")}
            />
            <Form.Check // prettier-ignore
            inline
            id="copy"
            name="group1"
            checked={copyChecked}
            type="radio"
            onChange={copyCheckedChanged}
            label={t("COPY")}
            />
            <br /> <br />
            <h2>{t("TARGET_CALENDAR")}</h2>
            <CalendarPicker key="final_calendar" onSelectedHook={onCalendarSelect} calendar_id={calendar_id} />

          </Modal.Body>
          <Modal.Footer>
            {
            isLoading ? 
            (
                <div style={{textAlign:"center"}}>
                    <Loading />
                </div>
            ):
            (
                <>
                <Button variant="secondary" onClick={handleClose}>
                    {t("CLOSE")}
                </Button>
                <Button variant="primary" onClick={handleChangeofCal}>
                    {t("COPY_MOVE")}
                </Button>

                </>
            )
            }
          </Modal.Footer>
        </Modal>
      </>
    );
}
