
import { MouseEventHandler, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Loading } from '../common/Loading';
import { TFunction } from 'next-i18next';

interface propsType{
  onDismissDeleteDialog: MouseEventHandler<HTMLButtonElement>,
  onDeleteOK : Function,
  t:TFunction
  show:boolean,
  onHide: Function
}
export function TaskDeleteConfirmation(props:propsType) {
  const [loading, setLoading] = useState(false)

  const onDeleteOK = () =>{
    setLoading(true)
    props.onDeleteOK()
  }
  let buttons=loading ?(<p style={{textAlign: "center"}}><Loading /></p>) : (          <Modal.Footer>
    <Button variant="secondary" onClick={props.onDismissDeleteDialog}>Cancel</Button>
    <Button variant="danger" onClick={onDeleteOK}>Delete</Button></Modal.Footer>)
  

    return (
      <Modal
        show={props.show}
        size="lg"
        centered
        backdrop="static"
        >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
          Delete Task?          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4></h4>
        <p>
            Are you sure you want to delete this task?          
        </p>
        </Modal.Body>
          {buttons}
      </Modal>
    );
  }