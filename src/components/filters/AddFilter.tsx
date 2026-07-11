import React, { useState, useEffect } from "react";
import { SECONDARY_COLOUR } from "@/config/style";
import { useRouter } from "next/router";
import { Alert, Button, Col, Form, Row, Stack } from "react-bootstrap";
import Datetime from "react-datetime";
import moment from "moment";
import { Loading } from "@/components/common/Loading";
import { getLabelsFromServer } from "@/helpers/frontend/labels";
import { isValidResultArray, varNotEmpty } from "@/helpers/general";
import { Toastify } from "@/components/Generic";
import { toast } from "react-toastify";
import {
  makeFilterEditRequest,
  saveFiltertoServer,
} from "@/helpers/frontend/filters";
import { getAllLabelsFromDexie } from "@/helpers/frontend/dexie/dexie_labels";
import { useTranslation } from "next-i18next";
import { currentDateFormatAtom, currentSimpleDateFormatAtom, currentSimpleTimeFormatAtom } from "stateStore/SettingsStore";
import { Datepicker } from "../common/Datepicker/Datepicker";
import { useAtomValue } from "jotai";
import { Labels } from "@/helpers/frontend/dexie/dexieDB";
import { BasicMMDlFilter, TaskFilter } from "types/tasks/filters";
import { checkIfFilterValid, filterDueIsValid, filterToWords } from "@/helpers/frontend/filtersTS";
import { filterByLabels } from "stateStore/LocalTaskFilters";

