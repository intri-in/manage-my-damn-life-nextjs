
import { MYDAY_LABEL } from '@/config/constants';
import { getEtagFromURL_Dexie, getEventFromDexieByID } from '@/helpers/frontend/dexie/events_dexie';
import { categoryArrayHasMyDayLabel, removeMyDayLabelFromArray } from '@/helpers/frontend/labels';
import { isDarkModeEnabled } from '@/helpers/frontend/theme';
import { useAtomValue, useSetAtom } from 'jotai';
import { ContextMenu, ContextMenuItem } from 'rctx-contextmenu';
import { useEffect, useState } from 'react';
import { AiOutlineEdit, AiOutlinePlusCircle } from "react-icons/ai";
import { BsFillSunriseFill } from 'react-icons/bs';
import { MdSchedule } from 'react-icons/md';
import { showTaskEditorAtom, taskEditorInputAtom } from 'stateStore/TaskEditorStore';
import { ParsedTask } from 'types/tasks/tasks';
import * as _ from 'lodash'
import { RRuleHelper } from '@/helpers/frontend/classes/RRuleHelper';
import { updateTodo_WithUI } from '@/helpers/frontend/tasks';
import { onServerResponse_UI } from '@/helpers/frontend/TaskUI/taskUIHelpers';
import { calDavObjectAtom, updateViewAtom } from 'stateStore/ViewStore';
import { eventEditorInputAtom, showEventEditorAtom } from 'stateStore/EventEditorStore';
import { returnGetParsedVTODO } from '@/helpers/frontend/calendar';
import { MdOutlineContentCopy } from "react-icons/md";
import moment from 'moment';
import { moveEventModalInput, showMoveEventModal } from 'stateStore/MoveEventStore';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
interface propsType {
  id: number | string,
  parsedTask: ParsedTask,
}
export function RightclickContextMenuWithState(props: propsType) {

  /**
   * Jotai
   */

  const setShowTaskEditor = useSetAtom(showTaskEditorAtom)
  const setTaskEditorInput = useSetAtom(taskEditorInputAtom)
  const setUpdateViewTime = useSetAtom(updateViewAtom)
  const setShowMoveEventModal = useSetAtom(showMoveEventModal)
  const calDavObject = useAtomValue(calDavObjectAtom)

  const showEventEditor = useSetAtom(showEventEditorAtom)
  const setEventEditorInput = useSetAtom(eventEditorInputAtom)
  const setMoveEventInput = useSetAtom(moveEventModalInput)
  const {t} = useTranslation()
  /**
   * Local State
   */
  const [eventID, setEventID] = useState(-1)
  const [calendar_id, setCalendarsID] =  useState(0)
  const [eventURL, setEventURL] = useState("")
  const [options, setOptions] = useState<JSX.Element[]>([])
  useEffect(() => {
    let isMounted = true
    if (isMounted) {
      if(props.id){
        let id=-1
        if(typeof(props.id)!=="number"){
          id=parseInt(props.id)
        }else{
          id=props.id
        }

        setEventID(id)

        getEventFromDexieByID(id).then(event =>{
          if(event && event.length>0){
            if(event[0].calendar_id)  setCalendarsID(parseInt(event[0].calendar_id?.toString()))
            if(event[0].url) setEventURL(event[0].url)
          }
        })
      }

      addItemsToMenu()
    
    }
    return () => {
        isMounted = false
    }
  }, [props.id, props.parsedTask])

  const addItemsToMenu = () =>{
      let contextMenuItems: JSX.Element[] = []

      contextMenuItems.push(<ContextMenuItem key="EDIT_TASK" onClick={() => onEditTask(props.id)} >
      <AiOutlineEdit />  &nbsp;  {t("EDIT")}
    </ContextMenuItem>
    )

    contextMenuItems.push(<ContextMenuItem key="ADD_SUBTASK" onClick={() => onAddSubtask(props.id)} >
      <AiOutlinePlusCircle />  &nbsp;  {t("ADD_SUBTASK")}
    </ContextMenuItem>
    )
    let myDayItem = (<ContextMenuItem key="ADD_TO_MY_DAY" onClick={() => onAddtoMyday()}>
      <BsFillSunriseFill /> &nbsp; {t("ADD_TO_MY_DAY")}
    </ContextMenuItem>)
    if (props.parsedTask.categories != null && Array.isArray(props.parsedTask.categories)) {
      if (categoryArrayHasMyDayLabel(props.parsedTask.categories)) {
        myDayItem = (
          <ContextMenuItem key="REMOVE_FROM_MY_DAY" onClick={() => removeFromMyDay()}>
            <BsFillSunriseFill /> &nbsp; {t("REMOVE_FROM_MY_DAY")}
          </ContextMenuItem>)

      }
    }

      contextMenuItems.push(myDayItem)

      contextMenuItems.push(<ContextMenuItem key="SCHEDULE_ITEM" onClick={() => scheduleItem()}>
        <MdSchedule /> &nbsp; {t("SCHEDULE")}
      </ContextMenuItem>)

      contextMenuItems.push(<ContextMenuItem key="COPY_MOVE" onClick={() => copyOrMoveItem()}>
      <MdOutlineContentCopy /> &nbsp; {t("COPY_MOVE")}
    </ContextMenuItem>)
      setOptions(contextMenuItems)
  }
  const onEditTask = (id) => {
    setTaskEditorInput({id: id
    })
    setShowTaskEditor(true)

  }
  const onAddSubtask = (id) => {
    // setShowTaskEditor(false)
    
    setTaskEditorInput({id: null,
      parentId: id,
      calendar_id:calendar_id
    })

    setShowTaskEditor(true)

  }
    
  
  const onAddtoMyday = async () => {
    let found =false
    let newCategoryArray: string[]=[]
    for(const i in props.parsedTask.categories){
      if (props.parsedTask.categories[i] == MYDAY_LABEL) {
        found = true
      }      
    }
    if(!found){
      if(props.parsedTask.categories && Array.isArray(props.parsedTask.categories))
      {

        newCategoryArray= [...props.parsedTask.categories, MYDAY_LABEL]      
      }else{
        newCategoryArray =[MYDAY_LABEL]
      }
      let newTodo: ParsedTask = _.cloneDeep(props.parsedTask)
      newTodo.categories = newCategoryArray

      //Convert Rrule to Rrule object for the VTODOGenerator
      if(props.parsedTask.rrule){
        newTodo.rrule = RRuleHelper.rruleToObject(props.parsedTask.rrule)
      }
      const eventEtag = await getEtagFromURL_Dexie(eventURL)
      let message = newTodo["summary"] ? newTodo["summary"]+": " : "" 
      toast.info(message+t("ACTION_SENT_TO_CALDAV"))
  
      updateTodo_WithUI(calendar_id, eventURL, eventEtag, newTodo,toastOnReponse ).then(reponse =>{
        setUpdateViewTime(Date.now())
      })



    }
  }

  const toastOnReponse = (body, taskName) =>{
    onServerResponse_UI(body,taskName, t)
  }
  const removeFromMyDay = async () => {

    if(categoryArrayHasMyDayLabel(props.parsedTask.categories)){
      let newCategoryArray = removeMyDayLabelFromArray(props.parsedTask.categories)
      let newTodo: ParsedTask = _.cloneDeep(props.parsedTask)
      newTodo.categories = newCategoryArray

      //Convert Rrule to Rrule object for the VTODOGenerator
      if(props.parsedTask.rrule){
        newTodo.rrule = RRuleHelper.rruleToObject(props.parsedTask.rrule)
      }
      const eventEtag = await getEtagFromURL_Dexie(eventURL)
      updateTodo_WithUI(calendar_id, eventURL, eventEtag, newTodo, toastOnReponse).then(reponse =>{
        setUpdateViewTime(Date.now())
      })
    }

  }
  const copyOrMoveItem = () =>{
    setMoveEventInput({
      id: props.id
    })
    setShowMoveEventModal(true)
  }
  const scheduleItem = () => {

    getEventFromDexieByID(parseInt(props.id.toString())).then(event =>{
      if(event && event.length>0){
        const parsedTask = returnGetParsedVTODO(event[0].data)
        const start = moment().toISOString()
        const end = moment((moment().unix()+60*60)*1000).toString()
        if(parsedTask){

          setEventEditorInput({
            id:null,
            calendar_id:calendar_id,
            summary: parsedTask["summary"],
            start: start,
            end: end
      
          })
          showEventEditor(true)
        }
      }
    })
  }
  

  const backgroundColor = isDarkModeEnabled() ? "black" : "white"
  return (
    <ContextMenu key={"RIGHTCLICK_MENU_" + props.id} id={"RIGHTCLICK_MENU_" + props.id}>
      <div style={{ background: backgroundColor }}>
        {options}
      </div>

    </ContextMenu>
  )
}