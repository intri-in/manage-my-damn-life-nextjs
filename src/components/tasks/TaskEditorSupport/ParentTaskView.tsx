import { Loading } from "@/components/common/Loading"
import { getSummaryforEventUID_fromDexie } from "@/helpers/frontend/dexie/events_dexie"
import { MouseEventHandler, useEffect, useState } from "react"
import { Col, Row } from "react-bootstrap"
import { AiOutlineDelete } from "react-icons/ai"
import ParentTaskSearch from "../ParentTaskSearch"

interface propTypes{
    parentID: string | undefined,
    removeParentClicked: MouseEventHandler,
    onParentSelect: Function,
    calendar_id: string | undefined,
    uid: string | undefined
}
/**
 * Generates the output of Parent Task for a task with a given uid. If the task has a parent, the parent's summary is shown along with an option to remove the parent relationship. Otherwise returns a search bar so user can search and add a parent. 
 * 
 * Note: The search only works for tasks within the calendar_id provided.
 * @param props {@link propTypes}
 * @returns 
 */
export default function ParentTaskView(props: propTypes){

    const [output, setOutput] = useState(<Loading centered={true} />)
    useEffect(()=>{
        async function getParent(){
            if(props.calendar_id && props.parentID){
                const parentSummary = await getSummaryforEventUID_fromDexie(props.parentID, props.calendar_id)

                if(parentSummary){

                setOutput(                
                <div key="parentofTask">
                    <Row style={{ justifyContent: 'center', display: 'flex', alignItems: "center", }}>
                        <Col>
                            <p>{parentSummary}</p>
                        </Col>
                        <Col>
                            <p style={{ textAlign: "right", color: "red" }}><AiOutlineDelete onClick={props.removeParentClicked} /></p>
                        </Col>
                    </Row>
                </div>)
                }
            }else{
                setOutput(
                    <ParentTaskSearch currentID={props.uid}  calendar_id={props.calendar_id} onParentSelect={props.onParentSelect} />
                )
            }

        }
        let isMounted= true
        if(isMounted){
            getParent()

        }

        return () => {
            isMounted = false;
          };    
    }, [props.parentID, props.calendar_id, props.onParentSelect, props.removeParentClicked, props.uid])
    return(
    <>
    {output}
    </>
    )
}