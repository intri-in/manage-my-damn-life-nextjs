import { Col, Row, Offcanvas } from 'react-bootstrap';
import {  varNotEmpty } from '@/helpers/general';
import { PRIMARY_COLOUR, SECONDARY_COLOUR } from '@/config/style';
import { getI18nObject } from '@/helpers/frontend/general';
import { AiOutlineMenuUnfold } from 'react-icons/ai';
import { useState, useEffect } from 'react';
import { AddTaskFunctional } from '@/components/common/AddTask/AddTaskFunctional';
import { HomeTasksDDL } from '@/components/Home/HomeTasks/HomeTasksDDL';
import { TaskListFrameWork } from '@/components/tasks/views/TaskListFrameWork';
import { currentPageTitleAtom } from 'stateStore/ViewStore';
import { useAtomValue } from 'jotai';
import { CalendarViewWithStateManagement } from '@/components/fullcalendar/CalendarViewWithStateManagement';

export const CombinedViewFunctional = (props) => {

  const currentPageTitle = useAtomValue(currentPageTitleAtom)

  const [scheduleItem, setScheduleItem] = useState(null);
  const [showListColumn, setShowListColumn] = useState(true);
  const [showLeftColumnOffcanvas, setShowLeftColumnOffcanvas] = useState(false);
  const [calendarAR, setCalendarAR] = useState(1.35);
  const i18next = getI18nObject();


  const scheduleItemHandler = (data) => {
    console.log(data);
    if (varNotEmpty(data) && varNotEmpty(data.summary) && varNotEmpty(data.calendar_id)) {
      setScheduleItem(data);
    }
  };

  const updateDimensions = () => {
    if (window.innerWidth < 768) {
      setShowListColumn(false);
      setCalendarAR(0.3);
    } else {
      setShowListColumn(true);
    }
  };

  const leftColumDragged = () => {
    if (!showListColumn) {
      setShowLeftColumnOffcanvas(true);
    }
  };

  const showListColumnButtonClicked = () => {
    setShowLeftColumnOffcanvas(true);
  };

  const handleCloseOffcanvas = () => {
    setShowLeftColumnOffcanvas(false);
  };

  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);


  return (
    <>
      <Row style={{}}>
        <Col onClick={leftColumDragged} xs={1} sm={1} md={3} lg={4} style={{ paddingTop: 30, minHeight: '100vh' }}>
          {showListColumn || showLeftColumnOffcanvas ? (
            <div>
              <AddTaskFunctional />
              <HomeTasksDDL />
              <br />
              <h2>{currentPageTitle}</h2>              
              <TaskListFrameWork />
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              <AiOutlineMenuUnfold color={PRIMARY_COLOUR} onClick={showListColumnButtonClicked} size={24} />
            </div>
          )}
        </Col>
        <Col xs={11} sm={11} md={9} lg={8} style={{ paddingTop: 20, borderLeft: `3px solid ${SECONDARY_COLOUR}` }}>
          <CalendarViewWithStateManagement calendarAR={calendarAR} />
        </Col>
      </Row>
      <Offcanvas placement="start" show={showLeftColumnOffcanvas} onHide={handleCloseOffcanvas}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title></Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
              <AddTaskFunctional />
              <HomeTasksDDL />
              <br />
              <h2>{currentPageTitle}</h2>              
              <TaskListFrameWork />

        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

