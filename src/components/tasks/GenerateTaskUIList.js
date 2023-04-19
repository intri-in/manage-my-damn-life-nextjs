import { Component } from "react";
import { getRandomColourCode, dueDatetoUnixStamp, ISODatetoHuman, timeDifferencefromNowinWords } from '../../helpers/frontend/general';
import Chip from '@mui/material/Chip';
import * as React from 'react';
import { getLabelColourFromDB, saveLabeltoDB } from '../../helpers/frontend/labels';
import { sortTaskListbyDue } from '@/helpers/frontend/tasks';
import TaskUI from './TaskUI';
import { getRandomString } from '@/helpers/crypto';
import Collapse from 'react-bootstrap/Collapse';
import { TaskWithFilters } from './TaskWithFilters';
import { varNotEmpty } from "@/helpers/general";
import { majorTaskFilter } from "@/helpers/frontend/events";
export default class GenerateTaskUIList extends Component{
    constructor(props)
    {
        super(props)
        var newCollapsed={}
        for (const i in props.todoList[1]) {
            newCollapsed[i]={collapsed: false}
        }
    
        

        this.state={collapsed: newCollapsed}
        this.collapseButtonClicked= this.collapseButtonClicked.bind(this)
    }

    componentDidMount(){
    }

    collapseButtonClicked(key)
    {

        if(this.state.collapsed[key]!=undefined)
        {
            var newCollapsed = this.state.collapsed
            
            if(this.state.collapsed[key].collapsed==true)
            {
                newCollapsed[key].collapsed=false

            }else{
                newCollapsed[key].collapsed=true

            }
        
            this.setState({collpased: newCollapsed})
        

        }
        
        
    }
    checkifTaskCollapsed(key)
    {
            var collapsed= this.state.collapsed[key].collapsed

            if(collapsed==null)
            {
                return false
            }
            return this.state.collapsed[key].collapsed
     
    }
    countValidChildren(childrenList)
    {
        var children =0
        var todoList= this.props.todoList
        if(varNotEmpty(childrenList) && Array.isArray(childrenList) && childrenList.length>0)
        {
            for(const i in childrenList)
            {
                var key =childrenList[i][0]
                //console.log(key)
               
                if( varNotEmpty(this.props.todoList[1][key]) && (todoList[1][key].todo.completed==null || todoList[1][key].todo.completed=="") && todoList[1][key].todo.completion!="100"&&todoList[1][key].todo.summary!=null && todoList[1][key].todo.summary!=undefined && (todoList[1][key].todo.deleted == null || todoList[1][key].todo.deleted == ""))
                {
                    children+=1
                }

            }
        }

        return children

    }
    render(){
        var list = this.props.list
        var todoList= this.props.todoList
        var level = this.props.level
        var context = this.props.context
        var listColor = this.props.listColor
    //function recursivelyGetListItemforTask(list, todoList, level, context, filter, listColor) {
        var toReturn = []
        level++
        for (const i in list) {
            var key = list[i][0]
            
            if(key=="undefined" || key==null || key==undefined || key=="")
            {
                continue;
            }
        if((todoList[1][key].todo.completed==null || todoList[1][key].todo.completed=="")&& todoList[1][key].todo.completion!="100"&&todoList[1][key].todo.summary!=null && todoList[1][key].todo.summary!=undefined && (todoList[1][key].todo.deleted == null || todoList[1][key].todo.deleted == ""))
            {
                var listitem = null
                var pl = 4 * level
                var tempToReturn = []
                var dueDate = ISODatetoHuman(todoList[1][key].todo.due)
                var timeDifference = timeDifferencefromNowinWords(dueDate)
                var secondaryText=""
                if(dueDate!=null && dueDate!="")
                {
                    secondaryText = dueDate+" "+timeDifference
                }
               
                var marginTop=5
                if(level!=0)
                {
                    marginTop=0
                }
                var noOfChildren= 0
                
                if (list[i].length> 2) {
                    noOfChildren = this.countValidChildren(list[i][2])
                }
                var hasChildren=false
                if (noOfChildren> 0) {
                    hasChildren=true
                }
    
                var collapsed=this.state.collapsed[key].collapsed
                listitem=(
                <div key={key}  style={{marginTop: marginTop}}> <TaskUI scheduleItem={this.props.scheduleItem} id={key} key={key} collapseButtonClicked={this.collapseButtonClicked} collapsed={collapsed} hasChildren={hasChildren} unparsedData={todoList[2]} data={todoList[1][key].todo} todoList={todoList} fetchEvents={this.props.fetchEvents}  title={todoList[1][key].todo.summary} dueDate={dueDate} dueDateinWords="Words" level={level} priority={todoList[1][key].todo.priority} listColor={listColor} completion={todoList[1][key].todo.completion} labels={todoList[1][key].todo.category}/>
                    </div>
                )
                tempToReturn.push(listitem)
                if (list[i].length> 2) {
                    if(this.state.collapsed[key].collapsed==false)
                    {
        
                        listitem=( <GenerateTaskUIList scheduleItem={this.props.scheduleItem} collpased={this.state.collapsed} key={"LIST_"+key} fetchEvents={this.props.fetchEvents} list={list[i][2]} todoList={todoList} level={level} context={context} listColor={listColor} />)
                        tempToReturn.push(listitem)
            
                    }
                    
        
                }
                toReturn.push(tempToReturn)
    
        
            }
    
        }
        if (toReturn != []) {
            
            return (<div key={getRandomString(5)} style={{marginBottom: 5}}>
    
                {toReturn}
    
            </div>)
    
        }
    
    }
}