import { returnGetParsedVTODO } from "@/helpers/frontend/calendar";
import { getParsedEvent } from "@/helpers/frontend/events";
import { getI18nObject } from "@/helpers/frontend/general";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { haystackHasNeedle, isValidResultArray } from "@/helpers/general";
import { Component } from "react"
import { Button, Col, Row } from "react-bootstrap"
import Form from 'react-bootstrap/Form';
import { Toastify } from "../Generic";
import { toast } from "react-toastify";
import ListGroup from 'react-bootstrap/ListGroup';
export default class ParentTaskSearch extends Component{

    constructor(props)
    {
        super(props)
        this.i18next= getI18nObject()
        this.state={searchTerm: "", searchOutput: ""}
        this.searchTermChanged = this.searchTermChanged.bind(this)
        this.searchForTasks = this.searchForTasks.bind(this)
        this.parentTaskClicked = this.parentTaskClicked.bind(this)
    }

    searchTermChanged(e)
    {
        this.setState({searchTerm: e.target.value})
        this.searchForTasks(e.target.value)
    }
    parentTaskClicked(uid)
    {
        this.setState({searchOutput: null})
        this.props.onParentSelect(uid)
    }

    async searchForTasks(searchTerm)
    {
        if(searchTerm!=null && searchTerm.trim()!="")
        {
        // Make search Request to server.
        const url_api=process.env.NEXT_PUBLIC_API_URL+"events/search?calendar_id="+this.props.calendar_id+"&&type=VTODO&&search_term="+searchTerm.trim()
        const authorisationData=await getAuthenticationHeadersforUser()
    
        const requestOptions =
        {
            method: 'GET',
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData}),
    
        }
    
        var finalOutput = []
            const response =  fetch(url_api, requestOptions)
            .then(response => response.json())
            .then((body) =>{
                if(body!=null && body.success!=null && body.success==true)
                {
                    var results = body.data.message
                    if(isValidResultArray(results))
                    {
                        console.log("results.length", results.length)
                        for (const i in results)
                        {
                            var parsedToDo = returnGetParsedVTODO(results[i].data)
                            console.log(parsedToDo.summary)
                            finalOutput.push(
                                (<ListGroup.Item action key={parsedToDo.uid} style={{padding: 10}} onClick={() => this.parentTaskClicked(parsedToDo.uid)}>{parsedToDo.summary}</ListGroup.Item>) )
                        }
                        this.setState({searchOutput: (<ListGroup flush style={{border: "1px gray solid"}}>{finalOutput}</ListGroup>)})

                    }
                }else{
                    var message = getMessageFromAPIResponse(body)
                    toast.error(this.i18next.t(message))
                }
    
                }
            )
                console.log(finalOutput)

        }
       

    }
    render(){
        return(
            <div>
            <Row style={{  }}> 
            <Col ><Form.Control onChange={this.searchTermChanged} value={this.state.searchTerm} maxLength={20} placeholder={this.i18next.t("SEARCH")} /></Col> 
            </Row>

            <Row style={{marginTop:3, }} >
                <Col >
                {this.state.searchOutput}

                </Col>
            </Row>
            {/*  <Toastify /> */}
            </div>
        )
    }
}