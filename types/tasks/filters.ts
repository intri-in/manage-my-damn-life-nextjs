export interface TaskFilter{
    logic?: "or" | "and",
    filter?: BasicMMDlFilter
}

export interface BasicMMDlFilter{
    due?: [number | string, number | string],
    dueRelative?:DueRelative,
    label?:string[],
    priority?:number | string,
    start?:StartDate,
    startRelative?: DueRelative
}
interface StartDate{
    before: string ,
    after: string
}
export interface DueRelative{
    direction: string,
    value: number,
    unit: "HOURS" | "DAYS"
}