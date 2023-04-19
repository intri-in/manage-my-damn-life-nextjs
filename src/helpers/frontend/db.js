import Dexie from 'dexie';


export function getcalendarDB() {
    const db_calendar = new Dexie('mmdl-calendar-data');

    db_calendar.version(5).stores({
        calendar_events: '++id, url, etag, data, updated, caldav_accounts_id, calendar_id, type, [caldav_accounts_id+calendar_id], [caldav_accounts_id+calendar_id+type]',
        caldav_accounts: '++id, caldav_account_id, name, url, username',
        calendars: '++id, calendar_id, caldav_account_id, name, url',
    });

    return db_calendar
}

export function getUserDB() {
    const db_user = new Dexie('mmdl-user-data');
    db_user.version(3).stores({
        user: '++id, username, userhash, ssid, email, mobile',
        labels: '++id, name, colour'
    });
    return db_user
}
