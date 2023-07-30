import { CaldavAccount } from "@/helpers/api/classes/CaldavAccount"
import { Calendars } from "@/helpers/api/classes/Calendars"
import { User } from "@/helpers/api/classes/User"
import { getUserIDFromLogin, middleWareForAuthorisation } from "@/helpers/api/user"
import { returnGetParsedVTODO } from "@/helpers/frontend/calendar"
import { applyTaskFilter, majorTaskFilter } from "@/helpers/frontend/events"
import { haystackHasNeedle } from "@/helpers/general"

export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(await middleWareForAuthorisation(req,res))
        {
            if(req.query.calendar_id!=null && req.query.calendar_id!=""&& req.query.calendar_id!=undefined && req.query.search_term!="" && req.query.search_term!=undefined && req.query.search_term!=null)
            {
                // var userid=await User.idFromAuthorisation(req.headers.authorization)

                var userid = await getUserIDFromLogin(req, res)
                if(userid==null){
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

                }

                var user = new User(userid)
                var calendarObject= {calendars_id: req.query.calendar_id}
                var caldav_id = await CaldavAccount.getIDFromCalendar(calendarObject)
                if(caldav_id!=null)
                {
                    var calendar = new Calendars(calendarObject)
                    var allEvents = await calendar.getAllEvents(req.query.type) 
                    var finalResponse = []
                    // Now we parse and search the events.
                    for (const i in allEvents)
                    {
                        var parsedTodo= returnGetParsedVTODO(allEvents[i].data)
                        if(majorTaskFilter(parsedTodo)==true && parsedTodo.summary!=null &&  parsedTodo.summary!=undefined && (haystackHasNeedle(req.query.search_term.trim(),parsedTodo.summary) || haystackHasNeedle(req.query.search_term.trim(),parsedTodo.description) ) )
                        {
                            finalResponse.push(allEvents[i])
                        } 

                    }

                    res.status(200).json({ success: true, data: {message: finalResponse} })

                }
                else{
                    res.status(401).json({ success: false, data: { message: 'ERROR_NO_ACCESS_TO_CALENDAR'} })

                }

    
            }
            else
            {
                res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })

            }


        } else
        {
            res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }else {
        res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
    
}