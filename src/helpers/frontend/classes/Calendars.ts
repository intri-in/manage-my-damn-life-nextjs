import { varNotEmpty } from "@/helpers/general";
import { getCaldavAccountsfromServer } from "../calendar";
import { getMessageFromAPIResponse } from "../response";

export class CalendarsHelper {

    static async getAllCalendars(): Promise<Object[]>    
    {
        const caldav_accounts = await getCaldavAccountsfromServer()
        if(caldav_accounts!=null && caldav_accounts.success==true)
        {
            var accounts = getMessageFromAPIResponse(caldav_accounts)
            if(varNotEmpty(accounts) && Array.isArray(accounts) && accounts.length>0)
            {
                return accounts
            }
        }

        return []
    }
}