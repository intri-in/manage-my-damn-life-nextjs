import React, { FC, ReactElement, useState } from 'react';
import { MdInfo } from 'react-icons/md';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
const InformationModal = (props) => {
  const {t} = useTranslation()
  return (
    <Modal
      {...props}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {t("QUICK_ADD")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
          {t("QUICK_ADD_DESC1")}
        <h2>{t("SHORTCUTS")}</h2>
        <div style={{textAlign:"center"}}>
        <Row>
        <Col>
        <b>{t("SYNTAX")}</b>
        </Col>
        <Col>
        <b>{t("DESCRIPTION")}</b>
        </Col>
        </Row>
        <Row >
          <Col>
            @:date
          </Col>
          <Col>
          {t("QUICK_ADD_DATE_DESCRIPTION")}
          </Col>
        </Row>
        <Row >
          <Col>
            !:priority
          </Col>
          <Col>
          {t("QUICK_ADD_PRIORITY_DESCRIPTION")}
          </Col>
        </Row>
        <Row >
          <Col>
          #:label
          </Col>
          <Col>
          {t("QUICK_ADD_LABEL_DESCRIPTION")}
          </Col>
        </Row>
        </div>
        <br />
        <Link href="https://manage-my-damn-life-nextjs.readthedocs.io/en/latest/Feature%20Guide/QuickAdd/" target='_blank'>{t("LEARN_MORE")}</Link>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>{t("CLOSE")}</Button>
      </Modal.Footer>
    </Modal>
  );
}
type ChildProps = {
}
const AddInfo: FC<ChildProps> = () => {
  const [showModal, setShow]=useState(false)

  const onClickInfo = () =>{
    setShow(true)
  }

 
  return (
    <>
          
       <div style={{display: "flex", justifyContent:"center", alignItems:"center", height:"100%"}}>
        <MdInfo size={24} onClick={onClickInfo} />
       <InformationModal
        show={showModal}
        onHide={() => setShow(false)}
      />
    </div>
  </>
   
  )
};

export default AddInfo;