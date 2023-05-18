import { BACKGROUND_GRAY } from "@/config/style";
import { getI18nObject } from "@/helpers/frontend/general";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { getAPIURL, logVar, varNotEmpty } from "@/helpers/general";
import moment from "moment";
import { Component } from "react";
import { Col, Row } from "react-bootstrap";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Loading } from "../common/Loading";

export default class ManageUsers extends Component{
    constructor(props)
    {
        super(props)
        this.i18next= getI18nObject()
        this.state={userTable: [], showDeleteModal: false, userIDToDelete:'', isSubmitting : false}
        this.deleteModalHidden = this.deleteModalHidden.bind(this)
        this.deleteButtonClicked = this.deleteButtonClicked.bind(this)
        this.makeDeleteRequesttoServer = this.makeDeleteRequesttoServer.bind(this)

    }

    componentDidMount(){
        try{
            this.getUsersFromDB()
        }catch(e)
        {
            toast(e.message)
            logVar(e, "ManageUsers:componentDidMount")
        }
    }

    async getUsersFromDB()
    {
        const url_api=getAPIURL()+"admin/getusers"
        const authorisationData=await getAuthenticationHeadersforUser()
    
        const requestOptions =
        {
            method: 'GET',
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData}),
    
        }
    
             fetch(url_api, requestOptions)
            .then(response =>{
                return response.json()
            } )
            .then((body) =>{

                var message = getMessageFromAPIResponse(body)

                if(varNotEmpty(body) && varNotEmpty(body.success))
                {
                    var userTable= []
                    if(Array.isArray(message) && message.length>0)
                    {
                        userTable.push(<p key="TOTAL_USER_COUNT"><b>{this.i18next.t("TOTAL")+": "+message.length}</b></p>)

                        for(const i in message)
                        {
                            var isAdmin= message[i].level=="1" ? this.i18next.t("YES"):this.i18next.t("NO")
                            var deleteButton = message[i].level=="1" ?  null:  <AiOutlineDelete onClick={()=>this.deleteButtonClicked(message[i].users_id)} />
                            var row=(
                                <Row key={i+"_USER_LIST_NAME"} style={{ flex:1, alignItems:"center",  marginBottom:20, padding:20, border:"1px solid black", borderRadius: 10}}>
                                    <Col sm={9}>
                                    <p><b>{this.i18next.t("USERNAME")}</b>: {message[i].username}</p>
                                    <p><b>{this.i18next.t("EMAIL")}</b>: {message[i].email}</p>
                                    <p><b>{this.i18next.t("CREATED_ON")}</b>: {moment.unix(message[i].created).toString()}</p>
                                    <p><b>{this.i18next.t("ADMIN")}</b>: {isAdmin}</p>

                                    </Col>
                                    <Col sm={3} style={{color: "red"}}>
                                   
                                        {deleteButton}
                                    </Col>

                                </Row>
                            )
                            userTable.push(row)
                        }

                    }else{
                        userTable = this.i18next.t("NOTHING_TO_SHOW")
                    }

                    this.setState({userTable: userTable})
                }else{
                    console.log(body)
                    toast.error(message)
                }
            })

    }
    deleteButtonClicked(id)
    {
        this.setState({userIDToDelete: id, showDeleteModal:true})
    }
    deleteModalHidden(){
        this.setState({userIDToDelete: '', showDeleteModal:false})

    }
    async makeDeleteRequesttoServer()
    {
        const url_api=getAPIURL()+"admin/deleteuser?userid="+this.state.userIDToDelete
        const authorisationData=await getAuthenticationHeadersforUser()
    
        const requestOptions =
        {
            method: 'DELETE',
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData}),
    
        }
    
             fetch(url_api, requestOptions)
            .then(response =>{
                return response.json()
            } )
            .then((body) =>{
                if(varNotEmpty(body) && varNotEmpty(body.success) && body.success==true)
                {
                    toast.success(this.i18next.t("DELETE_OK"))
                    
                    try{
                        this.getUsersFromDB()
                    }catch(e)
                    {
                        toast(e.message)
                        logVar(e, "ManageUsers:componentDidMount")
            
                    }

                }else{
                    var message = getMessageFromAPIResponse(body)
                    toast.success(this.i18next.t(message))
                    console.log(body)

                }

                this.setState({isSubmitting: false, showDeleteModal: false })

            })

    }
    render(){

        var button = this.state.isSubmitting ? (<Loading centered={true} />) :(<>            <Button variant="secondary" onClick={this.deleteModalHidden}>
        {this.i18next.t("BACK")}
        </Button>
        <Button variant="danger" onClick={this.makeDeleteRequesttoServer}>
        {this.i18next.t("DELETE")}
        </Button>
</>)
        return(
            <div style={{background: BACKGROUND_GRAY, padding: 20}}>
            <h3>{this.i18next.t("USERS")}</h3>
            {this.state.userTable}
            <Modal show={this.state.showDeleteModal} onHide={this.deleteModalHidden}       centered>
            <Modal.Header closeButton>
            <Modal.Title>{this.i18next.t("DELETE")+"?"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{this.i18next.t("DELETE_USER_CONFIRMATION")}</Modal.Body>
            <Modal.Footer>
                {button}
            </Modal.Footer>
        </Modal>
            </div>
        )
    }
}