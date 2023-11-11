import SettingsHelper from '@/helpers/frontend/classes/SettingsHelper';
import { setCookie } from '@/helpers/frontend/cookies';
import { getI18nObject } from '@/helpers/frontend/general';
import { SETTING_NAME_CALENDAR_START_DAY, getDefaultViewForCalendar } from '@/helpers/frontend/settings';
import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { FULLCALENDAR_VIEWLIST } from '../fullcalendar/FullCalendarHelper';
import { DAY_ARRAY } from '@/helpers/general';
import { Col, Row } from 'react-bootstrap';

const defaultOptions = FULLCALENDAR_VIEWLIST


const i18next = getI18nObject()

function CalendarStartDayWeek(props:null){
    const [valueofDDL, setValueofDDL] = useState("1")
    useEffect(()=>{
        const getVal = async () =>{
            let initValue = localStorage.getItem(SETTING_NAME_CALENDAR_START_DAY)
            if(!initValue){
                initValue="1"
            }        
            setValueofDDL(initValue)

            const settingVal:string = await SettingsHelper.getFromServer(SETTING_NAME_CALENDAR_START_DAY)
            //setCookie(SETTING_NAME_CALENDAR_START_DAY, settingVal)
            localStorage.setItem(SETTING_NAME_CALENDAR_START_DAY, settingVal)
            setValueofDDL(settingVal)

        }

        getVal()
    },[])

    const  newStartDaySelected = async (e) =>{
        const value: string = e.target.value
        console.log("value", value)
        if(value!=""){
            setValueofDDL(value)
            //Make request to Server.
            if(await SettingsHelper.setKey(SETTING_NAME_CALENDAR_START_DAY, value)==true)
            {
                //Save to cookie if the insert was successful.
                // setCookie(SETTING_NAME_CALENDAR_START_DAY, value)
                localStorage.setItem(SETTING_NAME_CALENDAR_START_DAY, value)

            }
    
        }
    }

    var finalOptions: Object[]  = []

    for(const i in DAY_ARRAY)
    {
       finalOptions.push(<option key={DAY_ARRAY[i]} value={i}>{i18next.t(DAY_ARRAY[i])}</option>)
    }

    return(
        <Row style={{display: "flex", alignItems: "center"}}>
        <Col  xs={3}>
            {i18next.t("START_DAY_CALENDAR_WEEK")}
        </Col>
        <Col  xs={9}>
            <Form.Select value={valueofDDL} onChange={newStartDaySelected} >
             {finalOptions}
            </Form.Select>
        </Col>
    </Row>

    )





}

export default CalendarStartDayWeek