import { useEffect, useState } from 'react';
import { FcCollapse, FcExpand } from 'react-icons/fc'
import { Col, Row } from 'react-bootstrap';


export const TaskGroup = ({ keyName, parent, children }: {keyName: string, parent: JSX.Element, children: JSX.Element | null }) => {

  const [childrenOutput, setChildrenOutput] = useState<JSX.Element | null>(<></>)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {

    if (!collapsed) {

      setChildrenOutput(
        <Row key={`${keyName}_Children`}>
          <Col>
            {children}
          </Col>
        </Row>
      )
    } else {
      setChildrenOutput(null)
    }
  }, [collapsed, parent, children,keyName, setChildrenOutput])

  let collapseButton: JSX.Element | null = null
  if (children) {

    collapseButton = collapsed ? <FcExpand /> : <FcCollapse />
  }

  const collapseClicked = () => {
    setCollapsed(prev => !prev)
  }
  return (
    <div key={keyName}>
      <Row>
        <Col xs={10} sm={10} md={11} lg={11}>
          {parent}
        </Col>
        <Col onClick={collapseClicked} className=' d-flex  align-items-center'
          xs= {2} sm={2} md={1} lg={1}>
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


