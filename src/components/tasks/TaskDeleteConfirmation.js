
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Loading } from '../common/Loading';

export function TaskDeleteConfirmation(props) {
const [loading, setLoading] = useState(false)

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