import React, { FC, ReactElement, useState } from 'react';
import { MdInfo } from 'react-icons/md';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

type ChildProps = {
}
const HelpGanttView: FC<ChildProps> = () => {
  const [showModal, setShow]=useState(false)
  const {t} = useTranslation()
  const onClickInfo = () =>{
    setShow(true)
  }

  function InformationModal(props) {
    return (
      <Modal
        {...props}
        size="md"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {t("HELP")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {t("GANTT_VIEW_HELP")} 
            <br />            <br />

            {t("GANTT_VIEW_HELP_2")}
            <br />            <br />
            {t("GANTT_VIEW_HELP_3")}

        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>{t("CLOSE")}</Button>
        </Modal.Footer>
      </Modal>
    );
  }
  return (
    <>
          
       <div style={{display: "flex", justifyContent:"center", alignItems:"center", height:"100%"}}><MdInfo size={24} onClick={onClickInfo} />
       <InformationModal
      show={showModal}
      onHide={() => setShow(false)}
    />
    </div>
</>
   
  )
};

export default HelpGanttView;