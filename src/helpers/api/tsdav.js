import { varNotEmpty } from "../general"

export async function process_calendarQueryResults(results, caldav_url, calendar, client)
{
    if(Array.isArray(results))
    {
        console.log(results)
        var objectURLs= []
        for(const i in results)
        {
            if(varNotEmpty(results[i].href) && results[i].href!="")
            {
                objectURLs.push(caldav_url+results[i].href)

            }

        
        }
        console.log("objectURLs", objectURLs)

        const calendarObjects = await client.calendarMultiGet({
            url: calendar.url,
            props: {
            },
            objectUrls:objectURLs,
            depth: '1',
           
        });

        console.log("calendarObjects", calendarObjects)



    }

}