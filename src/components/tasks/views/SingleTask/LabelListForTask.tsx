import { getAllLabelsFromDexie } from "@/helpers/frontend/dexie/dexie_labels"
import { isValidResultArray, varNotEmpty } from "@/helpers/general"
import { fontSize } from "@mui/system"
import {  useEffect, useState } from "react"
import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { ParsedTask } from "types/tasks/tasks"

export const LabelListForTask = ({parsedTask, id}: {parsedTask: ParsedTask, id: string}) => {

    const [finalOutput, setFinalOutput] = useState([<></>])
    const [toolTipOutput, setToolTipOutput] = useState([<></>])
    const renderTooltip = (props) => (
        <Tooltip key={id} id={`button-tooltip-${id}`} {...props}>
          {toolTipOutput}
        </Tooltip>
      );

    const getLabelPill = (i, text, id, labelColour, fontSize) => {

        return(
            <span key={`labels_${i}_${text}_${id}`} className="badge rounded-pill textDefault" style={{ fontSize:fontSize, marginLeft: 1, marginRight: 1,  backgroundColor: labelColour, color: "white" }}>{text}</span>)
    }
    useEffect(()=>{
        const generateList = async () =>{
            let labelArray: JSX.Element[] = []
            let toolTipData : JSX.Element[] = []
            let labelColour = "black"
            let labelArrayFromCookie = await getAllLabelsFromDexie()
            if (varNotEmpty(parsedTask.categories) && Array.isArray(parsedTask.categories)) {
                for (const i in parsedTask.categories) {
                    labelColour = "black"
                    if (isValidResultArray(labelArrayFromCookie)) {
                        for(const j in labelArrayFromCookie){
                            if(labelArrayFromCookie[j]["name"]==parsedTask.categories[i]){
                                labelColour = labelArrayFromCookie[j]["colour"]!
                            }
                        }
                    }
                    
                    //toolTipData.push(<span key={`labels_${i}_${parsedTask.categories[i]}_${id}`} className="badge rounded-pill textDefault" style={{ fontSize:8, marginLeft: 1, marginRight: 1,  backgroundColor: labelColour, color: "white" }}>{parsedTask.categories[i].charAt(0)}</span>)

                    const smallID = `${id}_small`
                    labelArray.push(getLabelPill(i, parsedTask.categories[i].charAt(0), smallID, labelColour, 6))
                    toolTipData.push(getLabelPill(`${i}_large`, parsedTask.categories[i], `${id}_large`, labelColour, 10 ))

                }
        
                    
        
            
            }
            setToolTipOutput(toolTipData)

            setFinalOutput([
                <OverlayTrigger
                placement="top"
                overlay={renderTooltip}
                key={`${id}_key_Overlay`}
                >

                <span>
                    <div style={{textAlign:"center", margin:"auto",   display: "block", overflowY:"hidden", textOverflow: "ellipsis",  maxHeight:"16px", zIndex:999 }} className="textDefault">
                    {labelArray}

                    </div>
                    </span>
                </OverlayTrigger>
                ]

                )

        }
        let isMounted = true
        if (isMounted) {
            generateList()
        }
        return () => {
            isMounted = false
        }
    },[parsedTask, id])

    

        return(
            <div key={`${id}_labelListForTask`}>
                {finalOutput}
            </div>
        )
}