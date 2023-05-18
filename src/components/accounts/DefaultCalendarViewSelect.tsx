import SettingsHelper from '@/helpers/frontend/classes/SettingsHelper';
import { setCookie } from '@/helpers/frontend/cookies';
import { getI18nObject } from '@/helpers/frontend/general';
import { getDefaultViewForCalendar } from '@/helpers/frontend/settings';
import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { FULLCALENDAR_VIEWLIST } from '../fullcalendar/FullCalendarHelper';

const defaultOptions = FULLCALENDAR_VIEWLIST

const i18next = getI18nObject()
function DefaultCalendarViewSelect(props:null) {
    const [valueofDDL, setValueofDDL] = useState("")

    useEffect(()=>{
        const getVal = async () =>{
            const settingVal = await getDefaultViewForCalendar()

            setValueofDDL(settingVal)

        }

        getVal()
    },[])

    const  newDefaultViewSelected = async (e) =>{
        const value: string = e.target.value
        if(value!=""){
            setValueofDDL(value)
            //Make request to Server.
            if(await SettingsHelper.setKey("DEFAULT_VIEW_CALENDAR", value)==true)
            {
                //Save to cookie if the insert was successful.
                setCookie("DEFAULT_VIEW_CALENDAR", value)
            }
    
        }
    }
    var finalOptions: Object[] = []
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