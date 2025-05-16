import React, { useState, useEffect } from "react";
import { SECONDARY_COLOUR } from "@/config/style";
import { useRouter } from "next/router";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import { Loading } from "@/components/common/Loading";
import { getLabelsFromServer } from "@/helpers/frontend/labels";
import { isValidResultArray, varNotEmpty } from "@/helpers/general";
import { Toastify } from "@/components/Generic";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  checkifFilterValid,
  filterDueIsValid,
  filtertoWords,
  getFilterReadytoPost,
  makeFilterEditRequest,
  saveFiltertoServer,
} from "@/helpers/frontend/filters";
import { isDateValid } from "@/helpers/frontend/general";
import { getAllLabelsFromDexie } from "@/helpers/frontend/dexie/dexie_labels";
import { useTranslation } from "next-i18next";
import { currentDateFormatAtom, currentSimpleDateFormatAtom, currentSimpleTimeFormatAtom } from "stateStore/SettingsStore";
import { Datepicker } from "../common/Datepicker/Datepicker";
import { useAtomValue } from "jotai";
import { Labels } from "@/helpers/frontend/dexie/dexieDB";

export const AddFilter = ({onClose, onAdd, filterNameInput,filterInput, filterid, mode}:{onClose: Function, onAdd: Function, filterNameInput?: string,filterInput?: any, filterid?: string , mode?:string}) =>{
  const {t} = useTranslation();
  const fullDateFormatFromAtom = useAtomValue(currentDateFormatAtom)

  const [filterName, setFilterName] = useState("");
  const [filterResult, setFilterResult] = useState([]);
  const [filterbyDueChecked, setFilterbyDueChecked] = useState(false);
  const [dueDateFrom, setDueDateFrom] = useState("");
  const [dueDateBefore, setDueDateBefore] = useState("");
  const [filterLogic, setFilterLogic] = useState("or");
  const [filterbyLabelChecked, setFilterbyLabelChecked] = useState(false);
  const [filterbyPriority, setFilterbyPriority] = useState(false);
  const [priorityValue, setPriorityValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filternameInvalid, setFilternameInvalid] = useState(false);
  const [selectedLables, setSelectedLables] = useState<string[]>([]);
  const [labelListFromDexie, setLabelListFromDexie] = useState<Labels[]>([])
  const [filterbyStartChecked, setFilterbyStartChecked] = useState(false);
  const [filterbyStart, setFilterbyStart] = useState(false)
  const [startAfter, setStartAfter] = useState("")
  const [startBefore, setStartBefore] = useState("")
  const processIncomingProps = () => {
    // console.log(props)
    if (mode === "edit" && filterInput) {

      if(filterNameInput){
        setFilterName(filterNameInput)
      }
      if (filterDueIsValid(filterInput.filter.due)) {
        

        setFilterbyDueChecked(true);
        setDueDateFrom(
          moment(filterInput.filter.due[0]).isValid()
            ? moment(filterInput.filter.due[0]).toISOString()
            : ""
        );
        setDueDateBefore(
            moment(filterInput.filter.due[1]).isValid()
            ? moment(filterInput.filter.due[1]).toISOString()
            : ""
        );
      } 

      if (varNotEmpty(filterInput.filter.label)) {
        // removeDanglingLabelsFromIncomingFilters(filter.filter.label);
        setFilterbyLabelChecked(true);
       if(Array.isArray(filterInput.filter.label) && filterInput.filter.label.length>0){
        setSelectedLables(filterInput.filter.label)
       } 
      }
      if (filterInput.filter.priority) {
        setFilterbyPriority(true);
        setPriorityValue(filterInput.filter.priority);
      }
      
      if("start" in filterInput.filter && filterInput.filter.start){
        if("before" in filterInput.filter.start && filterInput.filter.start.before){
          setStartBefore(filterInput.filter.start.before)
        }

        if("after" in filterInput.filter.start && filterInput.filter.start.after){
          setStartAfter(filterInput.filter.start.after)
        }

        setFilterbyStart(true)
      }
      setFilterLogic(filterInput.logic || "or");
    }

    generateLabelCheckList();
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

  const getCurrentSelectedFilter = () =>{
    let filter= { due: [dueDateFrom, dueDateBefore], label: selectedLables, priority: priorityValue, start:{before:startBefore, after:startAfter} }

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

    if (!checkifFilterValid(getCurrentSelectedFilter())) {
      toast.error(t("INVALID_FILTER_DETAILS"));
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
  const getFilterOutput = () =>{

    return filtertoWords(getCurrentSelectedFilter(), fullDateFormatFromAtom,t)
  }
  const filterbyLabelChanged = (e) =>{
    setFilterbyLabelChecked(e.target.checked)
    if(!e.target.checked){
      setSelectedLables([])
    }
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
          onChange={(e) => setFilterLogic(e.target.value)}
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
          checked={filterbyLabelChecked}
          type="switch"
          label={t("FILTER_BY_LABEL")}
          onChange={(e) => filterbyLabelChanged(e)}
        />
        <br />
        {filterbyLabelChecked && (
            <>
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
            <Form.Select value={priorityValue} onChange={priorityMinimumSelected} aria-label="Default select example">
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

        <Alert variant="info"><b>{t("FILTER_RESULT")}</b> {t("FILTER_RESULT_DESC")} <br /> <br /> {filterResultinWords}</Alert>

        <Button variant="secondary" onClick={()=>onClose()}>{t("CLOSE")}</Button> &nbsp; &nbsp;
        <Button onClick={handleSubmitFilter}>{t("SAVE")}</Button> 

      </Form>
    </div>
  );
};
