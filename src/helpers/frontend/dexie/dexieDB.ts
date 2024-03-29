import Dexie, { Table } from 'dexie';

export interface Caldav_Accounts{
  id?: number;
  caldav_accounts_id: number;
  username: string;
  url: number;
  name: string;
  authMethod?: string;
}

export interface Calendars{
    calendars_id?: number,
    displayName?: string;
    url?: string;
    ctag?: string;
    description?: string;
    calendarColor?: string;
    syncToken?: string;
    timezone?: string;
    reports?: string;
    resourcetype?: string;
    caldav_accounts_id?: string;
    updated?: string;
  
}

export  interface Calendar_Events {
    calendar_events_id?: number;
    url?: string;
    etag?: string;
    data?: string;
    updated?: string;
    type?: string;
    calendar_id?: string;
    deleted?: string;
}

export interface Labels {
  labels_id?: number;
  name?: string;
  colour?: string;
} 

export interface Settings{
  settings_id?: number;
  name?: string;
  userid?: string;
  global?: string;
  value?: string;

}
export class MySubClassedDexie extends Dexie {
  caldav_accounts!: Table<Caldav_Accounts>; 
  calendars!: Table<Calendars>;
  calendar_events!: Table<Calendar_Events>;
  labels!: Table<Labels>
  settings!:Table<Settings>
  constructor() {
    super('mmdl_dexie_db');
    this.version(1).stores({
        caldav_accounts: '++id,caldav_accounts_id, username, url, name, authMethod',
        calendars:"++calendars_id, displayName, url, ctag, description, calendarColor, syncToken, timezone, reports, resourcetype, caldav_accounts_id, updated",
        calendar_events:"++calendar_events_id,url,etag,data, updated, type, calendar_id, deleted",
        labels:"++labels_id, name, colour",
        settings:"++settings_id,name,userid,global,value"

    });

    
  }
}

export const db = new MySubClassedDexie();