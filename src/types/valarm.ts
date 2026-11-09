import { RFCDurationUnit } from "./rfc";

export interface VAlarmType{
    action: string;
    trigger: VAlarmTrigger;
    description?: string;
    repeat?: vAlarmRepeat;
    summary?:string
    attendees?:attendeeType[],
}
/**
 *
 */
export interface VAlarmTrigger{
    isRelated: boolean;
    value: string | number;
    unit: RFCDurationUnit
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
