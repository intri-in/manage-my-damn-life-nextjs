
/*
* SYSTEM_DEFAULT_LABEL_PREFIX: Default prefix applied to all system generated labels like
* "My Day"
*/
export const SYSTEM_DEFAULT_LABEL_PREFIX="mmdl"
export const MYDAY_LABEL=SYSTEM_DEFAULT_LABEL_PREFIX+"-myday"


/**
 * 
 * FullCalendar's config
 * See https://fullcalendar.io/docs/businessHours
 */

export const FULLCALENDAR_BUSINESS_HOURS={
    daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
    startTime: '7:00', 
    endTime: '23:00', 
}