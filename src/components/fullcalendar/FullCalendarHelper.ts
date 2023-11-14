export const FULLCALENDAR_VIEWLIST =[
    {name: "timeGridDay", saneName: "DAY_VIEW",},
    {name: "timeGridWeek", saneName: "WEEK_VIEW"},
    {name: "dayGridMonth", saneName: "MONTH_VIEW"},
    {name: "listWeek", saneName: "LIST_VIEW"}
]

export function getSaneName(fullcalendarViewName:string): string
{
    for(const i in FULLCALENDAR_VIEWLIST)
    {
        if(FULLCALENDAR_VIEWLIST[i].name==fullcalendarViewName)
        {
            return FULLCALENDAR_VIEWLIST[fullcalendarViewName]

        }
    }

    return ""
}
export function isValidFullCalendarView(name){
    // console.log("isValidFullCalendarView", name)
    for (const i in FULLCALENDAR_VIEWLIST){
        if(FULLCALENDAR_VIEWLIST[i].name==name){
            return true
        }
    } 


    return false
}