type logicType = "or" |  "and"
type unitType= "HOURS" | "DAYS"
export const AddFilter = ({onClose, onAdd, filterNameInput,filterInput, filterid, mode}:{onClose: Function, onAdd: Function, filterNameInput?: string,filterInput?: TaskFilter, filterid?: string , mode?:string}) =>{
  const {t} = useTranslation();
  const fullDateFormatFromAtom = useAtomValue(currentDateFormatAtom)

  const [filterName, setFilterName] = useState("");
  const [filterbyDueChecked, setFilterbyDueChecked] = useState(false);
  const [filterbyDueRelativeChecked, setFilterbyDueRelativeChecked] = useState(false);
  const [dueDateRelativeDirection, setDueDateRelativeDirection] = useState("DUE_BEFORE")
  const [dueDateRelativeValue, setDueDateRelativeValue] = useState(24)
  const [dueDateRelativeUnit, setDueDateRelativeUnit] = useState<unitType>("HOURS")
  const [dueDateFrom, setDueDateFrom] = useState("");
  const [dueDateBefore, setDueDateBefore] = useState("");
  const [filterLogic, setFilterLogic] = useState <logicType>("or");
  const [filterbyLabelChecked, setFilterbyLabelChecked] = useState(false);
  const [filterbyPriority, setFilterbyPriority] = useState(false);
  const [priorityValue, setPriorityValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filternameInvalid, setFilternameInvalid] = useState(false);
  const [selectedLables, setSelectedLables] = useState<string[]>([]);
  const [labelLogic, setLabelLogic] = useState("OR")
  const [labelListFromDexie, setLabelListFromDexie] = useState<Labels[]>([])
  const [filterbyStart, setFilterbyStart] = useState(false)
  const [startAfter, setStartAfter] = useState("")
  const [startBefore, setStartBefore] = useState("")
  const [filterbyStartRelative, setFilterbyStartRelative] = useState(false)
  const [startRelativeDirection, setStartRelativeDirection] = useState("TASK_STARTS_BEFORE")
  const [startRelativeValue, setStartRelativeValue] = useState(24)
  const [startRelativeUnit, setStartRelativeUnit] = useState<unitType>("HOURS")
  
  const processIncomingProps = () => {

    generateLabelCheckList();

    if (mode === "edit" && filterInput) {

      if(filterNameInput){
        setFilterName(filterNameInput)
      }
      if(!filterInput.filter){
        return
        
      }
      if (filterInput.filter.due && Array.isArray(filterInput.filter.due)) {
        const dueFromValid = moment(filterInput.filter.due[0]).isValid()
        const dueBeforeValid = moment(filterInput.filter.due[1]).isValid()

        if(dueFromValid || dueBeforeValid){

          setFilterbyDueChecked(true);
        }
        setDueDateFrom(
          dueFromValid
            ? moment(filterInput.filter.due[0]).toISOString()
            : ""
        );
        setDueDateBefore(
          dueBeforeValid
            ? moment(filterInput.filter.due[1]).toISOString()
            : ""
        );
      } 
      if(filterInput.filter.dueRelative && filterInput.filter.dueRelative.value && filterInput.filter.dueRelative.direction &&filterInput.filter.dueRelative.unit){
        setFilterbyDueRelativeChecked(true)
        setDueDateRelativeDirection(filterInput.filter.dueRelative.direction)
        setDueDateRelativeUnit(filterInput.filter.dueRelative.unit as unitType)
        setDueDateRelativeValue(filterInput.filter.dueRelative.value)
      }

      if(filterInput.filter.label){
        let labelList: string[] = []
        if(Array.isArray(filterInput.filter.label)){
          labelList = filterInput.filter.label
        }else{
          if(filterInput.filter.label.logic && filterInput.filter.label.filters && Array.isArray(filterInput.filter.label.filters)){
            labelList = filterInput.filter.label.filters
            setLabelLogic(filterInput.filter.label.logic)
          } 
        }
        if(labelList.length>0){
          setFilterbyLabelChecked(true);
          setSelectedLables(labelList)
        }

      }
      if (filterInput.filter.priority && filterInput.filter.priority!="0" ) {
        setFilterbyPriority(true);
        setPriorityValue(filterInput.filter.priority.toString());
      }
      
      if(filterInput.filter.start && filterInput.filter.start.after &&  filterInput.filter.start.before){

        const startAfterValid = moment(filterInput.filter.start.after).isValid()
        const startBeforeValid = moment(filterInput.filter.start.before).isValid()
        if(startAfterValid || startBeforeValid){
          setFilterbyStart(true)
        }
          setStartBefore(
            startBeforeValid ? 
            moment(filterInput.filter.start.before).toISOString() :"")

          setStartAfter(
            startAfterValid ?
            moment(filterInput.filter.start.after).toISOString():"")

      }

      if(filterInput.filter.startRelative && filterInput.filter.startRelative.value && filterInput.filter.startRelative.direction &&filterInput.filter.startRelative.unit){
        setFilterbyStartRelative(true)
        setStartRelativeDirection(filterInput.filter.startRelative.direction)
        setStartRelativeUnit(filterInput.filter.startRelative.unit as unitType)
        setStartRelativeValue(filterInput.filter.startRelative.value)
      }
      setFilterLogic(filterInput.logic || "or");

    }

  };

  const removeDanglingLabelsFromIncomingFilters = async (labelsFromProps) => {
    if (!isValidResultArray(labelsFromProps)) return;

    const labels = await getAllLabelsFromDexie();
    const newLabelArray = labelsFromProps.filter((labelFromProps) =>
      labels.some((label) => label.name === labelFromProps)
    );

    // setSelectedFilters((prevFilters) => ({
    //   ...prevFilters,
    //   filter: { ...prevFilters.filter, label: newLabelArray },
    // }));
  };

  const generateLabelCheckList = () => {
    const results: JSX.Element[] = [];

    if (isValidResultArray(labelListFromDexie)) {
        labelListFromDexie.forEach((label, index) => {
            if(label.name){

                const checked = selectedLables.includes(label.name);
                results.push(
                  <Form.Check
                    inline
                    onClick={onClickLabelName}
                    key={`${index}_${label.name}`}
                    label={label.name}
                    id={label.name}
                    checked={checked}
                    onChange={() => {}}
                  />
                );
            }
      });
    }

    return (<>
    {results}
    <br />
    </>)
    // setLabelNamesChecklist(<div style={{ padding: 5 }}>{results}</div>);
  };

  const onClickLabelName = (e) => {
    const { id, checked } = e.target;
    setSelectedLables(oldArray => {


        if(oldArray.includes(id)){
            // We will remove it from selected array list.
            return  oldArray.filter(item => item !== id)
        }
        else{
        // checked is false. Therefore we must add it to the oldArray

        return [...oldArray, id]
        }
        
    });


  };
  const filterbyPriorityCheckboxChanged = (e) =>{
      setFilterbyPriority(e.target.checked)
    if(!e.target.checked){
        setPriorityValue("")
    } 
  }
  const priorityMinimumSelected = (e) =>{
    setPriorityValue(e.target.value)
  }

  const getCurrentSelectedFilter = ()  =>{
    let filter: BasicMMDlFilter =  { due: [dueDateFrom, dueDateBefore], label: {filters: selectedLables, logic: labelLogic}, priority: priorityValue, start:{before:startBefore, after:startAfter} }
    if(filterbyDueRelativeChecked){
      filter.dueRelative= {direction: dueDateRelativeDirection, value: dueDateRelativeValue, unit: dueDateRelativeUnit
     }
    }
    if(filterbyStartRelative){
      filter.startRelative= {direction: startRelativeDirection, value: startRelativeValue, unit: startRelativeUnit}
    }

    return{
        logic: filterLogic, filter: filter
    }

  }
  const handleSubmitFilter = async () => {
    if (!filterName) {
      toast.error(t("ENTER_VALID_FILTER_NAME"));
      setFilternameInvalid(true);
      return;
    }
  const resp = checkIfFilterValid(getCurrentSelectedFilter())
  // console.log("resp", resp, getCurrentSelectedFilter())
    if (!resp.status) {
      toast.error(t("INVALID_FILTER_DETAILS"));
      if(resp.message){
        if(resp.message.global){
          toast.error(t(resp.message.global));
        }
        if(filterbyDueChecked && resp.message.due){
          toast.error(t(resp.message.due));
        }
        if(filterbyDueRelativeChecked && resp.message.dueRelative){
          toast.error(t(resp.message.dueRelative));

        }
        if(filterbyLabelChecked && resp.message.label){
          toast.error(t(resp.message.label));

        }
        if(filterbyPriority && resp.message.priority){
          toast.error(t(resp.message.priority));
        }
        if(filterbyStart && resp.message.start){
          toast.error(t(resp.message.start));

        }
      }
      return;
    }

    setIsSubmitting(true);
    // console.log("getCurrentSelectedFilter()", getCurrentSelectedFilter())
    try {
      const response =
        mode === "edit" && filterid
          ? await makeFilterEditRequest(
              filterid,
              filterName,
              getCurrentSelectedFilter()
              )
              : await saveFiltertoServer(
                filterName,
                getCurrentSelectedFilter()
            );

      if (response?.success) {
        onAdd(true);
      } else {
        toast.error(response?.data?.message || t("ERROR"));
      }
    } catch (error) {
      toast.error(t("ERROR"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLabelListFromDexieandSave = async () =>{
    const labels = await getAllLabelsFromDexie();
    //Add reserved Labels.
    //labels=[...labels, {name :"mmdl-myday"}]
    setLabelListFromDexie(labels)
  }

  const filterbyStartClicked = (e) =>{
    setFilterbyStart(e.target.checked)
    if(!e.target.checkd){
      setStartAfter("")
      setStartBefore("")
    }
  }
  const filterbyDueChanged = (e) =>{
    setFilterbyDueChecked(e.target.checked)
    if(!e.target.checked){
      setDueDateBefore("")
      setDueDateFrom('')

    }
  }
  const dueDateRelativeDirectionChanged  = (e)=>{
    setDueDateRelativeDirection(e.target.value)
  }
  const startRelativeDirectionChanged  = (e)=>{
    setStartRelativeDirection(e.target.value)
  }
   const filterbyDueRelativeChanged = (e) =>{
    setFilterbyDueRelativeChecked(e.target.checked)
    if(!e.target.checked){
    setDueDateRelativeDirection("DUE_BEFORE")
    setDueDateRelativeValue(24)
    setDueDateRelativeUnit("HOURS" as const)
    }
  }
  const filterbyStartRelativeChanged = (e) =>{
    setFilterbyStartRelative(e.target.checked)
    if(!e.target.checked){
    setStartRelativeDirection("TASK_STARTS_BEFORE")
    setStartRelativeValue(24)
    setStartRelativeUnit("HOURS" as const)
    }
  }

  const getFilterOutput = () =>{

    return filterToWords(getCurrentSelectedFilter() as TaskFilter, fullDateFormatFromAtom,t)
  }
  const dueDateRelativeValueChanged = (e)=>{
    const value = parseFloat(e.target.value)
    if(!isNaN(value)){
      setDueDateRelativeValue(value)
    }
  }
  const startRelativeValueChanged = (e)=>{
    const value = parseFloat(e.target.value)
    if(!isNaN(value)){
      setStartRelativeValue(value)
    }
  }
  const dueDateRelativeUnitChanged = (e) =>{
    setDueDateRelativeUnit(e.target.value)
  }
  const startRelativeUnitChanged = (e) =>{
    setStartRelativeUnit(e.target.value)
  }

  const filterbyLabelChanged = (e) =>{
    setFilterbyLabelChecked(e.target.checked)
    if(!e.target.checked){
      setSelectedLables([])
    }
  }

  const labelLogicChanged = (e) =>{
    setLabelLogic(e.target.value)
  }

  const addFormClosed = () =>{
    // setFilterName("")
    // setDueDateBefore("")
    // setDueDateFrom("")
    // setFilterbyDueChecked(false)
    // setDueDateRelativeDirection("DUE_BEFORE")
    // setDueDateRelativeUnit("HOURS")
    // setDueDateRelativeValue(24)
    // setFilterbyDueRelativeChecked(false)
    // setStartAfter("")
    // setStartBefore("")
    // setFilterbyStart(false)
    // setPriorityValue("")
    // setSelectedLables([])
    // setFilterbyLabelChecked(false)
    // setFilterLogic("or")
    onClose()
  }
  useEffect(() => {
    let isMounted =true
    if(isMounted){

      getLabelListFromDexieandSave()
    }
    return ()=>{
      isMounted=false
  }
  }, []);
  useEffect(()=>{
    let isMounted =true
    if(isMounted){
      // console.log("i AM being called")

    processIncomingProps();
    }
    return ()=>{
      isMounted=false
  }
  },[filterNameInput,filterInput, filterid, mode])
  const filterResultinWords = getFilterOutput()
  return (
    <div style={{ border: `1px solid ${SECONDARY_COLOUR}`, padding: 20 }}>
      <Form>
        <Form.Label>
          {t("FILTER_NAME")}
        </Form.Label>
        <Form.Control
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          isInvalid={filternameInvalid}
          maxLength={30}
          required
          placeholder={t("ENTER_FILTER_NAME")}
        />
        <br />
        <Form.Label>
          {t("FILTER_LOGIC")}
        </Form.Label>

        <Form.Select
          value={filterLogic}
          onChange={(e) => setFilterLogic(e.target.value as logicType)}
        >
          <option value="and">{t("AND")}</option>
          <option value="or">{t("OR")}</option>
        </Form.Select>
        <br />
        <Form.Check
          checked={filterbyDueChecked}
          type="switch"
          label={t("FILTER_BY_DUE")}
          onChange={(e) => filterbyDueChanged(e)}
        />
        <br />
        {filterbyDueChecked && (
          <>
            {t("DUE_FROM")}
            <Datepicker
              value={dueDateFrom}
              onChangeHook={(date) => setDueDateFrom(moment(date).toISOString())}
              />
            <br />
            {t("DUE_BEFORE")}
            <Datepicker
              value={dueDateBefore}
              onChangeHook={(date) => setDueDateBefore(moment(date).toISOString())}
            />
            <br />
          </>
        )}
        <Form.Check
          checked={filterbyDueRelativeChecked}
          type="switch"
          label={t("FILTER_BY_DUE_RELATIVE")}
          onChange={(e) => filterbyDueRelativeChanged(e)}
        />
        <br />
        {filterbyDueRelativeChecked &&(
          <>
             <Stack style={{marginBottom:20}} direction="horizontal" gap={3}>
                    <Form.Select value={dueDateRelativeDirection} onChange={dueDateRelativeDirectionChanged} key="direction_due_relative">
                      <option value="DUE_BEFORE">{t("DUE_BEFORE")}</option>
                      <option value="DUE_AFTER">{t("DUE_AFTER")}</option>
                    </Form.Select>
                    <Form.Control onChange={dueDateRelativeValueChanged} value={dueDateRelativeValue} type="number" />
                    <Form.Select value={dueDateRelativeUnit} onChange={dueDateRelativeUnitChanged} key="valueName_due_relative" >
                      <option>{t("HOURS")}</option>
                      <option>{t("DAYS")}</option>
                    </Form.Select>

             </Stack>
          </>
        )}
        <Form.Check
          checked={filterbyLabelChecked}
          type="switch"
          label={t("FILTER_BY_LABEL")}
          onChange={(e) => filterbyLabelChanged(e)}
        />
        <br />
        {filterbyLabelChecked && (
            <>
            <Form.Select value={labelLogic} onChange={labelLogicChanged}>
                <option value="OR">{t("OR")}</option>
                <option value="AND">{t("AND")}</option>
            </Form.Select>
            <br />
            {generateLabelCheckList()}
            <br />
            </>
        )}
        <Form.Check
            checked={filterbyPriority}
            type="switch"
            label={t("FILTER_BY_MIN_PRIORITY")}
            onChange={filterbyPriorityCheckboxChanged}
        />
        <br />
        {filterbyPriority &&
        (
            <>
            <Form.Select value={priorityValue} onChange={priorityMinimumSelected}>
                <option value="0"></option>
                <optgroup key={t("HIGH")} label="High">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </optgroup>
                <optgroup key={t("MEDIUM")} label="Medium">
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                </optgroup>
                <optgroup key={t("LOW")} label="Low">
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                </optgroup>
            </Form.Select>

            <br />
        </>
        )}
          <Form.Check
        checked={filterbyStart}
        type="switch"
        label={t("FILTER_BY_START")}
        onChange={filterbyStartClicked}
        />
        {filterbyStart && (
          <div style={{marginTop:20}}>
            {t("START_AFTER")}
            <Datepicker
              value={startAfter}
              onChangeHook={(date) => setStartAfter(moment(date).toISOString())}
              />
            <br />
            {t("START_BEFORE")}
            <Datepicker
              value={startBefore}
              onChangeHook={(date) => setStartBefore(moment(date).toISOString())}
            />
            <br />
          </div>
        )}
        <br />
        <Form.Check
          checked={filterbyStartRelative}
          type="switch"
          label={t("FILTER_BY_START_RELATIVE")}
          onChange={(e) => filterbyStartRelativeChanged(e)}
        />
        <br />
        {filterbyStartRelative &&(
          <>
             <Stack style={{marginBottom:20}} direction="horizontal" gap={3}>
                    <Form.Select value={startRelativeDirection} onChange={startRelativeDirectionChanged} key="direction_start_relative">
                      <option value="TASK_STARTS_BEFORE">{t("TASK_STARTS_BEFORE")}</option>
                      <option value="TASK_STARTS_AFTER">{t("TASK_STARTS_AFTER")}</option>
                    </Form.Select>
                    <Form.Control onChange={startRelativeValueChanged} value={startRelativeValue} type="number" />
                    <Form.Select value={startRelativeUnit} onChange={startRelativeUnitChanged} key="valueName_start_relative" >
                      <option>{t("HOURS")}</option>
                      <option>{t("DAYS")}</option>
                    </Form.Select>

             </Stack>
          </>
        )}

        <br />

        <Alert variant="info"><b>{t("FILTER_RESULT")}</b> {t("FILTER_RESULT_DESC")} <br /> <br /> {filterResultinWords}</Alert>

        <Button variant="secondary" onClick={addFormClosed}>{t("CLOSE")}</Button> &nbsp; &nbsp;
        <Button onClick={handleSubmitFilter}>{t("SAVE")}</Button> 

      </Form>
    </div>
  );
};
