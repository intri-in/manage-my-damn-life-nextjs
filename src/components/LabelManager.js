import { getI18nObject } from "@/helpers/frontend/general";
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user";
import { withRouter } from "next/router";
import { Component } from "react";
import { Badge, Button, Col, Row } from "react-bootstrap";
import { Loading } from "./common/Loading";
import { makeUpdateLabelRequest } from "@/helpers/frontend/labels";
import { SketchPicker } from 'react-color'
import { BACKGROUND_GRAY } from "@/config/style";
import reactCSS from 'reactcss'
import { toast } from "react-toastify";
import { Toastify, nothingToShow } from "./Generic";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { saveLabelArrayToCookie } from "@/helpers/frontend/settings";
import { getAPIURL } from "@/helpers/general";
class LabelManager extends Component{
    constructor(props)
    {
        super(props)
        this.state={labelTable: <Loading />, displayColorPicker: {}, color:{}, labels: {}, currentTarget: ""}
        this.i18next = getI18nObject()
        this.handleClick = this.handleClick.bind(this)
        this.getLabelTable = this.getLabelTable.bind(this)
        this.handleChangeofColor = this.handleChangeofColor.bind(this)
        this.updateLabels = this.updateLabels.bind(this)
    }

    
    componentDidMount()
    {
        this.getLabelsFromServer()
    }
    
    async updateLabels()
    {

        this.setState({labels: {}, displayColorPicker: {}, color:{}})
        var response = await makeUpdateLabelRequest().then((response) =>{
            this.getLabelsFromServer()

        })
    }
    handleChangeofColor = (selectedColor) =>
    {
        var colorArray = this.state.color
        colorArray[this.state.currentTarget] = selectedColor.hex
        this.setState({color: colorArray})
    }
    handleColorClose(labelName){
        var newdisplayColorPicker = this.state.displayColorPicker
        if(newdisplayColorPicker[labelName]==""||newdisplayColorPicker[labelName]==null || newdisplayColorPicker[labelName]==undefined )
        {
            newdisplayColorPicker[labelName] = false

        }else{
            newdisplayColorPicker[labelName] = !newdisplayColorPicker[labelName]

        }
        this.setState({displayColorPicker: newdisplayColorPicker, currentTarget:""})

       this.makeModifyLabelRequest(labelName, this.state.color[labelName])

    }

    async makeModifyLabelRequest(labelName, color)
    {
        const url_api=getAPIURL()+"labels/modifycolor"

        const authorisationData=await getAuthenticationHeadersforUser()
        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({"labelname":labelName, "colour": color}),
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData, 'Content-Type':'application/json'}),
        }
        
            fetch(url_api, requestOptions)
        .then(response => response.json())
        .then((body) =>{
            var message = getMessageFromAPIResponse(body)

            if(body!=null && body.success!=null && body.success==true)
            {
                toast.success(this.i18next.t(message))
            }else{
                if (message!=null)
                {
                    toast.error(this.i18next.t(message))
                }else{
                    toast.error(this.i18next.t("ERROR_GENERIC"))

                }
            }            
        }).catch(e=>
            {
                toast.error(this.i18next.t("ERROR_GENERIC"))
                console.error("makeModifyLabelRequest", e)
            }
        )

    
    }
    handleClick = (labelName) =>{

        var newdisplayColorPicker = this.state.displayColorPicker
        if(newdisplayColorPicker[labelName]==""||newdisplayColorPicker[labelName]==null || newdisplayColorPicker[labelName]==undefined )
        {
            newdisplayColorPicker[labelName] = true

        }else{
            newdisplayColorPicker[labelName] = !newdisplayColorPicker[labelName]

        }
        this.setState({displayColorPicker: newdisplayColorPicker, currentTarget:labelName})

    };
    async getLabelsFromServer()
    {
        const url_api=getAPIURL()+"caldav/calendars/labels"
        const authorisationData=await getAuthenticationHeadersforUser()
    
        const requestOptions =
        {
            method: 'GET',
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData}),
    
        }

        const response =  fetch(url_api, requestOptions)
        .then(response =>{
            return response.json()
        } )
        .then((body) =>{
            if(body!=null && body.success!=null)
            {
                if(body.success.toString()=="true")
                {
                    //Save the events to db.
                    var labels= body.data.message
                    if(labels!=null)
                    {   
                        saveLabelArrayToCookie(labels)
                        this.setState({labels: labels})
                        var displayColorPicker ={}
                        var color ={}
                        for (const key in labels)
                        {      

                            displayColorPicker[labels[key].name]=false
                            color[labels[key].name] = labels[key].colour
                        }
                        this.setState({displayColorPicker: displayColorPicker, color: color})

                    }
                        
                }else{
                    var message= getMessageFromAPIResponse(body)
                    if(message!=null)
                    {
                        if(message=="PLEASE_LOGIN")
                        {
                            // Login required
                            var redirectURL="/login"
                            if(window!=undefined)
                            {


                                redirectURL +="?redirect="+window.location.pathname
                            }
                            this.props.router.push(redirectURL)


                        }
                    }
                    else
                    {
                        toast.error(this.i18next.t("ERROR_GENERIC"))

                    }

                }

            }
            else{
                toast.error(this.i18next.t("ERROR_GENERIC"))

            }
          

        }).catch(e =>{
            console.error("getLabelsFromServer", e)
        })

    }
    getColorEditorModal()
    {

    }
    getLabelTable(){
        var labels= this.state.labels
        var temp_Labelcomponent=[]

        for (const key in labels)
        {      
            
            var border="1px solid "+this.state.color[labels[key].name]
                temp_Labelcomponent.push(<Row key={labels[key].name+"_ROW"} style={{background: BACKGROUND_GRAY, margin: 20, padding:20}}>
                    <Col><Badge key={labels[key].name} value={labels[key].name}  bg="light" pill  style={{margin: 5, borderColor:"pink", border:border, color: this.state.color[labels[key].name],  textDecorationColor : 'white'}} >{this.state.labels[key].name}</Badge></Col>
                    <Col>
                    <div style={{                    padding: '5px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
}} onClick={() =>this.handleClick(labels[key].name)}>
                        <div style={{background: this.state.color[labels[key].name],width: '36px', height: '14px', borderRadius: '2px',}}>
                        </div>
                    </div>
                    {
                            this.state.displayColorPicker[labels[key].name] ?
                            (<div key={labels[key].name+"_COLORPICKER"} style={{          position: 'absolute',
                            zIndex: '2',}}>                            

                                <div onClick={()=>this.handleColorClose(labels[key].name)}  style={{          position: 'fixed',
                                top: '0px',
                                right: '0px',
                                bottom: '0px',
                                left: '0px',}}></div>
                            <SketchPicker color={ this.state.color[labels[key].name]} onChange={this.handleChangeofColor} />

                            </div>
                            ):null
                        }

                    </Col>
                </Row>)

            
        }
        return temp_Labelcomponent
    }
    render(){
        return(
            <>
            <h1>{this.i18next.t("LABEL_MANAGER")}</h1>
            <br />
            <div style={{textAlign: "right"}}><Button size="sm" onClick={this.updateLabels}>{this.i18next.t("UPDATE_LABEL_CACHE")}</Button></div>
            <br />
            {this.getLabelTable()}
            {/*<Toastify /> */}
            </>
        )
    }
}

export default withRouter(LabelManager)