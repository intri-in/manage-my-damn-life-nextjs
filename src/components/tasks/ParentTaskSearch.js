import { returnGetParsedVTODO } from "@/helpers/frontend/calendar";
import { getParsedEvent, majorTaskFilter } from "@/helpers/frontend/events";
import { getI18nObject } from "@/helpers/frontend/general";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { getAPIURL, haystackHasNeedle, isValidResultArray, logVar } from "@/helpers/general";
import { Component } from "react"
import { Button, Col, Row } from "react-bootstrap"
import Form from 'react-bootstrap/Form';
import { Toastify } from "../Generic";
import { toast } from "react-toastify";
import ListGroup from 'react-bootstrap/ListGroup';
import { Loading } from "../common/Loading";
import { searchEventInDexie } from "@/helpers/frontend/dexie/events_dexie";
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
    parentTaskClicked(e)
    {

        this.setState({searchOutput: null})
        this.props.onParentSelect(e.target.id)
    }

    async searchForTasks(searchTerm)
    {
        if(searchTerm!=null && searchTerm.trim()!="")
        {
        // Make search Request to server.
            this.setState({finalOutput: <Loading centered={true} />})
            
            var finalOutput = []
            var results = await searchEventInDexie(this.props.calendar_id, "VTODO", searchTerm)
            console.log("this.props.calendar_id", this.props.calendar_id, results)
            if(isValidResultArray(results))
            {
                //console.log("results.length", results.length)
                for (const i in results)
                {
                    var parsedToDo = _.cloneDeep(returnGetParsedVTODO(results[i].data))
                    if(parsedToDo.uid!=this.props.currentID && majorTaskFilter(parsedToDo) && results[i].deleted!="1")
                    {
                        //We only show the result if it isn't the same as the task currently being edited.
                        
                        finalOutput.push(
                            (<ListGroup.Item action id={parsedToDo.uid} key={parsedToDo.uid} style={{padding: 10}} onClick={this.parentTaskClicked}>{parsedToDo.summary}</ListGroup.Item>) )
                        }
                    }
                    if(finalOutput.length>0)
                    {
                        this.setState({searchOutput: (<ListGroup style={{border: "1px gray solid"}}>{finalOutput}</ListGroup>)})

                    }else{
                        this.setState({searchOutput: (<ListGroup style={{border: "1px gray solid", padding: 10}}>{this.i18next.t("NOTHING_TO_SHOW")}</ListGroup>)})

                }
                
            }
            // const url_api=getAPIURL()+"events/search?calendar_id="+this.props.calendar_id+"&&type=VTODO&&search_term="+searchTerm.trim()
            // const authorisationData=await getAuthenticationHeadersforUser()
        
            // const requestOptions =
            // {
            //     method: 'GET',
            //     mode: 'cors',
            //     headers: new Headers({'authorization': authorisationData}),
        
            // }
            // const response =  fetch(url_api, requestOptions)
            // .then(response => response.json())
            // .then((body) =>{
                //     if(body!=null && body.success!=null && body.success==true)
                //     {
                    
                    //     }else{
                        //         var message = getMessageFromAPIResponse(body)
                        //         toast.error(this.i18next.t(message))
                        //     }
                        
                        //     }
                        // ).catch(e =>{
                    //     logVar(e, "ParentTaskSearch: searchForTasks")

                    // })
                

        }else{
            this.setState({searchOutput: null})
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