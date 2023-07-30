import { SECONDARY_COLOUR } from "@/config/style"
import Head from "next/head"
import { withRouter } from "next/router"
import { Component } from "react"
import { Alert, Button, Col, Form, Row } from "react-bootstrap"
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import Accordion from 'react-bootstrap/Accordion';
import moment from "moment"
import { Loading } from "@/components/common/Loading"
import { getLabelsFromServer } from "@/helpers/frontend/labels"
import { isValid } from "js-base64"
import { isValidResultArray, varNotEmpty } from "@/helpers/general"
import { Toastify } from "@/components/Generic"
import { toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import { checkifFilterValid, filterDueIsValid, getFilterReadytoPost, makeFilterEditRequest, saveFiltertoServer } from "@/helpers/frontend/filters"
import { getI18nObject } from "@/helpers/frontend/general"
import { filtertoWords } from "@/helpers/frontend/filters"
class AddFilters extends Component {

    constructor(props)
    {
        super(props)
        this.i18next = getI18nObject()

        this.state={output: null, filterResult: [], filterbyDueChecked: false, dueDateFrom:null, dueDateBefore: null, selectedFilters: {logic : "and", filter: {due: ["", ""], label:[], priority:""}}, filterResultinWords:"", filterbyLabelChecked:false, labelNamesChecklist: <Loading /> ,filterbyPriority : false, priorityValue: "", filternameInvalid: false, filterName:"", isSubmitting: false, filterLogic: "and", filterbyLabelCheckList : {}, labelList: [] }
        this.filterbyDueChanged = this.filterbyDueChanged.bind(this)
        this.dueFromDateChanged = this.dueFromDateChanged.bind(this)
        this.dueBeforeDateChanged = this.dueBeforeDateChanged.bind(this)
        this.getFilterResult = this.getFilterResult.bind(this)
        this.filterbyLabelCheckboxChanged = this.filterbyLabelCheckboxChanged.bind(this)
        this.onClickLabelName = this.onClickLabelName.bind(this)
        this.filterbyPriorityCheckboxChanged = this.filterbyPriorityCheckboxChanged.bind(this)
        this.priorityMinimumSelected = this.priorityMinimumSelected.bind(this)
        this.logicOptionSelected = this.logicOptionSelected.bind(this)
        this.submitFilterToServer = this.submitFilterToServer.bind(this)
        this.onChangeFilterName = this.onChangeFilterName.bind(this)
        this.processIncomingProps = this.processIncomingProps.bind(this)
        this.dummyOnChange = this.dummyOnChange()
    }

    componentDidMount()
    {
        this.processIncomingProps()
    }
    processIncomingProps()
    {

        // If edit mode invoked, we process props and set values to fields as a filter is being updated.
        if(this.props.mode=="edit" && this.props.mode!=null && this.props.mode!=undefined)
        {
            //Set filter Name
            if(this.props.filterName!="" && this.props.filterName!=null && this.props.filterName!=undefined)
            {
                this.setState({filterName: this.props.filterName})
            }
            //Now we need to process the incoming filter.
            if(this.props.filter!=null && this.props.filter!=undefined){
                var newFilter = this.props.filter
                console.log("Incoming filter props", JSON.stringify(newFilter))
                if(filterDueIsValid(this.props.filter.filter.due) )
                {
                    //Filter has a due filter.

                    newFilter.filter.due[0]=new Date(this.props.filter.filter.due[0])
                    newFilter.filter.due[1]=new Date(this.props.filter.filter.due[1])
                    var dueFrom = new Date(this.props.filter.filter.due[0])
                    
                    var dueBefore= new Date(this.props.filter.filter.due[1])
                    this.setState({filterbyDueChecked: true, dueDateFrom: dueFrom, dueDateBefore: dueBefore})

                }else{
                    newFilter.filter.due=[]
                }

               
                if(varNotEmpty(this.props.filter.filter.label)==false)
                {
                  
                }

                
               

                if(this.props.filter.filter.label!=null && this.props.filter.filter.label!=undefined && Array.isArray(this.props.filter.filter.label) && this.props.filter.filter.label.length>0 )
                {
                    
                    this.setState({filterbyLabelChecked: true,  })

                }else{
                    newFilter.filter.label=[]
                }

                if(this.props.filter.filter.priority!=null && this.props.filter.filter.priority!=undefined && this.props.filter.filter.priority!="")
                {
                    this.setState({filterbyPriority: true, priorityValue: this.props.filter.filter.priority})

                }else{
                    newFilter.filter.priority=""

                }

                if(this.props.filter.logic!=null && this.props.filter.logic!=undefined )
                {
                    this.setState({filterLogic:  this.props.filter.logic})

                }
                

                this.setState({selectedFilters:newFilter})

            }
    
        }

        this.generateLabelCheckList()


    }
    onChangeFilterName(e)
    {
        this.setState({filterName: e.target.value})
    }
    dummyOnChange()
    {

    }
    async generateLabelCheckList()
    {
        var labels = await getLabelsFromServer()
        var results=[]
        var filterbyLabelCheckList = {}
        if(isValidResultArray(labels))
        {

            for(const i in labels)
            {
                var checked = false
                if(this.state.selectedFilters.filter.label!= null )
                {
                    
                    for (const k in this.state.selectedFilters.filter.label)
                    {
                        if(this.state.selectedFilters.filter.label[k]==labels[i].name)
                        {
                            checked=true
        
                        }
                    }

    
                }
                results.push(          
                    <Form.Check
                    inline
                    onClick={this.onClickLabelName}
                    key={i+"_"+labels[i].name}
                    label={labels[i].name}
                    id={labels[i].name}
                    checked={checked}
                    onChange={this.dummyOnChange}
                  />)


                filterbyLabelCheckList[labels[i]]={checked: checked}
            }
        }

        this.setState({filterbyLabelCheckList: filterbyLabelCheckList})
        if(isValidResultArray(labels))
        {

            for(const i in labels)
            {

        
            }
        }


        this.setState({labelNamesChecklist: (<div style={{padding: 5}}>{results}</div>)})
    }
    logicOptionSelected(e)
    {
        this.setState({filterLogic: e.target.value})
        this.setState(function(previousState, currentProps) {

            var newFilters= previousState.selectedFilters
            newFilters.logic=e.target.value
            return({selectedFilters: newFilters, filterResultinWords: this.getFilterResult()})

        })
    }
    onClickLabelName(e)
    {
        this.setState(function(previousState, currentProps) {
            var labels = previousState.selectedFilters.filter.label

            if(e.target.checked==true)
            {
                //Check if it is in array already. If not add.
                var found = false
                for (const i in labels)
                {
                    if(labels[i]==e.target.id)
                    {
                        found = true
                    }
                }

                if(found==false)
                {
                    labels.push(e.target.id)

                }
                var newFilters= previousState.selectedFilters
                newFilters.filter["label"]=labels
                return({selectedFilters: newFilters, filterResultinWords: this.getFilterResult()})
            }
            else
            {
                //Check if it is in array already. If yes, remove it.
                var found = false
                var newLables=[]
                for (const i in labels)
                {
                    if(labels[i]!=e.target.id)
                    {
                        newLables.push(labels[i])
                    }
                }

                var newFilters= previousState.selectedFilters
                newFilters.filter["label"]=newLables
                return({selectedFilters: newFilters, filterResultinWords: this.getFilterResult()})
                
            }

            
        })

        this.generateLabelCheckList()
    }

    filterbyDueChanged(e)
    {
        var filter= this.state.selectedFilters
        if(e.target.checked==false)
        {
                //remove due array values
                filter.filter.due[0]=""
                filter.filter.due[1]=""
        }
        this.setState({filterbyDueChecked: e.target.checked,filterResultinWords: this.getFilterResult(),selectedFilters:filter, dueDateBefore:"", dueDateFrom:"" })
    }

    filterbyPriorityCheckboxChanged(e)
    {
        this.setState(function(previousState, currentProps) {
            var newFilters= previousState.selectedFilters

            if(e.target.checked==false)
            {
                newFilters.filter["priority"]=""
    
            }
            return({filterbyPriority: e.target.checked,filterResultinWords: this.getFilterResult(), selectedFilters: newFilters })

        })
        

    }
    priorityMinimumSelected(e)
    {
        var context = this
        this.setState({priorityValue: e.target.value})
        if(e.target.value!=0)
        {
            this.setState(function(previousState, currentProps) {

                var newFilters= previousState.selectedFilters
    
    
                newFilters.filter["priority"]=e.target.value
                
    
                return({dueDateFrom: e._d, selectedFilters: newFilters, filterResultinWords: context.getFilterResult()})
                }
            )
    
        }
        

    }
    dueFromDateChanged(e)
    {
        var context = this
        this.setState(function(previousState, currentProps) {

            var due= previousState.selectedFilters.filter.due
            due[0]=e._d

            var newFilters=previousState.selectedFilters
            newFilters.filter["due"]=due
            

            return({dueDateFrom: e._d, selectedFilters: newFilters, filterResultinWords: context.getFilterResult()})
            }
        )
        


    }

    dueBeforeDateChanged(e)
    {

        var context = this
        this.setState(function(previousState, currentProps) {

            var due= previousState.selectedFilters.filter.due
            due[1]=e._d

            var newFilters=previousState.selectedFilters
            newFilters.filter["due"]=due
            

            return({dueDateBefore: e._d, selectedFilters: newFilters, filterResultinWords: context.getFilterResult()})
            }
        )


    }

    filterbyLabelCheckboxChanged(e)
    {
        this.setState(function(previousState, currentProps) {
            var newFilters= previousState.selectedFilters
            newFilters.filter.label=[]

            return({filterbyLabelChecked: e.target.checked, selectedFilters:newFilters, filterResultinWords: this.getFilterResult() })
        })
        this.generateLabelCheckList()

    }
  
    getFilterResult()
    {
        var toReturnArray=[]
        var toReturnFinal = []
        var filter= this.state.selectedFilters
        if(filter.filter.due!= null && filter.filter.due!=undefined)
        {
            var dueBefore="End of the universe"
            var dueAfter ="Beginning of the universe"
            if(filter.filter.due[0]!="" && filter.filter.due[0]!=null)
            {
                dueAfter= moment(filter.filter.due[0]).format('DD/MM/YYYY HH:mm');
            }
            
            if(filter.filter.due[1]!="" && filter.filter.due[1]!=null )
            {
                dueBefore=moment(filter.filter.due[1]).format('DD/MM/YYYY HH:mm');
            }
    
    
            if(this.state.filterbyDueChecked)
            {
                toReturnArray.push(
                    <div>
                    &#123; DUE AFTER <small>{dueAfter.toString()}</small> AND DUE BEFORE <small>{dueBefore.toString()}</small> &#125;
                    </div>)
            
            }
    
    
        }



        if(filter.filter.label!=null && filter.filter.label!=undefined && filter.filter.label.length>0)
        {
            var labelString = []

            for(const j in filter.filter.label)
            {
                if(j!=0)
                {
                    labelString.push(" or ")
                }
                labelString.push(<i key={filter.filter.label[j]}>&nbsp;{filter.filter.label[j]}&nbsp;</i>)
               
    
            }
            
            toReturnArray.push(<>
            &#123; TASK HAS ANY OF THESE LABELS &#91; {labelString} &#93;  &#125;
            </>)
            
        }

        if(filter.filter.priority!="" && filter.filter.priority!=null && filter.filter.priority!=undefined)
        {
            toReturnArray.push(<div>
            &#123; TASK HAS A MINIMUM PRIORITY OF {filter.filter.priority}  &#125;

            </div>)
        }
        

        for (const i in toReturnArray)
        {
            if(i!=0 )
            {
                toReturnFinal.push(<div><br/><b>{filter.logic} </b><br/></div>)
            }
             toReturnFinal.push(toReturnArray[i])
            
        }
       

       return toReturnFinal
    }
    async submitFilterToServer(){

        

    
      if(this.state.filterName!="" && this.state.filterName!=null)
      {
        this.setState({filternameInvalid: false})

        // Name is valid. Proceed to submit.
        //Check if user has selected anything.
        //console.log(this.state.selectedFilters)

        if(checkifFilterValid(this.state.selectedFilters)==true )
        {
            if(this.props.filterid!=null && this.props.filterid!=undefined && this.props.filterid!="" && this.props.mode=="edit"    )
            {
                // Edit mode. Send an edit request.

                var response = await makeFilterEditRequest(this.props.filterid, this.state.filterName, getFilterReadytoPost(this.state.selectedFilters))


            }
            else
            {
                // New filter. Make an add request.
                var response = await saveFiltertoServer(this.state.filterName, getFilterReadytoPost(this.state.selectedFilters))

            }
    

            if(response!=null && response.success!=null && response.success==true)
            {
                this.props.onAdd(true)
    
            }else{
                if(response.data.message!=null)
                {
                    toast.error(this.i18next.t(response.data.message))

                }
                else{
                    toast.error(this.i18next.t("ERROR"))

                }
            }
    
        }else
        {
            toast.error(this.i18next.t("INVALID_FILTER_DETAILS"))
        }
      }
      else
      {
        toast.error(this.i18next.t("ENTER_VALID_FILTER_NAME"))
        this.setState({filternameInvalid: true})
      }
  
    }
    render(){
        var borderColor="1px solid "+SECONDARY_COLOUR
        var filterbyDueForm = null
        if(this.state.filterbyDueChecked != false && this.state.filterbyDueChecked !=null)
        {
            filterbyDueForm= (
            <>
            Due From
            <Datetime value={this.state.dueDateFrom} onChange={this.dueFromDateChanged} dateFormat="D/M/YYYY" timeFormat="HH:mm" closeOnSelect={true} />
            <br />
            Due Before
            <Datetime value={this.state.dueDateBefore} onChange={this.dueBeforeDateChanged} dateFormat="D/M/YYYY" timeFormat="HH:mm" closeOnSelect={true} />
            <br />
            </>
            ) 
        }

        var filterbyLabelForm=null
        if(this.state.filterbyLabelChecked !=false && this.state.filterbyLabelChecked!="")
        {
            filterbyLabelForm=(
                <>
                {this.state.labelNamesChecklist}
                </>
            )
        }
        var filterbyPriorityForm=null
        if(this.state.filterbyPriority !=false && this.state.filterbyPriority!="")
        {
            filterbyPriorityForm=(
                <>
                    <Form.Select value={this.state.priorityValue} onChange={this.priorityMinimumSelected} aria-label="Default select example">
                    <option value="0"></option>
                    <optgroup key="High" label="High">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </optgroup>
                    <optgroup key="Medium" label="Medium">
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                    </optgroup>
                    <optgroup  key="Low" label="Low">
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </optgroup>
                    </Form.Select>                
                    
                    </>
            )
        }

        var submitButton = this.state.isSubmitting ? (<div style={{textAlign: "center"}}><Loading /></div>) :(<Row  style={{textAlign: "center"}}>
            <Col>
            <Button variant="secondary" onClick={()=>this.props.onAdd(false)} >{this.i18next.t("BACK")}</Button>
            </Col><Col><Button onClick={this.submitFilterToServer} >{this.i18next.t("SAVE")}</Button></Col></Row>)

        var filterResultinWords=filtertoWords(this.state.selectedFilters)
        return (
            <>


            <div style={{border: borderColor, padding:20}}>
                <br />
                <p>{this.i18next.t("FILTER_NAME")}</p> 
                <Form onSubmit={this.handleSubmit}>
                    
                    <Form.Control value={this.state.filterName} onChange={this.onChangeFilterName} isInvalid={this.state.filternameInvalid} maxLength={30} required placeholder={this.i18next.t("ENTER_FILTER_NAME")} />
                <br />
                <p>{this.i18next.t("FILTER_LOGIC")}</p>  
                <Form.Select value={this.state.filterLogic}   onChange={this.logicOptionSelected} aria-label="Default select example">
                    <option value="and">AND</option>
                    <option value="or">OR</option>
                </Form.Select>
                <br />
                <Form.Check 
                        value={this.state.filterbyDueChecked}
                        checked={this.state.filterbyDueChecked}
                        type="switch"
                        label={this.i18next.t("FILTER_BY_DUE")}
                        onChange={this.filterbyDueChanged}
                        />
                <br />
                {filterbyDueForm}
                <Form.Check 
                        value={this.state.filterbyLabelChecked}
                        checked={this.state.filterbyLabelChecked}
                        type="switch"
                        label={this.i18next.t("FILTER_BY_LABEL")}
                        onChange={this.filterbyLabelCheckboxChanged}
                        />
                <br />
                {filterbyLabelForm}
                
                <Form.Check 
                        value={this.state.filterbyPriority}
                        checked={this.state.filterbyPriority}
                        type="switch"
                        label={this.i18next.t("FILTER_BY_MIN_PRIORITY")}
                        onChange={this.filterbyPriorityCheckboxChanged}
                        />
                <br />
                {filterbyPriorityForm}
                <br />
                <Alert variant="info"><b>{this.i18next.t("FILTER_RESULT")}</b> {this.i18next.t("FILTER_RESULT_DESC")} <br/ > <br/ > {filterResultinWords}</Alert>


                {submitButton}
                </Form>
                </div>

                      
                  
        
                {this.state.toast_placeholder}
            </>
          )
      
    }
  }

  export default withRouter(AddFilters)