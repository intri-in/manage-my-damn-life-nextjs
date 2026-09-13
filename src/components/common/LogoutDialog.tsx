
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Loading } from '../common/Loading';
import { getI18nObject } from '@/helpers/frontend/general';
import { useTranslation } from 'next-i18next';
import { logoutUser, logoutUser_withRedirect } from '@/helpers/frontend/user';
import { nextAuthEnabled } from '@/helpers/thirdparty/nextAuth';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Accordion } from 'react-bootstrap';

export function LogoutDialog(props) {
const [loading, setLoading] = useState(false)
const {t} = useTranslation()
const router = useRouter()
const onLogoutClicked = () =>{
  
}
const cancelClicked = () =>{

}

  const logOutClicked = async () => {
    commonlogoutFunction(false)
  };
  const commonlogoutFunction = async (nukeDexie) =>{
    logoutUser(nukeDexie)
    if(await nextAuthEnabled()){
      signOut()
      router.push('/api/auth/signin')
    }else{
      let urlRedirect = "/"
      if(typeof(window)!=="undefined"){
        urlRedirect = window.location.pathname;
      }
      logoutUser_withRedirect(router, urlRedirect);
    }

  }

let buttons= loading? (<p style={{textAlign: "center"}}><Loading /></p>) :(<Modal.Footer>
    <Button variant="secondary" onClick={props.onDismissLogoutDialog}>{t("CANCEL")}</Button>
    <Button variant="warning" onClick={()=>commonlogoutFunction(true)}>{t("LOGOUT_AND_DELETE_LOCAL_DATA")}</Button>
    <Button variant="danger" onClick={logOutClicked}>{t("LOGOUT")}</Button>
    </Modal.Footer>)
  

    return (
      <Modal
        {...props}
        show={props.show}
        size="lg"
        centered
        backdrop="static"
        >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
          {t("LOGOUT")}?          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>{t("LOGOUT_DESC")}</p>
            <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
                <Accordion.Header>{t("LOGOUT_NUKE_FAQ")}</Accordion.Header>
                <Accordion.Body>
                    <p>
                        {t("LOGOUT_NUKE_DESC")}
                    </p>
                </Accordion.Body>
            </Accordion.Item>
            </Accordion>
        </Modal.Body>
          {buttons}
      </Modal>
    );
  }