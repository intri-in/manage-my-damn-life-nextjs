import Accordion from 'react-bootstrap/Accordion';
import { Badge, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { TaskArrayItem, TaskSection } from '@/helpers/frontend/TaskUI/taskUIHelpers';
import { isValidResultArray, stringInStringArray } from '@/helpers/general';
import { returnGetParsedVTODO } from '@/helpers/frontend/calendar';
import { getEventFromDexieByID } from '@/helpers/frontend/dexie/events_dexie';
import { SYSTEM_DEFAULT_LABEL_PREFIX } from '@/config/constants';
import { FaSearch } from "react-icons/fa";
import { SortBySelect } from './SortByButton';
import { useTranslation } from 'next-i18next';
import Stack from 'react-bootstrap/Stack';
import { toast } from 'react-toastify';

export interface labelSelector{
    name: string,
    selected: boolean
}
export const LocalTaskFilters = ({taskListSections, showDoneChangedHook, labelSelectedChangedHook, sortSelectChangeHook, taskSearchChangedHook}:{taskListSections: TaskSection[], showDoneChangedHook: Function, labelSelectedChangedHook: Function, sortSelectChangeHook: Function, taskSearchChangedHook: Function}) =>{

    const [showDone, setShowDone] = useState(false)
    const [filterList, setFilterList] = useState<labelSelector[]>([])
    const [search, setSearch] = useState("")
    const {t} = useTranslation()
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
                                    if(todo["category"][k] && todo.category[k].startsWith(SYSTEM_DEFAULT_LABEL_PREFIX)==false && searchLabelArray(todo["category"][k], finalList)==false){
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
    useEffect(()=>{
        let isMounted = true
        // console.log(Array.isArray(taskListSections), "taskListSection")
        if(isMounted){
            //Generate List of filters on mount.
            searchTasks({target:{value: ""}})
            setSearch("")
            generateFilterList()
        }

        return ()=>{
            isMounted = false
        }
    },[taskListSections])


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

    const searchTasks = (e) =>{
        setSearch(e.target.value)
        taskSearchChangedHook(e.target.value)
    }
    const placeholderText = t("SEARCH")
    return(
        <>
            <AppliedFilters showDone={showDone} filterList={filterList} searchTerm={search} showDoneChanged={showDoneChanged} searchTasks={searchTasks} />
            <Accordion >
                <Accordion.Item eventKey="0">
                    <Accordion.Header>{t("FILTERS")}</Accordion.Header>
                    <Accordion.Body>
                    <Container fluid>
                    <Stack gap={2}>
                        <Row style={{marginBottom: 2}}>
                            <Col className='d-flex align-content-center' style={{alignItems:"center"}}>
                            <Form.Check 
                            type="switch"
                            checked={showDone}
                            onChange={showDoneChanged}
                            label={t("SHOW_DONE_TASKS")}
                            /> 
                            </Col>
                            <Col className='d-flex justify-content-end'>
                            <SortBySelect onChangeHandler={onChangeSort} />
                            </Col>

                            
                        </Row>
                    <b>{t("LIST_SPECIFIC_FILTERS")}</b>
                    <InputGroup className="mb-1">
                        <InputGroup.Text id="basic-addon1"><FaSearch /></InputGroup.Text>
                            <Form.Control size="sm" value={search} onChange={searchTasks} placeholder={placeholderText} />
                    </InputGroup>
                    <Row className=' d-flex  align-items-center' style={{marginBottom: 5}}>
                        <Col><FilterListSelector t={t} onChange={selectedLabelsChanged} filterList={filterList} /></Col>
                    </Row>
                    </Stack>
                
                  

                    </Container>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </>
)
}

const AppliedFilters = ({showDone, filterList, searchTerm, showDoneChanged, searchTasks}:{showDone: boolean, filterList: labelSelector[], searchTerm: string, showDoneChanged:Function, searchTasks:Function}) =>{
    const {t} = useTranslation()

    let output: JSX.Element[] = []
    const removeShowDoneFilter = () =>{
        showDoneChanged({target:{checked: false}})
        toast.info(t("TASK_FILTER_REMOVED"))
    }
    const removeSearchTermFilter =  () =>{
        searchTasks({target:{value: ""}})
        toast.info(t("TASK_FILTER_REMOVED"))

    }

    if(showDone){
        output.push(
              <div key="SHOW_DONE_TASKS" className="p-1"><Badge pill={true} onClick={removeShowDoneFilter} bg="primary">{t("SHOW_DONE_TASKS")}</Badge></div>
        )
    }
    if(searchTerm){
        output.push(
              <div key="SEARCH_TERM" className="p-1"><Badge pill={true} onClick={removeSearchTermFilter} bg="primary">{`${t("SEARCH_TERM")}: ${searchTerm}`}</Badge></div>
        )
    }

    if(output.length>0){
        return(
        <Stack style={{display:"flex",  alignItems:"center", }} direction="horizontal" gap={1}>
        <small>{t("FILTERS_APPLIED")}</small>
        {output}
        </Stack>
        )

    }else{
        return (<></>)
    }
    
    
}
const FilterListSelector = ({filterList, onChange, t}:{filterList: labelSelector[], onChange: Function, t:any}) => {

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

            setLabelOutput([<Stack key="labelList" direction='horizontal'>{output}</Stack>])
        }

        return ()=>{
            isMounted = false
        }
    },[filterList,onChange])


    return(
        <>
            <i>{t("FILTER_BY_LABEL")}:</i>
            {labelOutput}
        </>
    )
}