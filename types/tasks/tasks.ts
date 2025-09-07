import { vAlarmVTODOGEN } from "@/components/valarm/VAlarmForm"
import { RruleObject } from "types/recurrence"

export interface ParsedTask{
    due?: string
    dtstamp?: string
    uid?: string
    categories?: string[]
    completed?: string
    summary?: string
    created?: string
    completion?: string | number
    status?: string
    relatedto?: string | relatedToType | relatedToType[]
    priority?: string | number
    recurrenceid?: string
    description?: string
    start?: string
    class?: string
    rrule?: RruleObject
    geo?: string
    location?: string
    organizer?: string
    sequence?: number | string
    resources?: string | string[]
    url?: string
    recurrences?: ParsedTask[]
    tz?: string
    valarms?:vAlarmVTODOGEN
    alarms?:vAlarmVTODOGEN

}

export interface relatedToType {
    params: {
        RELTYPE: string

    },
    val: string
}
export interface rruleType {
    FREQ: string,
    INTERVAL: string | number,
    UNTIL?: string
    COUNT?: number
}

export interface optionsType {
    strict: boolean
}