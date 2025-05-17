import { PAGE_VIEW_JSON } from '@/helpers/viewHelpers/pages'
import { atom } from 'jotai'
import { useTranslation } from 'next-i18next'
import { TaskFilter } from 'types/tasks/filters'

interface calDavObject{
  caldav_accounts_id: null | number,
  calendars_id: null | number
}

export const currentViewAtom = atom("tasklist")
export const currentPageAtom = atom("MY_DAY")
export const currentPageTitleAtom = atom("")
export const calDavObjectAtom = atom<calDavObject>({caldav_accounts_id: null, calendars_id:null})

export const updateViewAtom = atom(Date.now())
export const updateCalendarViewAtom = atom(Date.now())
export const filterAtom =  atom<TaskFilter | {}>(PAGE_VIEW_JSON["MY_DAY"])

//Filter value provided to the component.
// This will be derived from the currentPage variable.

// export const filterAtom = atom((get)=>{
//   const currentP = get(currentPageAtom)
//   return PAGE_VIEW_JSON[currentP]
// })