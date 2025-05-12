import AddTask from "@/components/common/AddTask/AddTask"
import { AddTaskFunctional } from "@/components/common/AddTask/AddTaskFunctional"
import AppBarGeneric from "@/components/common/AppBar"
import GenericLists from "@/components/common/GenericLists"
import { GenericListsWithStateManagement } from "@/components/common/PageViewLists/GenericListsWithStateManagement"
import { ViewSelector } from "@/components/common/PageViewLists/ViewSelector"
import TaskViewOptions from "@/components/common/TaskViewOptions"
import { GanttViewWithState } from "@/components/tasks/views/GanttView/GanttViewWithState"
import { TaskListFrameWork } from "@/components/tasks/views/TaskListFrameWork"
import { PRIMARY_COLOUR, SECONDARY_COLOUR } from "@/config/style"
import { PAGE_VIEW_JSON } from "@/helpers/viewHelpers/pages"
import { useAtomValue, useSetAtom } from "jotai"
import Head from "next/head"
import { useEffect, useState } from "react"
import { Col, Offcanvas, Row } from "react-bootstrap"
import { useTranslation } from "next-i18next"
import { AiOutlineMenuUnfold } from "react-icons/ai"
import { calDavObjectAtom, currentPageTitleAtom, currentViewAtom, filterAtom, updateViewAtom } from "stateStore/ViewStore"



export const TaskViewListWithStateManagement =  () =>{

  /**
   * Jotai
   */
  const currentPageTitle = useAtomValue(currentPageTitleAtom)
       /**
     * Jotai
     */
       const setCurrentPageTitle= useSetAtom(currentPageTitleAtom)
       const setFilterAtom = useSetAtom(filterAtom)
       const setCalDavAtom = useSetAtom(calDavObjectAtom)
       const setUpdateView= useSetAtom(updateViewAtom)
  
  
  /**
   * Local State
   */
  const [ showListColumn, setShowListColumn] = useState(true)
  const [showLeftColumnOffcanvas, setShowLeftColumnOffcanvas] = useState(false)
  const {t} = useTranslation()
  const updateDimensions = () => {
    if (window.innerWidth < 768) {
      setShowListColumn(false)

    } else {
      setShowListColumn(true)

    }
  }
  useEffect(() =>{
    let isMounted = true
    if(isMounted)
    {
      if (window != undefined) {
        window.addEventListener('resize', updateDimensions);
  
        if (window.innerWidth < 768) {
          setShowListColumn(false)
        } else {
          setShowListColumn(true)
  
        }

        // const queryString = window.location.search;
        // const params = new URLSearchParams(queryString);
        // let pageName = params.get('name')
        // console.log("pageName",pageName )
        // if(pageName){

        //   setFilterAtom(PAGE_VIEW_JSON[pageName])
        //   setCalDavAtom({caldav_accounts_id: null, calendars_id: null})
        //   setCurrentPageTitle(t(pageName).toString())
        //   setUpdateView(Date.now())
        // }
  
      }
  
    }
    return ()=>{
      isMounted = false
    }

  }, [])


  const postClick =  () =>{
    //Close the generic list offcanvas.
    setShowLeftColumnOffcanvas(false)
  }
  
  const handleCloseOffcanvas = () =>{

    setShowLeftColumnOffcanvas(false)
  }
  const leftColumDragged = () => {
    // console.log("DRAGGED!!!")
    if(!showListColumn){
      setShowLeftColumnOffcanvas(true)
    }
  }

  const expandColButton = <div> <AiOutlineMenuUnfold color={PRIMARY_COLOUR} onClick={()=>setShowLeftColumnOffcanvas(true)} size={16} /></div>

  const borderRight = '3px solid' + SECONDARY_COLOUR

  const leftColumnMatter = showListColumn || showLeftColumnOffcanvas? (<GenericListsWithStateManagement postClick={postClick}  />
  ) : expandColButton

    return(
        <>
        <Head>
          <title>{t("APP_NAME_TITLE")+" - "+t("TASK_VIEW")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric />
        <div className='container-fluid'>
        <Row>
          <Col>
            <div ></div>
          </Col>
        </Row>
        <div className='row'>
          <Col  onClick={leftColumDragged} xs={1} sm={1} md={3}  lg={3} style={{ paddingTop: 30, minHeight:"100vh" }}>
            {leftColumnMatter}
          </Col>
          <Col xs={11} sm={11} md={9} lg={9} style={{ borderLeft: borderRight, minHeight:"100vh"}}>
         <AddTaskFunctional />
          <ViewSelector  />
          <br />
          <h2>{currentPageTitle}</h2>
          <br />
          <TaskListFrameWork />
          </Col>

        </div>
        <Offcanvas placement='start' show={showLeftColumnOffcanvas} onHide={handleCloseOffcanvas}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title></Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
          <GenericListsWithStateManagement postClick={postClick}  />
          </Offcanvas.Body>
        </Offcanvas>

        </div>

        </>

    )
}