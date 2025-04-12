import Dexie, { Table } from 'dexie';

export interface Users{
  id?: number,
  hash?: string
}

export interface Caldav_Accounts{
  id?: number;
  caldav_accounts_id: number;
  username: string;
  url: number;
  name: string;
  authMethod?: string;
  userid:number
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
    uid?:string;
    parsedData?:any
  
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

export interface Event_Parents{
  id?: number;
  uid?: string;
  parent_id?:string
}

export class MySubClassedDexie extends Dexie {
  caldav_accounts!: Table<Caldav_Accounts>; 
  calendars!: Table<Calendars>;
  calendar_events!: Table<Calendar_Events>;
  labels!: Table<Labels>
  settings!:Table<Settings>
  event_parents!:Table<Event_Parents>
  users!:Table<Users>

  constructor() {
    super('mmdl_dexie_db');
    this.version(1).stores({
        caldav_accounts: '++id,caldav_accounts_id, username, url, name, authMethod',
        calendars:"++calendars_id, displayName, url, ctag, description, calendarColor, syncToken, timezone, reports, resourcetype, caldav_accounts_id, updated",
        calendar_events:"++calendar_events_id,url,etag,data, updated, type, calendar_id, deleted",
        labels:"++labels_id, name, colour",
        settings:"++settings_id,name,userid,global,value"

    });


    this.version(2).stores({
      event_parents:'++id,calendar_events_id,parent_id',
      calendar_events:'++calendar_events_id,url,etag,data, updated, type, calendar_id, deleted,calendar_events_id,uid,parsedData'
    })
    this.version(3).stores({
      event_parents:'++id,calendar_events_id,parent_id',
    })

    this.version(4).stores({
      event_parents:'++id,uid,parent_id',

    })
    this.version(5).stores({
      users:'++id,hash',
      caldav_accounts: '++id,caldav_accounts_id, username, url, name, authMethod,userid',
    })


  }
}

export const db = new MySubClassedDexie();