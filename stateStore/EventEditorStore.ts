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
    calendar_id?:string | number

}
export const showEventEditorAtom = atom(false)
export const eventEditorInputAtom = atom<EventEditorInputType>({id: null})

