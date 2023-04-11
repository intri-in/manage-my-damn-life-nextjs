import { getRandomColourCode, dueDatetoUnixStamp, ISODatetoHuman, timeDifferencefromNowinWords } from '../../helpers/frontend/general';
import Chip from '@mui/material/Chip';
import * as React from 'react';
import { getLabelColourFromDB, saveLabeltoDB } from '../../helpers/frontend/labels';
import { sortTaskListbyDue } from '@/helpers/frontend/tasks';
import TaskUI from './TaskUI';
import { getRandomString } from '@/helpers/crypto';
import Collapse from 'react-bootstrap/Collapse';
import { TaskWithFilters } from './TaskWithFilters';
import GenerateTaskUIList from './GenerateTaskUIList';
import GanttView from './GanttView';
export function TaskView(props)
{
    var sortedList = sortTaskListbyDue(props.todoList[0],props.todoList)
    var view=props.view

    if(props.view==undefined || props.view=="" || props.view==null)
    {
        view ="tasklist"
    }
   // const output_list = recursivelyGetListItemforTask(sortedList, props.todoList, -1, props.context, props.filter, props.listColor )
   if(view=="tasklist")
   {
    if(props.filter!=null && props.filter!={} && Object.keys(props.filter).length>0)
    {
     var output_list=(
        
        <GenerateTaskUIList fetchEvents={props.fetchEvents} list={sortedList} todoList={props.todoList} level={-1} context={props.context} listColor={props.listColor}  />)
     
    } 
    else
    {
     var output_list=(
         <><TaskWithFilters fetchEvents={props.fetchEvents} list={sortedList} todoList={props.todoList} level={-1} context={props.context}  listColor={props.listColor} />
       </>)
 
    }
   }
   else if (view=="ganttview")
   {
       var output_list=(<GanttView fetchEvents={props.fetchEvents} list={sortedList} todoList={props.todoList} />)
   }
   

   var output = output_list

    return output
}

export function RecursivelyGetListItemforTask(props) {
    var list = props.list
    var todoList= props.todoList
    var level = props.level
    var context = props.context
    var listColor = props.listColor
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
            var hasChildren=false
            if (list[i].length > 2) {
                hasChildren=true
            }
            const [collapsed, collapseButtonClicked] = React.useState(false);

            listitem=(
            <div key={key}  style={{marginTop: marginTop}}> <TaskUI key={key} collapseButtonClicked={()=>collapseButtonClicked(!collapsed)} collapsed={collapsed} hasChildren={hasChildren} unparsedData={todoList[2]} data={todoList[1][key].todo} todoList={todoList} fetchEvents={props.fetchEvents}  title={todoList[1][key].todo.summary} dueDate={dueDate} dueDateinWords="Words" level={level} priority={todoList[1][key].todo.priority} listColor={listColor} completion={todoList[1][key].todo.completion} labels={todoList[1][key].todo.category}/>
                </div>
            )
            tempToReturn.push(listitem)
            if (list[i].length > 2) {
                if(collapsed==false)
                {
    
                    listitem=( <RecursivelyGetListItemforTask key={"LIST_"+key} fetchEvents={props.fetchEvents} list={list[i][2]} todoList={todoList} level={level} context={context} listColor={listColor} />)
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


