import { Component } from "react";
import { isValidResultArray } from "@/helpers/general";
import Form from 'react-bootstrap/Form';
import { Col, Row } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import { searchLabelObject } from "@/helpers/frontend/labels";

export default class SearchLabelArray extends Component{
    constructor(props)
    {
        super(props)
        this.state={searchResults: props.dataList, finalOutput: null, labelSearchValue:"" }
        this.generateListofResults - this.generateListofResults.bind(this)
        this.labelSearch = this.labelSearch.bind(this)
    }
    componentDidMount()
    {

    }
    addLabelClicked(label)
    {
        var incomingLabelArray = [] 
        if(isValidResultArray(this.props.labels))
        {
            incomingLabelArray= this.props.labels
        }
        if(label!=null&&label.trim()!="")
        {
            var found=false
            for(const i in this.props.labels)
            {
                if(label.trim()==this.props.labels[i])
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
        if(isValidResultArray(this.props.dataList))
        {
             result = searchLabelObject(this.props.dataList, searchTerm);

            for(const i in result)
            {
                finalOutput.push(<div key={result[i]} style={{padding: 10}} onClick={() => this.addLabelClicked(result[i])}>{result[i]}</div>)
    
            }
    

        }
        if(isValidResultArray(result))
        {
            this.setState({finalOutput: <div style={{border: "1px gray solid"}}>{finalOutput}</div>})

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