export interface TaskFilter{
    logic?: "or" | "and",
    filter?: basicFilter
}

interface basicFilter{
    due?: [number, number],
    label?:string,
    priority?:number
}