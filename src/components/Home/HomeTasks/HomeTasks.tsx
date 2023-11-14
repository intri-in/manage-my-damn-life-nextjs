import { getI18nObject } from "@/helpers/frontend/general";
import React, { FC, ReactElement, useEffect, useState } from 'react';
import TaskList from "../../tasks/TaskList";
import { getTodaysDateUnixTimeStamp, varNotEmpty } from "@/helpers/general";
import { MYDAY_LABEL } from "@/config/constants";
import Form from 'react-bootstrap/Form';
import { refreshMenuOptionsFromServer } from "./HomeTasksFunctions";
import { isValidFilter } from "@/helpers/frontend/filters";
import * as _ from 'lodash'
interface homeTasksPropsInterface {

    router: object
    scheduleItem: Function 
    caldav_accounts_id: string | null | undefined | unknown
    calendars_id: string| null | undefined| unknown
    fetchEvents: Function
    view : string | null
    updated: string | null

}
export interface filterInterface {
    logic: string;
    filter: {};
  }
const defaultFilter = 
{logic: "or", filter: {due:[0, getTodaysDateUnixTimeStamp()], label: [MYDAY_LABEL]}}

const i18next= getI18nObject()

const defaultMenuOptions = {
    "MY_DAY":{logic: "or", filter: {due:[0, getTodaysDateUnixTimeStamp()], label: [MYDAY_LABEL]}},
    "DUE_TODAY":{ logic: "or", filter: { due: [0, getTodaysDateUnixTimeStamp()] } },
    "DUE_NEXT_SEVEN_DAYS": {logic: "or", filter: { due: [0, getTodaysDateUnixTimeStamp() + 604800] } },
    "HIGH_PROIRITY": { logic: "or",filter: { priority: 4 }},
    "ALL_TASKS": {logic: "or", filter: {}},    

} 
function HomeTasks(props:homeTasksPropsInterface) {
    const [taskView, setTaskView ] = useState(props.view)
    const [updated, setUpdated]  =  useState(props.updated)
    const [title, setTitle] = useState(i18next.t("MY_DAY"))
    const [caldav_accounts_id, setCaldavAccountsId] = useState(props.caldav_accounts_id)
    const [calendars_id, setCalendarsId] = useState(props.calendars_id)
    const [filter, setFilter] = useState<filterInterface | undefined>(defaultFilter)
    const [menuOptions, setMenuOptions]=useState<any | null>(defaultMenuOptions)
    
    const fetchEvents =  () =>{
        var updated = Math.floor(Date.now() / 1000).toString()
        setUpdated(updated)
        props.fetchEvents()
    }
    useEffect( () => {
        const refreshMenuOptions = async () =>{
            const newMenuOptions = await refreshMenuOptionsFromServer(menuOptions)
            //console.log(menuOptions, newMenuOptions)
            if(_.isEqual(menuOptions, newMenuOptions) ==false){
                setMenuOptions(newMenuOptions)

            }
        }
        refreshMenuOptions()
      }, [updated, menuOptions])

      useEffect(()=> {
        setUpdated(props.updated)
      },[props.updated])
      
    const menuOptionSelected = (e: { target: { value: any; }; }) =>{
        var value = e.target.value
        console.log("value", value)
        var filterValue = {logic: "or", filter:{}}
        if(varNotEmpty(value) &&typeof(value=="string"))
        {
            var valueArray = value.split(',')
            console.log("valueArray", valueArray)
            if(Array.isArray(valueArray) && valueArray.length>1)
            {
                var newTitle=valueArray[0]+" > "+i18next.t(valueArray[1])
                setTitle(newTitle)

                if(varNotEmpty(menuOptions[valueArray[0]]) && Array.isArray(menuOptions[valueArray[0]]) && menuOptions[valueArray[0]].length>0)
                {
                    for(const k in menuOptions[valueArray[0]])
                    {
                        if(valueArray[1] in menuOptions[valueArray[0]][k])
                        {

                            filterValue= menuOptions[valueArray[0]][k][valueArray[1]]
                            if(isValidFilter(filterValue))
                            {
                                setFilter(filterValue)
                                setCaldavAccountsId(null)
                                setCalendarsId(null)
    
                            }else{
                                //Probably a calendar Object.
                                setFilter(null)
                                if(("caldav_accounts_id" in filterValue) && ("calendars_id" in filterValue))
                                {
                                    setCaldavAccountsId(filterValue["caldav_accounts_id"])
                                    setCalendarsId(filterValue["calendars_id"].toString())
                                }
                            }

                            continue;
                        }
                    }

                }

                
            }else{
                filterValue= menuOptions[value]
                setTitle(i18next.t(value))
                setFilter(filterValue)
                setCaldavAccountsId(null)
                setCalendarsId(null)

            }
        }

    }
    var allMenuOptions = []
    for(const key in menuOptions)
    {
        if(varNotEmpty(menuOptions[key]))
        {
            if(Array.isArray(menuOptions[key]))
            {
                //It is an array, and therefore has children
                var tempChildren = []
                for(const children in menuOptions[key] )
                {
                    for(const internalKey in menuOptions[key][children])
                    {
                        tempChildren.push(<option id={"menu_view_"+key+"_"+children+"_"+internalKey} value={[key, internalKey]}>{i18next.t(internalKey)}</option>)

                    }
                }

                allMenuOptions.push(<optgroup key={"OPTGROUP_"+key} label={key}>{tempChildren}</optgroup>)
            }else{
                allMenuOptions.push(<option id={"menu_view_"+key} value={key}>{i18next.t(key)}</option>)
    
            }
        }
    }

    
    var menuOptionsSelect =(  
    <Form.Select onChange={menuOptionSelected} size="sm">
            {allMenuOptions}
        </Form.Select>)

    return(

    <div style={{marginTop: 20}}>
        {menuOptionsSelect}
        <br />
        <TaskList scheduleItem={props.scheduleItem} view={taskView} fetchEvents={fetchEvents} updated={updated} router={props.router} title={title} filter={filter} caldav_accounts_id={caldav_accounts_id} calendars_id={calendars_id} />

    </div>
    )
}
export default HomeTasks;