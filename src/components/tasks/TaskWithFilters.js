import { Component } from "react";
import Dropdown from 'react-bootstrap/Dropdown';
import { Button, Col, Form, Row } from "react-bootstrap";
import { PRIMARY_COLOUR, SECONDARY_COLOUR } from "@/config/style"
import { t } from "i18next";
import { applyTaskFilter } from "@/helpers/frontend/events";
import GenerateTaskUIList from "./GenerateTaskUIList";
import { MdCancel } from "react-icons/md";
import { SYSTEM_DEFAULT_LABEL_PREFIX } from "@/config/constants";
import { getI18nObject } from "@/helpers/frontend/general";
export class TaskWithFilters extends Component{
    constructor(props)
    {
        super(props)
        this.i18next= getI18nObject()
        this.state ={list: this.props.list, isFiltered: false, taskList: null, showAllChecked:false}
        this.getLabels = this.getLabels.bind(this)
        this.childlessList
        this.filterByLabelClicked = this.filterByLabelClicked.bind(this)
        this.recursivelyFilterTask = this.recursivelyFilterTask.bind(this)
        this.removeFilter = this.removeFilter.bind(this)
        this.setLabelMenu = this.setLabelMenu.bind(this)
        this.showAllChanged= this.showAllChanged.bind(this)
    }

    componentDidMount(){
     
     if(this.state.isFiltered==false) 
     {
      this.setLabelMenu()

      }
     
    }

    showAllChanged(e)
    {
      
      this.setState({showAllChecked: e.target.checked})
    }
    setLabelMenu()
    {
      var labelList = this.getLabels(this.props.list, [])
      if(Array.isArray(labelList) && labelList.length>0)
      {
        var outputArray=[]
        for (const i in labelList)
        {
          outputArray.push( <Dropdown.Item id={labelList[i]} onClick={this.filterByLabelClicked} value={labelList[i]} key={"labelarray_"+labelList[i]} >{labelList[i]}</Dropdown.Item>)
        }

        /*
        this.setState({labelMenu: (      
          <Row style={{justifyContent: 'center', display: 'flex',}} >
        <Col >
          Filter by:
        </Col>
        <Col >
        <Dropdown>
          <Dropdown.Toggle size="sm" variant="info" id="dropdown-basic">
          By Label
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {outputArray}
          </Dropdown.Menu>
          </Dropdown> 
        </Col>      
        </Row>)})
        */
        this.setState({labelMenu: (      
          <span style={{justifyContent: 'center', display: 'flex', alignItems: "center"}} >
          Filter by:&nbsp;
        <Dropdown>
          <Dropdown.Toggle size="sm" variant="info" id="dropdown-basic">
          By Label
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {outputArray}
          </Dropdown.Menu>
          </Dropdown> 
          </span>)})
      }
    }
    filterByLabelClicked(e)
    {
      var newList = [] 
      var filter= {logic: "or", filter:{label: [e.target.id]}}
      this.recursivelyFilterTask(this.props.list, filter,  newList)

      var appliedFilters=(<span style={{justifyContent: 'center', display: 'flex', alignItems: "center"}}>Filtered by Label: <Button style={{justifyContent:"center", display: 'flex', alignItems: "center", margin:10}} variant="outline-danger" size="sm" onClick={this.removeFilter}>{e.target.id} <MdCancel size={12} /> </Button></span>
        
      )
      this.setState({list: newList, appliedFilters: appliedFilters, labelMenu:null, isFiltered: true})
    }
    removeFilter()
    {
      this.setState({list: this.props.list,appliedFilters:null })
      this.setLabelMenu()
    }
    recursivelyFilterTask( list, filter, filteredArray)
    {
      for(const i in list)
      {
        var key = list[i][0]
       

        var todo=this.props.todoList[1][key].todo
        if(applyTaskFilter(todo, filter))
        {
          var task=[]
          task.push(key)
          task.push(null)
          filteredArray.push(task)
          if(list[i].length>2 )
          {
            this.recursivelyFilterTask(list[i][2], filter, filteredArray)
            
          }
        
        }
        else
        {
          if(list[i].length>2 && list[i][2].length>0)
          {
            this.recursivelyFilterTask(list[i][2], filter, filteredArray)
          }
        }

      }

    }
    getLabels(list, labelList)
    {
      if(this.props.list!=null)
      {
        for(const i in list)
        {
          var key = list[i][0]
          if(key=="undefined" || key==null || key==undefined || key=="")
          {
              continue;
          }
          if(this.props.todoList[1][key].todo.category!=null && Array.isArray(this.props.todoList[1][key].todo.category) )
          {
            for(const k in this.props.todoList[1][key].todo.category)
            {
              if(this.labelisinArray(this.props.todoList[1][key].todo.category[k], labelList)==false && this.props.todoList[1][key].todo.category[k].startsWith(SYSTEM_DEFAULT_LABEL_PREFIX)==false)
              {
                labelList.push(this.props.todoList[1][key].todo.category[k])
              }
            }
          }
          if (list[i].length > 2) {
            this.getLabels(list[i][2], labelList)
          }

        }
      }
      return labelList
    }
    labelisinArray(label, arrayLabel)
    {
      var found=false
      for (const i in arrayLabel)
      {
        if(arrayLabel[i]==label)
        {
          return true
        }
      }
      return found
    }
    render(){
      var borderBottom = "3px solid "+SECONDARY_COLOUR
      return(
      <>
    
        <Row>
          <Col>
          {this.state.labelMenu}
          </Col>
          <Col>
              <Form.Check 
            type="switch"
            checked={this.state.showAllChecked}
            onChange={this.showAllChanged}
            label={this.i18next.t("SHOW_DONE_TASKS")}
          />          
          </Col>
        </Row>
      
      {this.state.appliedFilters}
      <GenerateTaskUIList showDone={this.state.showAllChecked} collapseButtonClicked={this.props.collapseButtonClicked} collapsed={this.props.collapsed} fetchEvents={this.props.fetchEvents} list={this.state.list} todoList={this.props.todoList} level={-1} context={this.props.context} listColor={this.props.listColor}  />      </>
        )
    }
}