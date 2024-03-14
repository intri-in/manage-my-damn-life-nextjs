import { useEffect, useState } from 'react';
import { FcCollapse, FcExpand } from 'react-icons/fc'
import { Col, Row } from 'react-bootstrap';


export const TaskGroup = ({ key, parent, children }: { key: string, parent: JSX.Element, children: JSX.Element | null }) => {

  const [childrenOutput, setChildrenOutput] = useState<JSX.Element | null>(<></>)
  const [collapsed, setCollapsed] = useState(true)

  useEffect(() => {

    if (!collapsed) {

      setChildrenOutput(
        <Row key={`${key}`}>
          <Col>
            {children}
          </Col>
        </Row>
      )
    } else {
      setChildrenOutput(null)
    }
  }, [collapsed, parent, children])

  let collapseButton: JSX.Element | null = null
  if (children) {

    collapseButton = collapsed ? <FcExpand /> : <FcCollapse />
  }

  const collapseClicked = () => {
    setCollapsed(prev => !prev)
  }
  return (
    <div key={key}>
      <Row>
        <Col sm={11} md={11} lg={11}>
          {parent}
        </Col>
        <Col onClick={collapseClicked} className=' d-flex  align-items-center'
          sm={1} md={1} lg={1}>
          {collapseButton}
        </Col>
      </Row>
      {childrenOutput}
    </div>
  )
}

// export const TaskGroup  = ({key, parent, children}:{key: string, parent: JSX.Element, children: JSX.Element}) =>{
//   return(
//     <Accordion key={key} defaultActiveKey="0">
//     <Card>
//       <Card.Header>
//         {parent}
//       </Card.Header>
//       <Accordion.Collapse eventKey="0">
//         <Card.Body>{children}</Card.Body>
//       </Accordion.Collapse>
//     </Card>        
//     </Accordion>
//   )
// }


