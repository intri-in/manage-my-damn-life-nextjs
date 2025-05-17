
import { Col, Row, Offcanvas, Accordion } from 'react-bootstrap';
import {  varNotEmpty } from '@/helpers/general';
import { PRIMARY_COLOUR, SECONDARY_COLOUR } from '@/config/style';
import { AiOutlineMenuUnfold } from 'react-icons/ai';
import { useState, useEffect, useRef } from 'react';
import { AddTaskFunctional } from '@/components/common/AddTask/AddTaskFunctional';
import { HomeTasksDDL } from '@/components/Home/HomeTasks/HomeTasksDDL';
import { TaskListFrameWork } from '@/components/tasks/views/TaskListFrameWork';
import { currentPageTitleAtom } from 'stateStore/ViewStore';
import { useAtomValue } from 'jotai';
import { CalendarViewWithStateManagement } from '@/components/fullcalendar/CalendarViewWithStateManagement';
import { useTranslation } from 'next-i18next';

export const CombinedViewFunctional = (props) => {

  const currentPageTitle = useAtomValue(currentPageTitleAtom)

  const [showListColumn, setShowListColumn] = useState(true);
  const [calendarAR, setCalendarAR] = useState(1.35);
  const { t } = useTranslation("common")


  const updateDimensions = () => {
    console.log(window.innerWidth)
    if (window.innerWidth < 768) {
      setShowListColumn(false);
      setCalendarAR(0.3);
    } else {
      setShowListColumn(true);
      setCalendarAR(1.35);

    }
  };

  // const leftColumDragged = () => {
  //   if (!showListColumn) {
  //     setShowLeftColumnOffcanvas(true);
  //   }
  // };

  // const showListColumnButtonClicked = () => {
  //   setShowLeftColumnOffcanvas(true);
  // };

  // const handleCloseOffcanvas = () => {
  //   setShowLeftColumnOffcanvas(false);
  // };

  useEffect(() => {
    updateDimensions()
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const allTaskLists = (
  <>
    <AddTaskFunctional />
    <HomeTasksDDL />
    <br />
    <h2>{currentPageTitle}</h2>              
    <TaskListFrameWork />
  </>
  )
  const taskOutput = showListColumn ? (<></>) : <GetAccordionTaskList t={t} body={allTaskLists} />
  const borderLeft = !showListColumn ? "" : `3px solid ${SECONDARY_COLOUR}`
  return (
    <>
      {taskOutput}
      <Row style={{}}>
        <Col className='d-none d-sm-none d-md-block' md={4} lg={4} style={{ paddingTop: 30, minHeight: '100vh' }}>
          {allTaskLists}
        </Col>
        <Col xs={12} sm={12} md={8} lg={8} style={{ paddingTop: 20, borderLeft: borderLeft}}>
          <CalendarViewWithStateManagement calendarAR={calendarAR} />
        </Col>
      </Row>
    </>
  );
};

const GetAccordionTaskList = ({body, t}) =>{
  return(
    <div style={{marginTop: 20}}>
        <Accordion >
          <Accordion.Item eventKey="taskList_HomePage">
            <Accordion.Header>{t("TASKS")}</Accordion.Header>
            <Accordion.Body>
              {body}
            </Accordion.Body>

          </Accordion.Item>
        </Accordion>

    </div>
  )
}