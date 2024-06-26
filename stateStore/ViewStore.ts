import { getI18nObject } from '@/helpers/frontend/general'
import { PAGE_VIEW_JSON } from '@/helpers/viewHelpers/pages'
import { atom } from 'jotai'
import { TaskFilter } from 'types/tasks/filters'

interface calDavObject{
  caldav_accounts_id: null | number,
  calendars_id: null | number
}
const i18next = getI18nObject()
export const currentViewAtom = atom("tasklist")
export const currentPageAtom = atom("MY_DAY")
export const currentPageTitleAtom = atom(i18next.t("MY_DAY"))
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