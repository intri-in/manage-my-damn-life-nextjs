
import { getTemplatesFromServer } from '@/helpers/frontend/templates';
import { isDarkModeEnabled } from '@/helpers/frontend/theme';
import i18next from 'i18next';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Loading } from '../Loading';
import Badge from 'react-bootstrap/Badge';
import { useSetAtom } from 'jotai';
import { TaskEditorInputType, showTaskEditorAtom, taskEditorInputAtom } from 'stateStore/TaskEditorStore';
import { EventEditorInputType, eventEditorInputAtom, showEventEditorAtom } from 'stateStore/EventEditorStore';
import { returnGetParsedVTODO } from '@/helpers/frontend/calendar';
import moment from 'moment';
import { getCalendarIDFromUrl_Dexie } from '@/helpers/frontend/dexie/calendars_dexie';
import { geParsedtVAlarmsFromServer, getParsedEvent } from '@/helpers/frontend/events';
import { useTranslation } from 'next-i18next';
export function AddFromTemplateModal() {
    const [show, setShow] = useState(false);
    const [finalOutput, setFinalOutput] = useState([<Loading centered={true} />])
  
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    /***
     * Jotai
     */
    const showTaskEditor = useSetAtom(showTaskEditorAtom)
    const setTaskInputAtom = useSetAtom(taskEditorInputAtom)

    const showEventEditor = useSetAtom(showEventEditorAtom)
    const setEventInputAtom = useSetAtom(eventEditorInputAtom)
    const {t} = useTranslation()
    useEffect(() =>{
        getAllTemplatesFromServer()
    },[])

    const useTemplate =async (data, type) =>{
        
        if(type.toUpperCase()=="TASK"){
            if(data){
                const parsedTemplate =  JSON.parse(data)
                if (("data" in parsedTemplate) && parsedTemplate.data){
                    const parsedTask = returnGetParsedVTODO(parsedTemplate.data)
                    if(parsedTask && ("summary" in parsedTask)  && parsedTask.summary){
                        let finalTaskInput: TaskEditorInputType ={id: null}
                        if(parsedTask["due"]){
                            const due =new Date(moment(parsedTask["due"]).toISOString()) 
                            finalTaskInput.due= due

                        }
                        if(parsedTask["start"]){
                            const start = new Date(moment(parsedTask["start"]).toISOString())
                            finalTaskInput.start=start

                        }
                        finalTaskInput["summary"]= parsedTask["summary"].toString()

                        if(parsedTask["category"]){
                            finalTaskInput["category"] = parsedTask["category"]
                        }
                        if(parsedTask["priority"]){
                            finalTaskInput["priority"] = parsedTask["priority"]
                        }

                        if("calendar_id" in parsedTemplate && parsedTemplate["calendar_id"]){
                            const idFromDexie = await getCalendarIDFromUrl_Dexie(parsedTemplate["calendar_id"])
                            if(idFromDexie){
                                finalTaskInput.calendar_id = parseInt(idFromDexie.toString())
                            }
                        }
                       
                        if(parsedTask["status"]){
                            finalTaskInput["status"] = parsedTask["status"]
                        }
                             
                        if(parsedTask["completion"]){
                            finalTaskInput["completion"] = parsedTask["completion"]
                        }
                        if(parsedTask["description"]){
                            finalTaskInput["description"] = parsedTask["description"]
                        }
                        if(parsedTask["rrule"]){
                            finalTaskInput["rrule"] = parsedTask["rrule"]
                        }
                        setTaskInputAtom(finalTaskInput)
                        showTaskEditor(true)
            
                    }
                }

            }
            
        }else{
            if(data){
                const parsedTemplate =  JSON.parse(data)
                if (("data" in parsedTemplate) && parsedTemplate.data){

                    const parsedEvent = getParsedEvent(parsedTemplate.data)
                    let finalTaskInput: EventEditorInputType ={id: null}
                    if(parsedEvent["start"]){
                        finalTaskInput.start= moment(parsedEvent["start"]).toISOString()
    
                    }
                    if(parsedEvent["end"]){
                        finalTaskInput.end= moment(parsedEvent["end"]).toISOString()
    
                    }
                    finalTaskInput["summary"]= parsedEvent["summary"].toString()
    
                    if(parsedEvent["priority"]){
                        finalTaskInput["priority"] = parsedEvent["priority"]
                    }
    
                    if("calendar_id" in parsedTemplate && parsedTemplate["calendar_id"]){
                        const idFromDexie = await getCalendarIDFromUrl_Dexie(parsedTemplate["calendar_id"])
                        if(idFromDexie){
                            finalTaskInput.calendar_id = parseInt(idFromDexie.toString())
                        }
                    }
                   
                    if(parsedEvent["status"]){
                        finalTaskInput["status"] = parsedEvent["status"]
                    }
                    const alarms = await geParsedtVAlarmsFromServer(parsedTemplate.data)
                    finalTaskInput["alarms"] = alarms
                    // console.log("alarms AddFromTemplateModal", alarms)
                    if(parsedEvent["description"]){
                        finalTaskInput["description"] = parsedEvent["description"]
                    }
                    if(parsedEvent["rrule"]){
                        finalTaskInput["rrule"] = parsedEvent["rrule"]
                    }
    
                    setEventInputAtom({
                        ...finalTaskInput
                    })
                    showEventEditor(true)
    
                }
            }
        }
    
        handleClose()
    }
    const getAllTemplatesFromServer = async() =>{

        const finalOutput: JSX.Element[] = []
        const response = await getTemplatesFromServer()
        const borderColor = isDarkModeEnabled() ? "white" : "#F1F1F1"
        if(response && Array.isArray(response)){
            for(const i in response){
                let row=(
                    <>
                    <div className="card" key={i+"_"+"templateName"} style={{border:`1px solid ${borderColor}`, padding: 20, marginBottom:20, borderRadius: 20}}>
                    <Row>
                    <Col>
                    {response[i]["name"]}
                    </Col>
                    <Col>
                    <Badge pill bg="secondary">
                        {t(response[i]["type"])}
                    </Badge>
                    </Col>
                    <Col style={{textAlign:"right"}}>
                    <Button onClick={()=>useTemplate(response[i]["data"], response[i]["type"])} size='sm'>{t("USE")}</Button>
                    </Col>
                    </Row>
                    
                    </div>
                    
                    
                    </>
                )
                finalOutput.push(row)
            }
            if(finalOutput.length>0){
    
                setFinalOutput(finalOutput)
            }   else{
                setFinalOutput([<p>{t("NOTHING_TO_SHOW")}</p>])
            }     
        }
    
    
    }
    

    return (
      <>
        <div style={{textAlign: "right"}}>
        <Button onClick={handleShow} style={{marginBottom:10}} size="sm" variant="outline-primary">{t("ADD_FROM_TEMPLATE")}</Button>
        </div>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{t("ADD_FROM_TEMPLATE")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{t("ADD_FROM_TEMPLATE_DESC")}</p>
            {finalOutput}
        </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              {t("CLOSE")}
            </Button>
          </Modal.Footer>
        </Modal>
 
      </>
    );
  }
  