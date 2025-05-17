import { AlarmType } from '@/components/events/AlarmForm'
import { atom } from 'jotai'

export interface EventEditorInputType{
    id: string | number | null,
    parentId?: string,
    category?: string[],
    priority?:number,
    taskDone?: boolean,
    end?: string,
    start?:string,
    summary?:string,
    calendar_id?:string | number,
    description?:string,
    alarms?: AlarmType[]
    isTemplate?:boolean,
    templateReturn?:Function
    templateData?:templateData

}
export interface templateData{
    data?: string,
    calendar_id?:string
}

export const showEventEditorAtom = atom(false)
export const eventEditorInputAtom = atom<EventEditorInputType>({id: null})

