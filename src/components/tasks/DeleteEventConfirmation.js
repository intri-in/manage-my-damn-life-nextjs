
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Loading } from '../common/Loading';
import { getI18nObject } from '@/helpers/frontend/general';

export function DeleteEventConfirmation(props) {
const [loading, setLoading] = useState(false)

var i18next = getI18nObject()
const onDeleteOK = () =>{
  setLoading(true)
  props.onDeleteOK()
}
if(loading)
{
  var buttons=(<p style={{textAlign: "center"}}><Loading /></p>)
}
else
{
  var buttons= (          <Modal.Footer>
    <Button variant="secondary" onClick={props.onDismissDeleteDialog}>Cancel</Button>
    <Button variant="danger" onClick={onDeleteOK}>Delete</Button></Modal.Footer>)
  
}

    return (
      <Modal
        {...props}
        size="lg"
        centered
        backdrop="static"
        >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
          {i18next.t("DELETE")}?          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4></h4>
        <p>
          {i18next.t("DELETE_EVENT_CONFIRMATION")}
        </p>
        </Modal.Body>
          {buttons}
      </Modal>
    );
  }