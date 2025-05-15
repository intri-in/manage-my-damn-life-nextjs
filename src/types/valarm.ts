export interface vAlarm{
    action: string;
    trigger: vAlarmTrigger;
    description?: string;
    repeat?: vAlarmRepeat;
    summary?:string
    attendees?:attendeeType[]
}
/**
 *
 */
interface vAlarmTrigger{
    isRelated: boolean;
    value: string | number ;
    relatedTo?: string;
}

interface vAlarmRepeat{
    repeat: number;
    duration: number;
}

export interface attendeeType{
    commonName: string,
    email:string
}
