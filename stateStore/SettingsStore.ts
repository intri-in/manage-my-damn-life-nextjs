import { SETTING_NAME_DATE_FORMAT, SETTING_NAME_TIME_FORMAT } from '@/helpers/frontend/settings'
import { atom } from 'jotai'


export const currentSimpleDateFormatAtom = atom("DD/MM/YYYY")
export const currentSimpleTimeFormatAtom = atom("HH:mm")

export const currentDateFormatAtom = atom((get) => get(currentSimpleDateFormatAtom)+" "+get(currentSimpleTimeFormatAtom))