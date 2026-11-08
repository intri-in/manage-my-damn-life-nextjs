import { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row, Stack } from "react-bootstrap";
import Datetime from "react-datetime";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import moment from "moment";
import * as _ from "lodash";
import { Frequency, RRule, RRuleSet, rrulestr, Weekday, WeekdayStr } from 'rrule'
import { RRuleTypefromExternalLibrary } from "types/recurrence";
import { currentDateFormatAtom, currentSimpleDateFormatAtom, currentSimpleTimeFormatAtom } from "stateStore/SettingsStore";
import { useAtomValue } from "jotai";

const weekdays = [RRule.MO.weekday, RRule.TU.weekday, RRule.WE.weekday, RRule.TH.weekday, RRule.FR.weekday ]

const recurrenceFromValue =  (value: string, oldRecurrence: RRule | null | undefined): RRule | null | undefined =>{

  switch(value){
    case "daily":
      return new RRule({
        freq: RRule.DAILY,
        interval:1,
        until: (oldRecurrence && oldRecurrence.options.until) ?? undefined 
        // dtstart:new Date(start)
      })
    case "weekly":
      return new RRule({
        interval:1,
        freq: RRule.WEEKLY,
        until: (oldRecurrence && oldRecurrence.options.until) ?? undefined,
        byweekday:[]

        // dtstart:new Date(start),
      })
    case "workingday":
      return new RRule({
        freq: RRule.WEEKLY,
        interval:1,
        byweekday:weekdays,
        until: (oldRecurrence && oldRecurrence.options.until) ?? undefined 

      })
    case "somedays":
      const dayToDay =  new Date().getDay()
      return new RRule({
        byweekday: [dayToDay-1],
        interval:1,
        freq: RRule.WEEKLY,
        until: (oldRecurrence && oldRecurrence.options.until) ?? undefined 

      })
    case "monthly":
      return new RRule({
        freq: RRule.MONTHLY,
        interval:1,
        until: (oldRecurrence && oldRecurrence.options.until) ?? undefined 
        // dtstart:new Date(start)
      })
    
    case "custom":
      return new RRule({
        interval: 2,
        freq: RRule.DAILY,
        until: (oldRecurrence && oldRecurrence.options.until) ?? undefined 
      })
    
    default:
      return  null
  }

}
const valueFromRecurrrence = (recurrence: RRule | null | undefined):string  =>{
  if(!recurrence) return "null"
  if(recurrence.options.freq==RRule.DAILY && recurrence.options.interval==1){
    return "daily"
  }
  // if(recurrence.options.byweekday && Array.isArray(recurrence.options.byweekday)){
  //   return "somedays"
  // }
  if(recurrence.options.freq==RRule.WEEKLY && recurrence.options.interval==1){
    // Check if the byweekday array contains all weekdays, 
    if(recurrence.options.byweekday && recurrence.options.byweekday.length>0 ){
      if(recurrence.options.byweekday.length<5) return "somedays"
      const workingDaysOnly = weekdays.every(val => {
        if(recurrence.options.byweekday) return recurrence.options.byweekday.includes(val)
        return false
      })
      if(workingDaysOnly)return "workingday"
      
      return "somedays"
    }
    return "weekly"

  }
 
  if(recurrence.options.freq==RRule.MONTHLY && recurrence.options.interval==1){
    return "monthly"
  }

  return "custom"
}
export default function RruleForm({ rruleProp, i18next, onRruleSet , start}:{rruleProp: RRule | null | undefined, i18next, onRruleSet: Function, start: string}) {
  /**
   * Jotai
  */
 const dateFormat = useAtomValue(currentSimpleDateFormatAtom)
 const timeFormat = useAtomValue(currentSimpleTimeFormatAtom)
 /**
  * Local State
 */
  const [recurrence, setRecurrence] = useState<RRule | null | undefined>(rruleProp ? rruleProp: null);
  const [showEditForm, setShowEditForm]  = useState(false)
  const [showWeekDayForm, setShowWeekDayForm]  = useState(false)
  const [ddlVal, setDdlValue] = useState("")
  const [daysSelected, setDaysSelected] = useState<number[]>([])
  const [customInterval, setCustomInterval] = useState(0)
  const [customFreq, setCustomFreq] = useState<Frequency>(Frequency.DAILY)
 
  useEffect(() => {
    const valFromRecurr = valueFromRecurrrence(rruleProp)
    // console.log("rruleProp", rruleProp)
    if(valFromRecurr=="custom"){
      if(rruleProp?.options.freq!=null && rruleProp?.options.freq!=undefined ) setCustomFreq(rruleProp?.options.freq)
      if(rruleProp?.options.interval) setCustomInterval(rruleProp?.options.interval)
      setShowEditForm(true)
      setShowWeekDayForm(false)
    }
    if(valFromRecurr!="custom") {
      setShowEditForm(false)

    }
    if(valFromRecurr!="somedays"){
      setShowWeekDayForm(false)
    }else{
      
      if(rruleProp?.options.byweekday) setDaysSelected(rruleProp?.options.byweekday)
      setShowWeekDayForm(true)
    }
    setDdlValue(valFromRecurr)
    setRecurrence(rruleProp);

  }, [rruleProp]);
  const recurrenceIntervalChanged = (e) => {
    const value = e.target.value;
    setCustomInterval(value)
    const newRecurrence = new RRule({freq: customFreq, interval: value, until: recurrence?.options.until})  
    onRruleSet(newRecurrence)

    

  };

  const recurrenceFreqChanged = (e) => {
    const value = e.target.value;
    setCustomFreq(value)
    const newRecurrence = new RRule({freq: value, interval: customInterval, until: recurrence?.options.until})
    onRruleSet(newRecurrence)
    


  };

  const recurrenceUntilChanged = (e) => {
    const value = e._d;
    setRecurrence((prev) => {
      if(prev) {
        const newRrule = new RRule({ ...prev.options, until: value })
        onRruleSet(newRrule)
        return newRrule
      }
      onRruleSet(new RRule({until: value}))

      return new RRule({until: value})
    });
  };


  
  const ddlValueChanged = (e) =>{
    const newRecurrence = recurrenceFromValue(e.target.value, recurrence)
    if(e.target.value=="custom") {
      setCustomFreq((newRecurrence?.options.freq!=null && newRecurrence?.options.freq!=undefined) ? newRecurrence?.options.freq: 0)
      setCustomInterval((newRecurrence?.options.interval) ? newRecurrence?.options.interval: 1)
      setShowEditForm(true)
      setShowWeekDayForm(false)
    }
    else if(e.target.value=="somedays"){
      setShowEditForm(false)
      setShowWeekDayForm(true)
      const dayToDay =  new Date().getDay()
      setDaysSelected([dayToDay])
    } else{
      setShowEditForm(false)
      setShowWeekDayForm(false)
    }
    setRecurrence(newRecurrence)
    // console.log("newRecurrence", newRecurrence)
    setDdlValue(e.target.value)
    onRruleSet(newRecurrence)

  }
  const removeRecurrence = () => {
    setShowEditForm(false)
    setDdlValue("")
    setRecurrence(null)
    //onRruleSet(null);
  };
  const OnDaysSelected = (day: number)=>{
    let newByWeekday: number[] = []
    if(daysSelected.includes(day)){
      newByWeekday = daysSelected.filter(item => item !== day); 
    }else{
      newByWeekday = [...daysSelected, day]
    }
    // console.log("newByWeekday", newByWeekday)
    setDaysSelected(newByWeekday)
    let newRRule = new RRule({freq:RRule.WEEKLY, byweekday: newByWeekday})
    setRecurrence(newRRule);
    onRruleSet(newRRule)

  }
  const toWords = (recurrence) ?  `${i18next("TASK_WILL_REPEAT_LABEL")} ${recurrence.toText()}` : ""
  
  return (
    <div style={{ border: "1px solid gray", padding: 10 }}>
      <h3>{i18next("RECURRENCE")}</h3>
        {toWords ? (<Row key="KEY_TOWORDS_RECURRENCE" style={{ marginBottom: 20 }}>
          <Col>{toWords}</Col>
          <Col style={{ textAlign: "right", color: "red" }}>
            <AiOutlineDelete onClick={removeRecurrence} />
          </Col>
        </Row>) : ""
        }
        <Row>
          <Col>
              <Form.Select
                value={ddlVal}
                size="sm"
                onChange={ddlValueChanged}
              >
                <option value={"null"}>{`${i18next("TASK_WONT_REPEAT")}`}</option>
                <option value={"daily"}>{`${i18next("EVERY")} ${i18next("DAY").toLowerCase()}`}</option>
                <option value={"weekly"}>{`${i18next("EVERY")} ${i18next("WEEK").toLowerCase()}`}</option>
                <option value={"workingday"}>{`${i18next("EVERY")} ${i18next("WORKING_DAY").toLowerCase()}`}</option>
                <option value={"somedays"}>{`${i18next("SOME_DAYS")}`}</option>
                <option value={"monthly"}>{`${i18next("EVERY")} ${i18next("MONTH").toLowerCase()}`}</option>
                <option value={"custom"}>{i18next("CUSTOM")}</option>
              </Form.Select>

          </Col>
        </Row>
      {showEditForm ? (
        
        <div style={{marginTop:10}} key="KEY_RECURRENCEFORM_TASKEDITOR">
          <Row>
            <Col>{i18next("EVERY-RECURRENCE")}</Col>
            <Col>
              <Form.Control
                value={customInterval}
                onChange={recurrenceIntervalChanged}
                size="sm"
                type="number"
                min={1}
                style={{ width: 100 }}
              />
            </Col>
            <Col>
              <Form.Select
                value={customFreq}
                onChange={recurrenceFreqChanged}
                size="sm"
              >
                <option value={RRule.DAILY}>{i18next("DAYS")}</option>
                <option value={RRule.WEEKLY}>{i18next("WEEKS")}</option>
                <option value={RRule.MONTHLY}>{i18next("MONTHS")}</option>
                <option value={RRule.YEARLY}>{i18next("YEARS")}</option>
              </Form.Select>
            </Col>
          </Row>
        </div>
      ):<></>}

      {
      showWeekDayForm ? (<Form id="daysSelection" style={{marginTop: 10}}>
          <Row >
            <Col>
              <Form.Check 
                checked={daysSelected.includes(RRule.MO.weekday)}
                onChange={()=>OnDaysSelected(RRule.MO.weekday)}
                type="checkbox" 
                label={`${i18next("MONDAY")}`}
                  />
            </Col>
            <Col>
              <Form.Check 
                checked={daysSelected.includes(RRule.TU.weekday)}
                onChange={()=>OnDaysSelected(RRule.TU.weekday)}
                type="checkbox" 
                label={`${i18next("TUESDAY")}`}
              />
            </Col>
            <Col>
              <Form.Check 
                checked={daysSelected.includes(RRule.WE.weekday)}
                onChange={()=>OnDaysSelected(RRule.WE.weekday)}
                type="checkbox" 
                label={`${i18next("WEDNESDAY")}`}
                  />
            </Col>
            <Col>
              <Form.Check 
                checked={daysSelected.includes(RRule.TH.weekday)}
                onChange={()=>OnDaysSelected(RRule.TH.weekday)}
                type="checkbox" 
                label={`${i18next("THURSDAY")}`}
                  />
            </Col>
            <Col>
              <Form.Check 
                checked={daysSelected.includes(RRule.FR.weekday)}
                onChange={()=>OnDaysSelected(RRule.FR.weekday)}

                type="checkbox" 
                label={`${i18next("FRIDAY")}`}
                  />
            </Col>
            <Col>
              <Form.Check 
                checked={daysSelected.includes(RRule.SA.weekday)}
                onChange={()=>OnDaysSelected(RRule.SA.weekday)}

                type="checkbox" 
                label={`${i18next("SATURDAY")}`}
                  />
            </Col>
            <Col>
              <Form.Check 
                checked={daysSelected.includes(RRule.SU.weekday)}
                onChange={()=>OnDaysSelected(RRule.SU.weekday)}
                type="checkbox" 
                label={`${i18next("SUNDAY")}`}
                  />
            </Col>
          </Row>
          </Form>
          
          )
      :
      (<></>)}
      {
        (recurrence || (ddlVal=="custom")) ? 
        (
          <div style={{marginTop: 10}}>
          <p>{i18next("UNTIL") + ":"}</p>
          <Datetime
            value={recurrence?.options.until ? moment(recurrence?.options.until) :  ""}
            onChange={recurrenceUntilChanged}
            dateFormat={dateFormat ?? "DD/MM/YYYY"}
            timeFormat={timeFormat}
            />
          </div>
        ):
(        <></>
)
      }
          

    </div>
  );
}