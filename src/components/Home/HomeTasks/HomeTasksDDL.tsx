import { MYDAY_LABEL } from "@/config/constants"
import { getTodaysDateUnixTimeStamp, varNotEmpty } from "@/helpers/general"
import { PAGE_VIEW_JSON } from "@/helpers/viewHelpers/pages"
import { useEffect, useState } from "react"
import { refreshMenuOptionsFromServer } from "./HomeTasksFunctions"
import * as _ from 'lodash'
import { isValidFilter } from "@/helpers/frontend/filters"
import { Form } from "react-bootstrap"
import { calDavObjectAtom, currentPageTitleAtom, filterAtom } from "stateStore/ViewStore"
import { useSetAtom } from "jotai"
import { TaskFilter } from "types/tasks/filters"
import { useTranslation } from "next-i18next"
const defaultMenuOptions = PAGE_VIEW_JSON
interface FilterValueType extends TaskFilter{
    caldav_accounts_id?:string|number,
    calendars_id?:string|number
}
export const HomeTasksDDL = () => {
    /**
     * Jotai
     */
    const setCurrentPageTitle= useSetAtom(currentPageTitleAtom)
    const setFilterAtom = useSetAtom(filterAtom)
    const setCalDavAtom = useSetAtom(calDavObjectAtom)

    const [menuOptionsSelect, setMenu] = useState<JSX.Element>(<></>)
    const [menuOptions, setMenuOptions] = useState<any | null>(defaultMenuOptions)
    const [selectedValue, setSelectedValue] = useState("MY_DAY")
    const { t } = useTranslation()
    useEffect(() => {
        let isMounted = true
        const refreshMenuOptions = async () => {
            const newMenuOptions = await refreshMenuOptionsFromServer(menuOptions,t)
            if (_.isEqual(menuOptions, newMenuOptions) == false) {
                setMenuOptions(newMenuOptions)

            }
        }
        if (isMounted) {
            refreshMenuOptions()

        }

        return () => {
            isMounted = false
        }
    }, [menuOptions])

    useEffect(() => {
        let isMounted = true

        if (isMounted) {
            const value = selectedValue
            console.log(value)
            let filterValue: FilterValueType = { logic: "or", filter: {} }
            if (varNotEmpty(value) && typeof (value == "string")) {
                var valueArray = value.split(',')
                if (Array.isArray(valueArray) && valueArray.length > 1) {

                    if (varNotEmpty(menuOptions[valueArray[0]]) && Array.isArray(menuOptions[valueArray[0]]) && menuOptions[valueArray[0]].length > 0) {
                        for (const k in menuOptions[valueArray[0]]) {
                            if (valueArray[1] in menuOptions[valueArray[0]][k]) {

                                filterValue = menuOptions[valueArray[0]][k][valueArray[1]]
                                if (isValidFilter(filterValue)) {
                                    // setFilter(filterValue)
                                    // setCaldavAccountsId(null)
                                    // setCalendarsId(null) 
                                    console.log(filterValue)
                                    setFilterAtom(filterValue)
                                    setCurrentPageTitle(valueArray[0] + " >> " + t(valueArray[1]))
                                    setCalDavAtom({caldav_accounts_id: null, calendars_id: null})

                                } else {
                                    //Probably a calendar Object.
                                    // setFilter(null)
                                    if (("caldav_accounts_id" in filterValue) && ("calendars_id" in filterValue) && filterValue.calendars_id) {
                                        if(filterValue["caldav_accounts_id"] && filterValue["calendars_id"].toString()){

                                            setCurrentPageTitle("")
                                            setFilterAtom({})
                                    
                                            setCalDavAtom({caldav_accounts_id: parseInt(filterValue.caldav_accounts_id.toString()), calendars_id: parseInt(filterValue.calendars_id.toString())})
                                        }

                                        // setCaldavAccountsId(filterValue["caldav_accounts_id"])
                                        // setCalendarsId(filterValue["calendars_id"].toString())
                                    }
                                }

                                continue;
                            }
                        }

                    }


                } else {
                    filterValue = menuOptions[value]
                    setFilterAtom(filterValue)
                    setCurrentPageTitle(t(value).toString())
                    setCalDavAtom({caldav_accounts_id: null, calendars_id: null})

                    // setTitle(t(value))
                    // setFilter(filterValue)
                    // setCaldavAccountsId(null)
                    // setCalendarsId(null)

                }
            }

        }

        return () => {
            isMounted = false
        }

    }, [selectedValue, menuOptions])

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
                                tempChildren.push(<option key={"menu_view_"+key+"_"+children+"_"+internalKey} id={"menu_view_"+key+"_"+children+"_"+internalKey} value={[key, internalKey]}>{t(internalKey)}</option>)
        
                            }
                        }
        
                        allMenuOptions.push(<optgroup key={"OPTGROUP_"+key} label={key}>{tempChildren}</optgroup>)
                    }else{
                        allMenuOptions.push(<option key={"menu_view_"+key} id={"menu_view_"+key} value={key}>{t(key)}</option>)
            
                    }
                }
            }
        
            const temp_menu =(  
                <Form.Select key="home_view_selector" value={selectedValue}  onChange={menuOptionSelected} size="sm">
                        {allMenuOptions}
                    </Form.Select>
        
                    )
    
            setMenu(temp_menu)
    
        }
        return ()=>{
            isMounted = false
        }
    },[menuOptions, selectedValue])

    const menuOptionSelected = (e) =>{
        var value = e.target.value
        setSelectedValue(value)

    }
    return (
        <div style={{marginTop: 20}}>
            {menuOptionsSelect}
        </div>
    )
}