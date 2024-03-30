import { Component } from "react";
import { isValidResultArray } from "@/helpers/general";
import Form from 'react-bootstrap/Form';
import { Col, Row } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { searchLabelObject } from "@/helpers/frontend/labels";
import { getAllLabelsFromDexie } from "@/helpers/frontend/dexie/dexie_labels";

export default class SearchLabelArray extends Component{
    constructor(props)
    {
        super(props)
        this.state={dataList: [], finalOutput: null, labelSearchValue:"", labels: this.props.labels }
        this.generateListofResults - this.generateListofResults.bind(this)
        this.labelSearch = this.labelSearch.bind(this)
    }
    componentDidMount()
    {
        getAllLabelsFromDexie().then(labels =>{
            this.setState({dataList: labels})
        })
    }
    componentDidUpdate(prevProps, prevState) {
        if(prevProps.labels!=this.props.labels){
            this.setState({labels: this.props.labels})
        }
    }

    addLabelClicked(label)
    {
        this.setState({finalOutput: null, labelSearchValue:""})
        let incomingLabelArray = [] 
        if(isValidResultArray(this.state.labels))
        {
            incomingLabelArray= this.props.labels
        }
        if(label!=null&&label.trim()!="")
        {
            var found=false
            for(const i in this.state.labels)
            {
                if(label.trim()==this.state.labels[i])
                {
                    found = true
                }
            }
            if(found==false)
            {
                incomingLabelArray.push(label)
                this.props.onLabelAdded(incomingLabelArray)
            }
        }
    }
    generateListofResults(searchTerm){
        var finalOutput=[]
        var result=[]
        if(isValidResultArray(this.state.dataList))
        {
             result = searchLabelObject(this.state.dataList, searchTerm);

            for(const i in result)
            {
                finalOutput.push(<ListGroup.Item action key={result[i]} style={{padding: 10}} onClick={() => this.addLabelClicked(result[i])}>{result[i]}</ListGroup.Item>)
    
            }
    

        }
        if(isValidResultArray(result))
        {
            this.setState({finalOutput: <ListGroup style={{border: "1px gray solid"}}>{finalOutput}</ListGroup>})

        }
        else{
            this.setState({finalOutput:""})
        }

    }
    labelSearch(e){
        this.setState({labelSearchValue: e.target.value})
        this.generateListofResults(e.target.value)
    }
    
    render(){
        return(
        <>
        <Row>
        <Col sm={9}><Form.Control onChange={this.labelSearch} value={this.state.labelSearchValue} maxLength={20} placeholder="Enter label" /></Col> 
        <Col sm={3}>
        <Button  onClick={()=>this.addLabelClicked(this.state.labelSearchValue)} variant="primary" size="sm">Add</Button>
        </Col>
        </Row>
        <Row style={{marginTop:3 }} >
            <Col sm={9}>
            {this.state.finalOutput}
            </Col>
            <Col sm={3}>
            </Col>
        </Row>
        </>)
    }
}