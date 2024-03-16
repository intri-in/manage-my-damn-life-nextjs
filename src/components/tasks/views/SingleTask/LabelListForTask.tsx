import { getAllLabelsFromDexie } from "@/helpers/frontend/dexie/dexie_labels"
import { isValidResultArray, varNotEmpty } from "@/helpers/general"
import {  useEffect, useState } from "react"
import { ParsedTask } from "types/tasks/tasks"

export const LabelListForTask = ({parsedTask, id}: {parsedTask: ParsedTask, id: string}) => {

    const [finalOutput, setFinalOutput] = useState([<></>])

    const generateList = async () =>{
        let labelArray: JSX.Element[] = []
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
                
                   
                labelArray.push(<span key={`labels_${i}_${parsedTask.categories[i]}`} className="badge rounded-pill textDefault" style={{ fontSize:9, marginLeft: 3, marginRight: 3,  backgroundColor: labelColour, color: "white" }}>{parsedTask.categories[i]}</span>)
                }
    
                
    
        
            }
            setFinalOutput(labelArray)
    }

    useEffect(()=>{
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