
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export function EventEditorExitModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        backdrop="static"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
          Discard changes to task?          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4></h4>
          <p>
            You have made some changes to this task. Unless you save, those changes will be discarded. 
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.onDiscardTaskChanges}>Discard Changes</Button>
          <Button onClick={props.onHide}>Continue Editing</Button>

        </Modal.Footer>
      </Modal>
    );
  }