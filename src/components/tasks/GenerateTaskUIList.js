import { Component } from "react";
import { getRandomColourCode, dueDatetoUnixStamp, ISODatetoHuman, timeDifferencefromNowinWords, getI18nObject } from '../../helpers/frontend/general';
import Chip from '@mui/material/Chip';
import * as React from 'react';
import { getLabelColourFromDB, saveLabeltoDB } from '../../helpers/frontend/labels';
import { sortTaskListbyDue } from '@/helpers/frontend/tasks';
import TaskUI from './TaskUI';
import { getRandomString } from '@/helpers/crypto';
import Collapse from 'react-bootstrap/Collapse';
import { TaskWithFilters } from './TaskWithFilters';
import { logError, varNotEmpty } from "@/helpers/general";
import { majorTaskFilter } from "@/helpers/frontend/events";
import { TaskPending } from "@/helpers/api/tasks";
import { Loading } from "../common/Loading";
export default class GenerateTaskUIList extends Component{
    constructor(props)
    {
        super(props)
        
        this.i18next=getI18nObject()
        this.state={collapsed: props.collapsed, showDone:false, output: <Loading centered={true} padding={10}  />}
        this.collapseButtonClicked= this.collapseButtonClicked.bind(this)
        this.getTaskstoRender = this.getTaskstoRender.bind(this)
        this.renderTasks = this.renderTasks.bind(this)
    }

    componentDidMount(){
        this.setState({showDone: this.props.showDone, })
        //this.renderTasks(false)

    }

    renderTasks()
    {
        var output = this.getTaskstoRender(this.state.showDone)
        this.setState({output: output})
    }

    componentDidUpdate(prevProps, prevState)
    {

        var same = true
        if(varNotEmpty(prevProps.collapsed))
        {
            for (const i in prevProps.collapsed){
                if(prevProps.collapsed[i].collapsed!=this.props.collapsed[i].collapsed)
                {
                    same =false
                    break;
                }
            }
            if(same==false)
            {
                this.setState({collapsed: this.props.collapsed})
            }
        }

        if(prevProps.showDone!=this.props.showDone)
        {
            this.setState({showDone: !prevState.showDone})

        }
        // try{
        //     if(JSON.stringify(this.props)===JSON.stringify(prevProps))
        //     {
        //         this.renderTasks()
        //     }

        // }catch(e)
        // {
        //     console.error("GenerateTaskUIList.componentDidUpdate", e)
        // }

    }
    collapseButtonClicked(key)
    {

        
        //This doesn't work and I have no idea why.

        /*
        this.setState(function (previousState, currentProps){
            if(previousState.collapsed[key]!=undefined && varNotEmpty(previousState.collapsed[key]))
            {
                var newCollapsed = previousState.collapsed
                var collapsedValue = !previousState.collapsed[key].collapsed
                newCollapsed[key].collapsed={collapsed: collapsedValue}            
                return({collpased: newCollapsed})

            }
            
    
        })
        */
       /*
        //This works and I have no idea why. The collapse is choopy, but hey it works. 
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
        */

        // Now we raise the state, and deal with collapse in parent component.
        this.props.collapseButtonClicked(key)

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

    getTaskstoRender(){
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
            var pending = TaskPending(todoList[1][key].todo) 
            var hardFilter= todoList[1][key].todo.summary!=null && todoList[1][key].todo.summary!=undefined && (todoList[1][key].todo.deleted == null || todoList[1][key].todo.deleted == "")
            var showTask = false
            const showDone= this.state.showDone
            if(showDone)
            {
                showTask=true
             
            }else{
                if(pending)
                {
                    showTask = true

                }
            }
        if(hardFilter && showTask)
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
                if(this.state.collapsed!=undefined && this.state.collapsed[key]!=undefined)
                {
                    var  collapsed=this.state.collapsed[key].collapsed
                }else{
                    var collapsed=false
                }

                listitem=(
                <div key={key}  style={{marginTop: marginTop}}> <TaskUI scheduleItem={this.props.scheduleItem} id={key} key={key} collapseButtonClicked={this.collapseButtonClicked} collapsed={collapsed} hasChildren={hasChildren} unparsedData={todoList[2]} data={todoList[1][key].todo} todoList={todoList} fetchEvents={this.props.fetchEvents}  title={todoList[1][key].todo.summary} dueDate={dueDate} dueDateinWords="Words" level={level} priority={todoList[1][key].todo.priority} listColor={listColor} completion={todoList[1][key].todo.completion} labels={todoList[1][key].todo.category}/>
                </div>
                )
                tempToReturn.push(listitem)
                if (list[i].length> 2) {
                    if(collapsed==false)
                    {
        
                        listitem=( <GenerateTaskUIList showDone={this.state.showDone} collapseButtonClicked={this.props.collapseButtonClicked} collapsed={this.state.collapsed} scheduleItem={this.props.scheduleItem} collpased={this.state.collapsed} key={"SUBLIST_"+key} fetchEvents={this.props.fetchEvents} list={list[i][2]} todoList={todoList} level={level} context={context} listColor={listColor} />)
                        tempToReturn.push(listitem)
            
                    }
                    
        
                }
                toReturn.push(tempToReturn)
    
        
            }
    
        }

        if (toReturn != [] && toReturn.length>0) {
            
            return( <div style={{marginBottom: 5}}>
    
                {toReturn}
    
            </div>) 
    
        }else{
            if(level==0)
            {
                return(<p style={{margin: 20}}>{this.i18next.t("NOTHING_TO_SHOW")}</p>)

            }
        }

    }
    render(){
        var output = this.getTaskstoRender()
        return(output )
    }
}