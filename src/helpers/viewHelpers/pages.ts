import { MYDAY_LABEL } from '@/config/constants'
import { getTodaysDateUnixTimeStamp } from '../general'

export const PAGE_VIEW_NAME_MY_DAY ="MY_DAY"
export const PAGE_VIEW_NAME_DUE_TODAY="DUE_TODAY"
export const PAGE_VIEW_NAME_DUE_NEXT_SEVEN="DUE_NEXT_SEVEN_DAYS"
export const PAGE_VIEW_NAME_HIGH_PRIORITY ="HIGH_PRIORITY"
export const PAGE_VIEW_NAME_ALL_TASKS="ALL_TASKS"
export const PAGE_VIEW_NAME_HAVE_STARTED="HAVE_STARTED"


export const PAGE_VIEW_JSON = {

    "MY_DAY": { logic: "or", filter: { due: [0, getTodaysDateUnixTimeStamp()], label: [MYDAY_LABEL] } },
    "DUE_TODAY": { logic:"or", filter: { due: [0, getTodaysDateUnixTimeStamp()] } },
    "DUE_NEXT_SEVEN_DAYS":{logic:"or",  filter: { due: [0, getTodaysDateUnixTimeStamp() + 604800] } },
    "HIGH_PRIORITY": { filter: { priority: 4 } },
    "ALL_TASKS": {},
    "HAVE_STARTED":{logic:"or",  filter: { start: {before:getTodaysDateUnixTimeStamp()}}}

}

