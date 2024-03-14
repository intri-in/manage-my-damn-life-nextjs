import { atom } from 'jotai'

export const currentSimpleDateFormatAtom = atom("DD/MM/YYYY")
export const currentSimpleTimeFormatAtom = atom("HH:mm")

export const currentDateFormatAtom = atom((get) => get(currentSimpleDateFormatAtom)+" "+get(currentSimpleTimeFormatAtom))