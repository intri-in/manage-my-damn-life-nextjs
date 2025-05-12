import SettingsHelper from '@/helpers/frontend/classes/SettingsHelper';
import { SETTING_NAME_DEFAULT_VIEW_CALENDAR, getDefaultViewForCalendar, setDefaultViewForCalendar } from '@/helpers/frontend/settings';
import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { FULLCALENDAR_VIEWLIST, isValidFullCalendarView } from '../fullcalendar/FullCalendarHelper';
import { useTranslation } from 'next-i18next';

const defaultOptions = FULLCALENDAR_VIEWLIST

function DefaultCalendarViewSelect(props:null) {
    const [valueofDDL, setValueofDDL] = useState("")
    const{t} = useTranslation()
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
       finalOptions.push(<option key={defaultOptions[i].name} value={defaultOptions[i].name}>{t(defaultOptions[i].saneName)}</option>)
    }
    return(
      <Form.Select value={valueofDDL} onChange={newDefaultViewSelected}>
        <option key="empty_option" value=""></option>
        {finalOptions}
      </Form.Select>
    )
}
export default DefaultCalendarViewSelect