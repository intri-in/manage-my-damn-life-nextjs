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
import { useTranslation } from 'next-i18next';
interface customProps{
    caldav_accounts:  {name: string, caldav_accounts_id: number, calendars: any }[];
    onChange?: () => void;

}
export function ListGroupCalDAVAccounts(props: customProps ){
    const [modalShow, setModalShow] = useState(false);
    const [prefObject, setPrefObject] =useState([])
    const [finalOutput, setFinalOutput] = useState<JSX.Element []>([])
    const {t} = useTranslation()
    useEffect(()=>{
      let isMounted =true
      if(isMounted){

        setPrefObject(getLatestPreferenceObject(props.caldav_accounts))
      }
      return ()=>{
        isMounted=false
      }
    },[])
    useEffect(()=>{
      let output : JSX.Element[]=[]
      //First we check if the preference matrix exists.

      let isMounted =true
      if(isMounted){
        if(props.caldav_accounts && props.caldav_accounts.length>0 ) 
        {
          for(const i in props.caldav_accounts){
           
            output.push(<h3>{props.caldav_accounts[i].name}</h3>)
            let calendarOutput: JSX.Element[] =[]
            if(varNotEmpty(props.caldav_accounts[i].calendars) && props.caldav_accounts[i].calendars)
            {
              if(!isValidResultArray(props.caldav_accounts[i].calendars)){
                continue
              }
              for(const j in props.caldav_accounts[i].calendars){
                let indexInPreferenceObject = Preference_CalendarsToShow.findIndex_Calendar(prefObject, props.caldav_accounts[i].caldav_accounts_id, props.caldav_accounts[i].calendars[j].calendars_id)
                if(varNotEmpty(indexInPreferenceObject) && Array.isArray(indexInPreferenceObject) && indexInPreferenceObject.length>0)
                {
                  calendarOutput.push(<Form.Check key={JSON.stringify(indexInPreferenceObject)}
                    inline type="checkbox" id={JSON.stringify(indexInPreferenceObject)} checked={prefObject[indexInPreferenceObject[0]].calendars[indexInPreferenceObject[1]].show} onChange={e => onChangeChecked( e, indexInPreferenceObject)}  label={props.caldav_accounts[i].calendars[j].displayName}/>)
        
                }
      
              }
            }
    
            output.push(<Form>{calendarOutput}</Form>)
          
          }


          setFinalOutput(output)
        }
  
      }
      return ()=>{
        isMounted=false
      }

    },[prefObject])


 
    const onChangeChecked =  (e, indexInPreferenceObject) =>{
      let index = JSON.parse(e.target.id)
      // console.log(e.target.checked)
      Preference_CalendarsToShow.update(index, e.target.checked)
      setPrefObject(getLatestPreferenceObject(props.caldav_accounts))
      if(props.onChange){
        props.onChange()
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
          {t("SELECT_CALENDARS_TO_SHOW")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
            {finalOutput}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => setModalShow(false)}>Close</Button>
      </Modal.Footer>
      </Modal>
      <OverlayTrigger key="SELECT_CALENDARS_KEY" placement='top'
        overlay={
            <Tooltip id='tooltip_SELECT_CALENDARS'> 
                        {t("SELECT_CALENDARS_TO_SHOW")}

            </Tooltip>
          }>
          <Button size='sm' variant="primary" onClick={() => setModalShow(true)}>
              <BsCalendarCheck size={24} />      </Button>

      </OverlayTrigger>
     </> 
    )

}


function getLatestPreferenceObject(caldav_accounts: {name: string, caldav_accounts_id: number, calendars: any }[]){
  const calendarstoShow = Preference_CalendarsToShow.get()
  // console.log("HERE", Preference_CalendarsToShow.isValidObject(calendarstoShow),calendarstoShow,Preference_CalendarsToShow.isUptoDate(caldav_accounts) )
  if(calendarstoShow && Preference_CalendarsToShow.isValidObject(calendarstoShow) ){
    return calendarstoShow
  }else{
    let newObj=Preference_CalendarsToShow.generateFromCaldavObject(caldav_accounts)
    return newObj
  }
}
