import { OAUTH_TOKEN_URL } from "../api/tsdav";
import {  getBaseURL } from "../general";

const OAUTH_TEMPORARY_STORAGE_KEY='OAUTH_TEMPORARY_STORAGE_KEY'
export type OAuthTemporaryStorageType = {
    name: string,
    provider:string,
    username: string
}

const OAUTH_SCOPES_FOR_GOOGLE="https://www.googleapis.com/auth/calendar  https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.events.owned"


export function getOAuthScopesforProvider(provider: string):string{
    switch(provider){

        case "GOOGLE":
            return OAUTH_SCOPES_FOR_GOOGLE
        default:
            return ""

    }

}
export async function makeOAuthSetupRequestToAPI(username: string, clientId: string, provider: string){
        // const url_api = getAPIURL() + "v2/caldav/register";
        // const authorisationData = await getAuthenticationHeadersforUser();
        //     const requestOptions = {
        //     method: "POST",
        //     body: JSON.stringify({
        //         username,
        //         accountname: accountName,
        //         authType: authType
        //     }),
        //     headers: new Headers({
        //         authorization: authorisationData,
        //         "Content-Type": "application/json",
        //     }),
        //     };

    

}

export function saveOAuthSetupInfoLocally(toStore: OAuthTemporaryStorageType){
    if(typeof(window)!=="undefined"){
        
        localStorage.setItem(OAUTH_TEMPORARY_STORAGE_KEY, JSON.stringify(toStore))
    }
}
export function deleteOAuthSetupInfoFromStorage(){
    if(typeof(window)!=="undefined"){
        localStorage.removeItem(OAUTH_TEMPORARY_STORAGE_KEY)
        
    }

}
export function getOAuthSetupInfoFromStorage():OAuthTemporaryStorageType | undefined{
    if(typeof(window)!=="undefined"){
        const info = localStorage.getItem(OAUTH_TEMPORARY_STORAGE_KEY)
        if(info){
            try{

                return JSON.parse(info)
            }catch(e){
                return 
            }
        }

    }
}