import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { moveEventModalInput } from 'stateStore/MoveEventStore';
import { CalendarPicker } from '../Calendarpicker';
import { deleteEventByURLFromDexie, deleteEventFromDexie, getAllChildrenforTask_FromDexie, getCalendarEventFromUID_Dexie, getEventFromDexieByID, saveEventToDexie } from '@/helpers/frontend/dexie/events_dexie';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import { Loading } from '../Loading';
import { getRandomString } from '@/helpers/crypto';
import { getCalDAVAccountIDFromCalendarID_Dexie, getCalendarbyIDFromDexie } from '@/helpers/frontend/dexie/calendars_dexie';
import { deleteEventFromServer, getParsedEvent, postNewEvent } from '@/helpers/frontend/events';
import { returnGetParsedVTODO } from '@/helpers/frontend/calendar';
import VTodoGenerator from 'vtodogenerator'
import { Calendar_Events } from '@/helpers/frontend/dexie/dexieDB';
import { getObjectForAPICallV2, makeGenerateICSRequest } from '@/helpers/frontend/ics';
import { useTranslation } from 'next-i18next';
import { Accordion } from 'react-bootstrap';
import React from 'react';
import * as _ from 'lodash';

interface EventsToMove{
    uid: string,
    calendar_events_id:string,
    summary:string,
    data: any,
    children?: EventsToMove[]
}
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
    const [allEventsToMove, setAllEventsToMove] = useState<EventsToMove[]>([])
    const [moveRelatedChecked, setMoveRelatedChecked] = useState(true)
    useEffect(()=>{
        let isMounted = true
        if (isMounted) {

            if(moveInput.id){
                setAllEventsToMove([])
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
                        if(tempParsed && tempParsed.summary && eventFromDexie[0].calendar_events_id){
                            // console.log("tempParsed.summary", tempParsed.summary)
                            const children = await processChildren(tempParsed["uid"])
                            if(children && Array.isArray(children) && children.length>0){
                               
                                setMoveRelatedChecked(true)
                            }else{
                                setMoveRelatedChecked(false)
                            }
                             setAllEventsToMove([{
                                    data: tempParsed,
                                    uid: tempParsed["uid"],
                                    calendar_events_id: eventFromDexie[0].calendar_events_id?.toString(),
                                    children: children,
                                    summary: tempParsed["summary"]
                                }])
                            // console.log("Final children", children)
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

    const processChildren = async (id) : Promise<EventsToMove[]> =>{
        let toReturn: EventsToMove[] = []
        const children = await getAllChildrenforTask_FromDexie(id)
        if(!children)
            return toReturn
        // console.log(`children ${id}`, children)
        if(children && Array.isArray(children)){
            // let grandChildren: EventsToMove[] = []
            for (const i in children){
                const data = await getCalendarEventFromUID_Dexie(children[i].uid)
                if(children[i].uid && data && data.length>0){
                    const tempParsed = returnGetParsedVTODO(data[0].data)
                    if(tempParsed && ("summary" in tempParsed) && tempParsed.summary && typeof(tempParsed["summary"]) =="string" && data[0].calendar_events_id){
                        const grandChildren = await processChildren(children[i].uid)
                        
                        toReturn.push({uid: children[i]!.uid!, calendar_events_id:data[0].calendar_events_id.toString(), summary: tempParsed["summary"], data: tempParsed, children: grandChildren})
                    }
                    
                }
                
                
                
            }
            // toReturn = [...toReturn , ...grandChildren]
            
        }
        
        // console.log(`toReturn ${id}`, toReturn)
        // console.log("grandChildren", grandChildren)
        
        return toReturn
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
    const handleDelete = async (eventFromDexie: Calendar_Events[], caldav_accounts_id, isChild?:boolean)=>{
        // console.log(eventFromDexie[0].url)
        await deleteEventByURLFromDexie(eventFromDexie[0].url)
        //Make delete request to server.
        const responseDelete = await deleteEventFromServer(caldav_accounts_id,eventFromDexie[0].calendar_id,eventFromDexie[0].url,eventFromDexie[0].etag, eventFromDexie[0])
        return responseDelete
        if(!isChild){
            onServerResponse(responseDelete,summary)
            handleClose()
        }
        
    }
    const copyEvent =  async (deleteTask) =>{
        if(!moveInput.id){
            toast.error(t("ERROR_GENERIC"))
            return
        }
        
        let parsedEventLocal: {} | undefined = {...parsedEvent}

        if(type=="VTODO"){
            let temp_eventToMove = _.cloneDeep(allEventsToMove)
            if(temp_eventToMove && Array.isArray(temp_eventToMove) && temp_eventToMove.length>0){
                
                //Remove the parent from the top level event. 
                // console.log("temp_eventToMove", allEventsToMove[0].data["relatedto"], temp_eventToMove[0].data["relatedto"])

                const responseBody = await recursiveRequestforTodo(temp_eventToMove, deleteTask)
                if(!deleteTask){

                        onServerResponse(responseBody, summary)
                        handleClose()
                        return
                }else{
                    if(responseBody && responseBody.success==true){
                        //Task was successfully copied.
                        //Make a request to delete it from the original calendar.
                        const caldav_accounts_id = await getCalDAVAccountIDFromCalendarID_Dexie(calendar_id)
                        const responseDelete= await recursiveDeleteEvents(allEventsToMove, caldav_accounts_id)
                        onServerResponse(responseDelete,summary)
                        handleClose()

                        
                    }else{
                        toast.error(t("ERROR_GENERIC"))
                        console.error("copyEvent responseBody", responseBody)
                    }
                }

                // onServerResponse(responseDelete,summary)
                
            }
            // handleClose()
            // if(allEventsToMove.length>0){
            // for(const i in allEventsToMove){
            //     const data = await getCalendarEventFromUID_Dexie(allEventsToMove[i].uid)
            //     if(data){
            //         if(data[0].parsedData){
            //             let parsed = {...data[0].parsedData}
            //             // parsed.uid = generateNewUID()
            //             const todo_child = new VTodoGenerator({...parsed}, { strict: false })
            //             const finalVTODO_child = todo_child.generate()
            //             await goMakeRequests(finalVTODO_child, deleteTask, true)
            //         }
            //     }


            // }
            // }
            // if(parsedEventLocal && ("uid" in parsedEventLocal)){
            //     parsedEventLocal.uid=""
            //     // console.log("parsedEventLocal", parsedEventLocal)
            //     const todo = new VTodoGenerator(parsedEventLocal, { strict: false })
            //     const finalVTODO = todo.generate()

            //     // console.log(finalVTODO)
            //     //First we copy/move the children.
         
            //     await goMakeRequests(finalVTODO, deleteTask, false)
            // }

        }else if(eventFromDexie[0].type=="VEVENT"){
            parsedEventLocal = {...parsedEvent}
            parsedEventLocal["uid"]=""
            // console.log("parsedEventLocal", parsedEventLocal)
            const obj = getObjectForAPICallV2(parsedEventLocal)
            const ics = await makeGenerateICSRequest({ obj })
            await goMakeRequests(ics, deleteTask, false)
        }
                
                // Make the request to server.
           
    }
    const recursiveDeleteEvents = async(toDeleteArray: EventsToMove[] | undefined, caldav_accounts_id) =>{
        let toReturn;
        for(const i in toDeleteArray){

            if(toDeleteArray[i] && ("children" in toDeleteArray[i]) && toDeleteArray[i].children && Array.isArray(toDeleteArray[i].children) && toDeleteArray[i].children!.length>0){
                toReturn = await recursiveDeleteEvents(toDeleteArray[i].children, caldav_accounts_id)
            }
            const temp_Event = await getEventFromDexieByID(parseInt(toDeleteArray[i].calendar_events_id))
            console.log("temp_Event", toDeleteArray[i].calendar_events_id, toDeleteArray[i].summary,temp_Event)
            if(temp_Event && Array.isArray(temp_Event) && temp_Event.length>0){
                toReturn = await goDeleteTodo(temp_Event, caldav_accounts_id)

            }
        }
        return toReturn

    }

    const recursiveRequestforTodo = async (toMoveArray: EventsToMove[] | undefined, deleteTask, parentID?) =>{

        let toReturn;
        if(toMoveArray && toMoveArray.length>0){
            for(const i in toMoveArray){
                // const data = await getCalendarEventFromUID_Dexie(toMoveArray[i].uid)
                if(toMoveArray[i] && toMoveArray[i].data){
                        let parsed = {...toMoveArray[i].data}
                        const newParentID =  getRandomString(32)+"@intri"
                        parsed.uid = newParentID
                        parsed["relatedto"] = parentID
                        parsed["related-to"] = parentID
                        // console.log("parsed", newParentID, parsed)
                        const todo_child = new VTodoGenerator({...parsed}, { strict: false })
                        const finalVTODO_child = todo_child.generate()
                        const children = toMoveArray[i].children
                        if(children && Array.isArray(children) && children!.length>0)
                        {
                            //Add new parent ID
                            for(const k in children){
                                children[k].data["relatedto"] = newParentID
                            }
                            toReturn = await recursiveRequestforTodo(children, deleteTask, newParentID)
                        }
                        const isChild = parentID ? true: false
                        toReturn = await goMakeRequests(finalVTODO_child, deleteTask, isChild)
                        // console.log("finalVTODO_child", finalVTODO_child)
                }


            }
        }

        return toReturn
    }
    const goDeleteTodo = async (eventToDeleteFromDexie: Calendar_Events[], caldav_accounts_id) =>{
        return await handleDelete(eventToDeleteFromDexie, caldav_accounts_id)

    }
    const goMakeRequests = async(finalVTODO, deleteTask, isChild:boolean) =>{
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
        // toast.info(t("ACTION_SENT_TO_CALDAV"))
        const responseBody = await postNewEvent(calendar_id, finalVTODO, etag, caldav_accounts_id, calendarFromDexie[0].ctag, calendarFromDexie[0]["syncToken"], calendarFromDexie[0]["url"], type, fileName)
        // console.log("responseBody", responseBody)

        return responseBody
        if(!deleteTask){
            if(!isChild){

                onServerResponse(responseBody, summary)
                handleClose()
                return
            }
        }else{
            if(responseBody && responseBody.success==true){
                //Task was successfully copied.
                //Make a request to delete it from the original calendar.
                handleDelete(eventFromDexie, caldav_accounts_id, isChild)
                
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

    const moveRelatedChanged =(e) =>{
        setMoveRelatedChecked(e.target.checked)
    }

    const generateRelatedTaskOutput =  (inputArray: EventsToMove[] | undefined) =>{
        let output: React.JSX.Element[] = []
        if(inputArray && Array.isArray(inputArray) && inputArray.length>0 && inputArray[0].children && Array.isArray(inputArray[0].children)){
            for(const i in inputArray){
                if( inputArray[i].summary){
                    output.push(<li key={inputArray[i].summary}>{inputArray[i].summary.toString()}</li>)
                    const children  = inputArray[i].children
                    if(children){

                        const grandKids = generateRelatedTaskOutput(children)
                        output.push(...grandKids)
                    }
                }
            }
        }
        return output
    }
    // console.log("otherEventsToMove", otherEventsToMove)
    return (
        <Modal id={moveInput.id} centered show={show} onHide={handleClose}>
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
            {
                (allEventsToMove && allEventsToMove.length>0 && allEventsToMove[0].children &&  Array.isArray(allEventsToMove[0].children ) && allEventsToMove[0].children.length>0)? (<>
                    <Form.Check // prettier-ignore
                    type="switch"
                    id={`${moveInput.id}__moverelatedTasks`}
                    label={t("MOVE_RELATED_TASKS")}
                    checked={moveRelatedChecked}
                    onChange={moveRelatedChanged}
                    />
                    <br />
                       
                        <>
                        <Accordion >
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>{t("RELATED_TASKS")}</Accordion.Header>
                                <Accordion.Body>
                                {t("MOVE_RELATED_TASKS_DESC")}
                                <br /><br />
                                <ul>
                                    { generateRelatedTaskOutput(allEventsToMove)}

                                </ul>

                                </Accordion.Body>
                            </Accordion.Item>
                            </Accordion>
                        </>
                  
                    <br /><br />

                    </>) : (<></>)
            }
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
    );
}
