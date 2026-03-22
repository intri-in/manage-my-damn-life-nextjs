import { getUserSetDateFormat, getUserSetTimeFormat, SETTING_NAME_DATE_FORMAT, SETTING_NAME_TIME_FORMAT } from '@/helpers/frontend/settings'
import { atom } from 'jotai'


export const currentSimpleDateFormatAtom = (typeof(window)=="undefined")? atom("DD/MM/YYYY"):atom(getUserSetDateFormat())
export const currentSimpleTimeFormatAtom = (typeof(window)=="undefined")? atom("HH:mm"): atom(getUserSetTimeFormat())

export const currentDateFormatAtom = atom((get) => get(currentSimpleDateFormatAtom)+" "+get(currentSimpleTimeFormatAtom))