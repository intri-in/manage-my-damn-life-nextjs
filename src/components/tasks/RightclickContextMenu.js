
import { getI18nObject } from '@/helpers/frontend/general';
import { categoryArrayHasMyDayLabel } from '@/helpers/frontend/labels';
import {  ContextMenu, ContextMenuItem } from 'rctx-contextmenu';
import { AiOutlineEdit, AiOutlinePlusCircle } from "react-icons/ai";
import { BsFillSunriseFill } from 'react-icons/bs';

export function RightclickContextMenu(props)
{



  var myDayItem=( <ContextMenuItem data={{relatedto: props.id}}  onClick={()=>props.onAddtoMyday(props.id)}>
  <BsFillSunriseFill /> &nbsp; Add to My Day
</ContextMenuItem>)
  if(props.category!=null && Array.isArray(props.category))
  {
    if(categoryArrayHasMyDayLabel(props.category))
    {
      myDayItem=(
        <ContextMenuItem data={{relatedto: props.id}}  onClick={()=>props.removeFromMyDay(props.id)}>
          <BsFillSunriseFill /> &nbsp; Remove from My Day
        </ContextMenuItem>)
  
    }
  }

  var i18next = getI18nObject()
  return(                
    <ContextMenu style={{background: "white", padding:5,border:"1px solid black"}} id={props.id}>
              <ContextMenuItem  onClick={()=>props.onEditTask(props.id)} >
            <AiOutlineEdit />  &nbsp;  {i18next.t("EDIT")}        
        </ContextMenuItem>

        <ContextMenuItem  data={{relatedto: props.id}} onClick={()=>props.onAddSubtask(props.id)} >
            <AiOutlinePlusCircle />  &nbsp;  Add Subtask        
        </ContextMenuItem>
        {myDayItem}
      </ContextMenu>
  )
}