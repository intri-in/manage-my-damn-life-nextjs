import { getAPIURL } from "@/helpers/general";
import { getAuthenticationHeadersforUser } from "../user";
import { CalDAVAuthObject } from "@/helpers/api/tsdav";
import { saveCaldavAccountToDexie } from "../dexie/caldav_dexie";
import { insertCalendarsIntoDexie } from "../dexie/calendars_dexie";
import { fetchLatestEventsV2 } from "../sync";

export async function registerCalDAVAccountonServer(serverURL: string, username, password, accountName, auth_method, caldav_auth_object: CalDAVAuthObject){
        const url_api = getAPIURL() + "v2/caldav/register";
        const authorisationData = await getAuthenticationHeadersforUser();
    
        const requestOptions = {
          method: "POST",
          body: JSON.stringify({
            url: serverURL,
            username,
            password,
            accountname: accountName,
            auth_method: auth_method,
            client_id: caldav_auth_object?.client_id,
            auth_code: caldav_auth_object?.auth_code,
            provider: caldav_auth_object?.provider,
          }),
          headers: new Headers({
            authorization: authorisationData,
            "Content-Type": "application/json",
          }),
        };

        try{
                const response = await fetch(url_api, requestOptions);
                const body = await response.json();
                if (body?.success) {
                  if (
                      body.data &&
                      body.data["caldav_accounts_id"] &&
                      body.data["calendars"] &&
                      body.data["url"]
                  ) {
                  console.log("body", body)
                  await saveCaldavAccountToDexie(body.data, username);
                  await insertCalendarsIntoDexie(body.data);
                  fetchLatestEventsV2(true)
                      
                  }else{
                      console.error(body, "registerCalDAVAccountonServer"); 
              
                  }

                }

                  return body


        }catch(e){
            console.error("registerCalDAVAccountonServer", e)
            return {success: false, data: {error: e}}
        }
    
        

    
}