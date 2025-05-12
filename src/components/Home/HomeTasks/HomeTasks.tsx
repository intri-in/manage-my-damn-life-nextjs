import React, { FC, ReactElement, useEffect, useState } from 'react';
import TaskList from "../../tasks/TaskList";
import { getTodaysDateUnixTimeStamp, varNotEmpty } from "@/helpers/general";
import { MYDAY_LABEL } from "@/config/constants";
import Form from 'react-bootstrap/Form';
import { refreshMenuOptionsFromServer } from "./HomeTasksFunctions";
import { isValidFilter } from "@/helpers/frontend/filters";
import * as _ from 'lodash'
import { getValueFromLocalStorage, storeValuetoLocalStorage } from "@/helpers/frontend/localstorage";
import { useTranslation } from "next-i18next";

export const STORAGE_KEY_MENU_OPTION_SELECTED= "STORAGE_KEY_MENU_OPTION_SELECTED"

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
    const [title, setTitle] = useState("MY_DAY")
    const [caldav_accounts_id, setCaldavAccountsId] = useState(props.caldav_accounts_id)
    const [calendars_id, setCalendarsId] = useState(props.calendars_id)
    const [filter, setFilter] = useState<filterInterface | undefined | null>(defaultFilter)
    const [menuOptions, setMenuOptions]=useState<any | null>(defaultMenuOptions)
    const [selectedValue, setSelectedValue] = useState("MY_DAY")
    const [menuOptionsSelect,setMenu] = useState<JSX.Element | null>(null)
    const { t } = useTranslation()
    const fetchEvents =  () =>{
        var updated = Math.floor(Date.now() / 1000).toString()
        setUpdated(updated)
        props.fetchEvents()
    }
    useEffect( () => {
        let isMounted = true
        const refreshMenuOptions = async () =>{
            const newMenuOptions = await refreshMenuOptionsFromServer(menuOptions,t)
            //console.log(menuOptions, newMenuOptions)
            if(_.isEqual(menuOptions, newMenuOptions) ==false){
                setMenuOptions(newMenuOptions)

            }
        }
        if(isMounted){
            refreshMenuOptions().then(()=>{
                // const selectedVal = getValueFromLocalStorage(STORAGE_KEY_MENU_OPTION_SELECTED)
                // if(selectedVal){
                //     setSelectedValue(selectedVal)
                // }
            })

        }

        return () =>{
            isMounted = false
        }
      }, [updated, menuOptions])

      useEffect(()=> {
        setUpdated(props.updated)
      },[props.updated])

      useEffect(()=>{
        let isMounted = true

        if(isMounted){
            const value = selectedValue
            var filterValue = {logic: "or", filter:{}}
            if(varNotEmpty(value) &&typeof(value=="string"))
            {
                var valueArray = value.split(',')
                if(Array.isArray(valueArray) && valueArray.length>1)
                {
                    var newTitle=valueArray[0]+" > "+t(valueArray[1])
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
                                    if(("caldav_accounts_id" in filterValue) && ("calendars_id" in filterValue) && filterValue.calendars_id)
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
                    setTitle(t(value))
                    setFilter(filterValue)
                    setCaldavAccountsId(null)
                    setCalendarsId(null)
    
                }
            }
    
        }

        return ()=>{
            isMounted = false
        }

      },[selectedValue, menuOptions])
      
    const menuOptionSelected = (e: { target: { value: any; }; }) =>{
        var value = e.target.value
        console.log("value", value)
        setSelectedValue(value)
        storeValuetoLocalStorage(STORAGE_KEY_MENU_OPTION_SELECTED, value)    

    }

    useEffect(()=>{

        let isMounted = true

        if(isMounted){
            let allMenuOptions:any[] = []
            for(const key in menuOptions)
            {
                if(varNotEmpty(menuOptions[key]))
                {
                    if(Array.isArray(menuOptions[key]))
                    {
                        //It is an array, and therefore has children
                        var tempChildren:any[] = []
                        for(const children in menuOptions[key] )
                        {
                            for(const internalKey in menuOptions[key][children])
                            {
                                tempChildren.push(<option id={"menu_view_"+key+"_"+children+"_"+internalKey} value={[key, internalKey]}>{t(internalKey)}</option>)
        
                            }
                        }
        
                        allMenuOptions.push(<optgroup key={"OPTGROUP_"+key} label={key}>{tempChildren}</optgroup>)
                    }else{
                        allMenuOptions.push(<option id={"menu_view_"+key} value={key}>{t(key)}</option>)
            
                    }
                }
            }
        
            const temp_menu =(  
                <Form.Select value={selectedValue}  onChange={menuOptionSelected} size="sm">
                        {allMenuOptions}
                    </Form.Select>
        
                    )
    
            setMenu(temp_menu)
    
        }
        return ()=>{
            isMounted = false
        }
    },[menuOptions, selectedValue])
    
    return(
        <div  style={{marginTop: 20}}>

        {menuOptionsSelect}
        <br />
        </div>
    )
}
export default HomeTasks;