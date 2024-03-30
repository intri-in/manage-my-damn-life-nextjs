import SettingsHelper from '@/helpers/frontend/classes/SettingsHelper';
import { setCookie } from '@/helpers/frontend/cookies';
import { getI18nObject } from '@/helpers/frontend/general';
import { SETTING_NAME_DEFAULT_VIEW_CALENDAR, getDefaultViewForCalendar, setDefaultViewForCalendar } from '@/helpers/frontend/settings';
import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { FULLCALENDAR_VIEWLIST, isValidFullCalendarView } from '../fullcalendar/FullCalendarHelper';

const defaultOptions = FULLCALENDAR_VIEWLIST

const i18next = getI18nObject()
function DefaultCalendarViewSelect(props:null) {
    const [valueofDDL, setValueofDDL] = useState("")
    useEffect(()=>{
        const getVal = async () =>{
            const settingVal = getDefaultViewForCalendar()
            if(settingVal && isValidFullCalendarView(settingVal)){
                setValueofDDL(settingVal)
            }else{
                // We fetch from server.
                const fromServer = await SettingsHelper.getFromServer(SETTING_NAME_DEFAULT_VIEW_CALENDAR) 
                if(isValidFullCalendarView(fromServer)){
                    setValueofDDL(fromServer)
                    setDefaultViewForCalendar(fromServer)
                }
            }

        }

        getVal()
    },[])

    const  newDefaultViewSelected = async (e) =>{
        const value: string = e.target.value
        if(value){
            setValueofDDL(value)
            //Make request to Server.
            if(await SettingsHelper.setKey("DEFAULT_VIEW_CALENDAR", value)==true)
            {
                //Save to cookie if the insert was successful.
                //setCookie("DEFAULT_VIEW_CALENDAR", value)
                setDefaultViewForCalendar(value)
            }
    
        }
    }
    let finalOptions: JSX.Element[] = []
    for(const i in defaultOptions)
    {
       finalOptions.push(<option key={defaultOptions[i].name} value={defaultOptions[i].name}>{i18next.t(defaultOptions[i].saneName)}</option>)
    }
    return(
      <Form.Select value={valueofDDL} onChange={newDefaultViewSelected}>
        <option key="empty_option" value=""></option>
        {finalOptions}
      </Form.Select>
    )
}
export default DefaultCalendarViewSelect