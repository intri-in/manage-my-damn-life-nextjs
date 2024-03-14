import Accordion from 'react-bootstrap/Accordion';
import { getI18nObject } from "@/helpers/frontend/general";
import { Col, Container, Form, Row } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { TaskArrayItem, TaskSection } from '@/helpers/frontend/TaskUI/taskUIHelpers';
import { isValidResultArray, stringInStringArray } from '@/helpers/general';
import { returnGetParsedVTODO } from '@/helpers/frontend/calendar';
import { getEventFromDexieByID } from '@/helpers/frontend/dexie/events_dexie';
import { SYSTEM_DEFAULT_LABEL_PREFIX } from '@/config/constants';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { SortBySelect } from './SortByButton';

const i18next = getI18nObject()

export interface labelSelector{
    name: string,
    selected: boolean
}
export const LocalTaskFilters = ({taskListSections, showDoneChangedHook, labelSelectedChangedHook, sortSelectChangeHook}:{taskListSections: TaskSection[], showDoneChangedHook: Function, labelSelectedChangedHook: Function, sortSelectChangeHook: Function}) =>{

    const [showDone, setShowDone] = useState(false)
    const [filterList, setFilterList] = useState<labelSelector[]>([])

    useEffect(()=>{
        let isMounted = true
        // console.log(Array.isArray(taskListSections), "taskListSection")
        if(isMounted){
            //Generate List of filters on mount.
            generateFilterList()
        }

        return ()=>{
            isMounted = false
        }
    },[taskListSections])

    const generateFilterList = async () =>{
        
        if(taskListSections && Array.isArray(taskListSections)){
            let finalList: labelSelector[] = []
            for(const k in taskListSections){
                const taskList = taskListSections[k].tasks
                if(taskList && isValidResultArray(taskList)){
        
                    for(const i in taskList){
                        const eventFromDexie = await getEventFromDexieByID(parseInt(taskList[i].id.toString()))
                        if(isValidResultArray(eventFromDexie) && eventFromDexie[0].data){
        
                            const todo = returnGetParsedVTODO(eventFromDexie[0].data)
                            if(todo && ("category" in todo) && Array.isArray(todo["category"])){
                                
                                for(const k in todo["category"]){
                                    // console.log(todo["category"][k])
                                    if(todo.category[k].startsWith(SYSTEM_DEFAULT_LABEL_PREFIX)==false && searchLabelArray(todo["category"][k], finalList)==false){
                                       finalList.push({
                                        name: todo["category"][k],
                                        selected: false
                                       })
                                        
                                    }
                                }
                                
                                
                            }
                        }
                    }
                }
        
            }
            setFilterList(finalList)
            labelSelectedChangedHook(finalList)

        }
    }

    const searchLabelArray = (needle: string, currentLabel: labelSelector[]) =>{
        for(const k in currentLabel){
            if(needle==currentLabel[k].name){
                return true
            }
        }
        return false
    }
    const showDoneChanged  = (e) =>{
      setShowDone(prevCheck => !prevCheck)
      showDoneChangedHook(e.target.checked)
    }
    const selectedLabelsChanged = (name) =>{
        let newArray: labelSelector[] = []
        for(const k in filterList){
            if(filterList[k].name==name){
                newArray.push({
                    name: filterList[k].name,
                    selected: !filterList[k].selected
                })
            }else{
                newArray.push({
                    name: filterList[k].name,
                    selected: filterList[k].selected
                })
            }
        }
        setFilterList(newArray)
        labelSelectedChangedHook(newArray)
    }

    const onChangeSort = (value) =>{
        sortSelectChangeHook(value)
    }
    return(
    <Accordion>
        <Accordion.Item eventKey="0">
            <Accordion.Header>{i18next.t("FILTERS")}</Accordion.Header>
            <Accordion.Body>
            <Container fluid>
            <Row >
                <Col><FilterListSelector onChange={selectedLabelsChanged} filterList={filterList} /></Col>
                <Col className='d-flex justify-content-center' style={{alignItems:"center"}}>
                <Form.Check 
                type="switch"
                checked={showDone}
                onChange={showDoneChanged}
                label={i18next.t("SHOW_DONE_TASKS")}
            /> 
                </Col>
                <Col className='d-flex justify-content-end'>
                <SortBySelect onChangeHandler={onChangeSort} />
                </Col>

            </Row>

            </Container>
            </Accordion.Body>
        </Accordion.Item>
    </Accordion>
)
}

const FilterListSelector = ({filterList, onChange}:{filterList: labelSelector[], onChange: Function}) => {

    const [labelOutput, setLabelOutput] = useState<JSX.Element[]>([])
    useEffect(()=>{
        let isMounted = true
        if(isMounted){
            //Generate List of filters on mount.
            let output : JSX.Element[]= []
            for(const i in filterList){
                output.push(
                    <Form.Check
                    inline
                    key={filterList[i].name}
                    checked={filterList[i].selected}
                    label={filterList[i].name}
                    name={filterList[i].name}
                    onChange={()=>onChange(filterList[i].name)}
                  />
                )


            }

            setLabelOutput(output)
        }

        return ()=>{
            isMounted = false
        }
    },[filterList])


    return(
        <>
            <p><b>{i18next.t("FILTER_BY_LABEL")}:</b></p>
            {labelOutput}
        </>
    )
}