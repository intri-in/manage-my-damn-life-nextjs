export interface TaskFilter{
    logic?: "or" | "and",
    filter?: BasicMMDlFilter
}

export interface BasicMMDlFilter{
    due?: [string, string],
    dueRelative?:DueRelative,
    label?:string[] | FilterLabelType,
    priority?:number | string,
    start?:StartDate,
    startRelative?: DueRelative
}
interface FilterLabelType{
    logic: string,
    filters: string[]
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