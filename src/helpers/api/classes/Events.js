
export class Events{
    constructor(eventObject)
    {
        for (const key in eventObject)
        {
             this[key] = eventObject[key]
        }
 
    }

    static userHasAccess(userid)
    {
        
    }
}