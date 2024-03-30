
import { getI18nObject } from '@/helpers/frontend/general';
import { categoryArrayHasMyDayLabel } from '@/helpers/frontend/labels';
import { isDarkModeEnabled } from '@/helpers/frontend/theme';
import { varNotEmpty } from '@/helpers/general';
import {  ContextMenu, ContextMenuItem } from 'rctx-contextmenu';
import { AiOutlineEdit, AiOutlinePlusCircle } from "react-icons/ai";
import { BsFillSunriseFill } from 'react-icons/bs';
import { MdSchedule } from 'react-icons/md';

export function RightclickContextMenu(props)
{
  const i18next = getI18nObject()

  let contextMenuItems=[]
contextMenuItems.push( <ContextMenuItem key="EDIT_TASK"  onClick={()=>props.onEditTask(props.id)} >
  <AiOutlineEdit />  &nbsp;  {i18next.t("EDIT")}        
</ContextMenuItem>
  )

  contextMenuItems.push(<ContextMenuItem  key="ADD_SUBTASK" data={{relatedto: props.id}} onClick={()=>props.onAddSubtask(props.id)} >
  <AiOutlinePlusCircle />  &nbsp;  {i18next.t("ADD_SUBTASK")}        
</ContextMenuItem>
)
  var myDayItem=( <ContextMenuItem    key="ADD_TO_MY_DAY" data={{relatedto: props.id}}  onClick={()=>props.onAddtoMyday(props.id)}>
  <BsFillSunriseFill /> &nbsp; {i18next.t("ADD_TO_MY_DAY")}
</ContextMenuItem>)
  if(props.category!=null && Array.isArray(props.category))
  {
    if(categoryArrayHasMyDayLabel(props.category))
    {
      myDayItem=(
        <ContextMenuItem data={{relatedto: props.id}} key="REMOVE_FROM_MY_DAY"  onClick={()=>props.removeFromMyDay(props.id)}>
          <BsFillSunriseFill /> &nbsp; {i18next.t("REMOVE_FROM_MY_DAY")}
        </ContextMenuItem>)
  
    }
  }

  contextMenuItems.push(myDayItem)

  if(varNotEmpty(props.scheduleItem))
  {
    contextMenuItems.push(  <ContextMenuItem  key="SCHEDULE_ITEM" onClick={()=>props.scheduleItem(props.data)}>
    <MdSchedule /> &nbsp; {i18next.t("SCHEDULE")}
  </ContextMenuItem>)

  }
  const backgroundColor = isDarkModeEnabled() ? "black": "white"
  return(                
    <ContextMenu  style={{backgroundColor:"yellow"}} key={"RIGHTCLICK_MENU_"+props.id} id={props.id}>
        <div style={{background:backgroundColor}}>
          {contextMenuItems}
        </div>

      </ContextMenu>
  )
}