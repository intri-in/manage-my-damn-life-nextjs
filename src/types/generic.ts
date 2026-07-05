import { Calendars, Caldav_Accounts} from "@/helpers/frontend/dexie/dexieDB"

export interface Caldav_Summary extends Caldav_Accounts{
    calendars: Calendars[]

}