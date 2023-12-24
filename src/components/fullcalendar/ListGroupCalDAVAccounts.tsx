import { getI18nObject } from '@/helpers/frontend/general';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Cookies from 'js-cookie'
import { getCalendarsToShow, isValid_UserPreference_CalendarsToShow } from '@/helpers/frontend/userpreference';
import { isValidResultArray, varNotEmpty } from '@/helpers/general';
import { Preference_CalendarsToShow } from '@/helpers/frontend/classes/UserPreferences/Preference_CalendarsToShow';
import { BsCalendarCheck } from 'react-icons/bs';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
interface customProps{
    caldav_accounts:  {name: string, caldav_accounts_id: number, calendars: any }[];
    onChange?: () => void;

}
export function ListGroupCalDAVAccounts(props: customProps ){
    const [modalShow, setModalShow] = useState(false);
    const i18next = getI18nObject()
    const [prefObject, setPrefObject] =useState(getLatestPreferenceObject(props.caldav_accounts))


 
    const onChangeChecked =  (e, indexInPreferenceObject) =>{
      var index = JSON.parse(e.target.id)
      Preference_CalendarsToShow.update(index, e.target.checked)
      setPrefObject(getLatestPreferenceObject(props.caldav_accounts))
      if(props.onChange){
        props.onChange()
      }
    }
    var output : JSX.Element[]=[]
    if(props.caldav_accounts && props.caldav_accounts.length>0 ) 
    {
      for(const i in props.caldav_accounts){
       
        output.push(<h3>{props.caldav_accounts[i].name}</h3>)
        var calendarOutput: JSX.Element[] =[]
        if(varNotEmpty(props.caldav_accounts[i].calendars) && props.caldav_accounts[i].calendars)
        {
          if(!isValidResultArray(props.caldav_accounts[i].calendars)){
            continue
          }
          for(const j in props.caldav_accounts[i].calendars){
            var indexInPreferenceObject = Preference_CalendarsToShow.findIndex_Calendar(prefObject, props.caldav_accounts[i].caldav_accounts_id, props.caldav_accounts[i].calendars[j].calendars_id)
            if(varNotEmpty(indexInPreferenceObject) && Array.isArray(indexInPreferenceObject) && indexInPreferenceObject.length>0)
            {
              calendarOutput.push(<Form.Check 
                inline type="checkbox" id={JSON.stringify(indexInPreferenceObject)} checked={prefObject[indexInPreferenceObject[0]].calendars[indexInPreferenceObject[1]].show} onClick={e => onChangeChecked( e, indexInPreferenceObject)}  label={props.caldav_accounts[i].calendars[j].displayName}/>)
    
            }
  
          }
        }

        output.push(<Form>{calendarOutput}</Form>)
      
      }
    }
    return(
     <>
     <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {i18next.t("SELECT_CALENDARS_TO_SHOW")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
            {output}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => setModalShow(false)}>Close</Button>
      </Modal.Footer>
      </Modal>
      <OverlayTrigger key="SELECT_CALENDARS_KEY" placement='top'
        overlay={
            <Tooltip id='tooltip_SELECT_CALENDARS'> 
                        {i18next.t("SELECT_CALENDARS_TO_SHOW")}

            </Tooltip>
          }>
          <Button size='sm' variant="primary" onClick={() => setModalShow(true)}>
              <BsCalendarCheck size={24} />      </Button>

      </OverlayTrigger>
     </> 
    )

}


function getLatestPreferenceObject(caldav_accounts: {name: string, caldav_accounts_id: number, calendars: any }[]){
  var calendarstoShow = Preference_CalendarsToShow.get()
  if(calendarstoShow && Preference_CalendarsToShow.isValidObject(calendarstoShow) && Preference_CalendarsToShow.isUptoDate(caldav_accounts)){
    return calendarstoShow
  }else{
    var newObj=Preference_CalendarsToShow.generateFromCaldavObject(caldav_accounts)
    return newObj
  }
}
