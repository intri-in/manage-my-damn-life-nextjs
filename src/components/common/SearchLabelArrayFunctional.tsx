import { Component } from "react";
import Form from 'react-bootstrap/Form';
import { Col, Row } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { Labels } from "@/helpers/frontend/dexie/dexieDB"
import { getAllLabelsFromDexie } from "@/helpers/frontend/dexie/dexie_labels"
import { isValidResultArray } from "@/helpers/general"
import { useEffect, useState } from "react"
import { categoryArrayHasLabel, removeLabelFromCategoryArray, searchLabelObject } from "@/helpers/frontend/labels";

export const SearchLabelArrayFunctional = ({category, onLabelAdded, onLabelRemoved}:{category: string[],onLabelAdded: Function, onLabelRemoved: Function}) =>{

    const [allLabelsFromDexie, setLabelsFromDexie] = useState<Labels[]>([])
    const [labelOutput, setLabelOutput] = useState<JSX.Element[]>([])
    const [labelSearchTerm, setLabelSearchTerm] = useState("")
    const [searchOutput, setSearchOutput] = useState<JSX.Element[]>([])

    useEffect(()=>{
        let isMounted = true
        if (isMounted) {
            
            getAllLabelsFromDexie().then(labels =>{
                setLabelsFromDexie(labels)
            })
            generateLabelOutput()
        }
        return () => {
            isMounted = false
        }

    },[category])

    const generateLabelOutput = ()=>{
        let labelArray: JSX.Element[] = []
        if (isValidResultArray(category)) {
            
            for (const i in category) {
                let labelColour: string | undefined = ""
                if (isValidResultArray(allLabelsFromDexie)) {
                    for (let j = 0; j < allLabelsFromDexie.length; j++) {
                        if (allLabelsFromDexie[j].name == category[i]) {
                            labelColour = (("colour" in allLabelsFromDexie[j]) && allLabelsFromDexie[j].colour) ? allLabelsFromDexie[j].colour: "black"
                        }
                    }
                }

                labelArray.push(<span onClick={()=>removeLabelFromCategory(category[i])} id={category[i]} key={category[i]+"_"+i} className="badge rounded-pill textDefault" style={{ marginLeft: 3, marginRight: 3, padding: 3, backgroundColor: labelColour, color: "white" }}>{category[i]}</span>)

            }
        }
        setLabelOutput(labelArray)
        
    }
    const addNewLabelToCategory = (label) =>{
        if(categoryArrayHasLabel(category, label)==false){
            if(Array.isArray(category)){

                onLabelAdded([...category, label])
            }else{
                onLabelAdded([label])
            }
        }
        setSearchOutput([])
        setLabelSearchTerm("")
    }
    const removeLabelFromCategory = (labelToRemove) =>{
        let newArray: string[] = removeLabelFromCategoryArray(category, labelToRemove)
        console.log("asdas", newArray)
        onLabelRemoved(newArray)

    }
    const generateListofResults = (searchTerm) =>{
        let finalOutput:JSX.Element[]=[]
        let result: string[]=[]
        
        if(!searchTerm){
            setSearchOutput([])
            return
        }
        result = searchLabelObject(allLabelsFromDexie, searchTerm);

        for(const i in result)
        {
            finalOutput.push(<ListGroup.Item action key={result[i]+"_"+i} style={{padding: 10}} onClick={() => addNewLabelToCategory(result[i])}>{result[i]}</ListGroup.Item>)

        }
    

       
            setSearchOutput([<ListGroup style={{border: "1px gray solid"}}>{finalOutput}</ListGroup>])

        
    }
    const searchLabels =(e)=>{
        setLabelSearchTerm(e.target.value)
        generateListofResults(e.target.value)
    }
    return(
        <>
        <div style={{marginBottom: 5}}>
            {labelOutput}
        </div>
        <Row>
        <Col sm={9}><Form.Control onChange={searchLabels} value={labelSearchTerm} maxLength={20} placeholder="Enter label" /></Col> 
        <Col sm={3}>
        <Button  onClick={()=>addNewLabelToCategory(labelSearchTerm)} variant="primary" size="sm">Add</Button>
        </Col>
        </Row>
        <Row style={{marginTop:3 }} >
            <Col sm={9}>
            {searchOutput}
            </Col>
            <Col sm={3}>
            </Col>
        </Row>
        </>
    )
}