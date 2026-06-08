import { createDAVClient, DAVClient, refreshAccessToken } from "tsdav"
import { TSDAVAuthMethodTypes } from "types/tsdav"
import { addTrailingSlashtoURL, getBaseURL, logError } from "../general"
import { caldav_accounts } from "models/caldav_accounts"
import { AES } from 'crypto-js';
import { decryptCalDAVPassword } from "./cal/caldav";
import moment from "moment";
import { updateCalDAVAccountAccessTokeninDB } from "./caldav_accounts";
import { refreshOAuthTokenFromProvider } from "./OAuth";

export type CalDAVAuthObject = {
    client_id: string,
    access_token?: string,
    refresh_token?:string,
    provider?:string,
    auth_code?:string
    client_secret?:string
    expires_in?:string
    last_updated?:string
}

export const OAUTH_TOKEN_URL ={
    "GOOGLE":"https://oauth2.googleapis.com/token",
}

export type GetTSDAVCalDAVClientInput= {
    url: string, 
    username:string, 
    password: string, 
    authMethod: TSDAVAuthMethodTypes, 
    caldav_auth_object?: CalDAVAuthObject, 
    logErrorPrefix?: string 

}


export function getTSDAVInputFromCalDAVAccount(caldav_account: caldav_accounts[], logErrorPrefix?:string): GetTSDAVCalDAVClientInput{

    const decryptedPass = decryptCalDAVPassword(caldav_account[0].password!)
    return {
            url: caldav_account[0].url!,
            username: caldav_account[0].username!,
            password: decryptedPass,
            authMethod: caldav_account[0].authMethod! as TSDAVAuthMethodTypes,
            caldav_auth_object:{
                client_id: caldav_account[0].client_id!,
                access_token:caldav_account[0].access_token!,
                refresh_token: caldav_account[0].refresh_token!,
                client_secret: decryptedPass,
                provider: caldav_account[0].provider!,
                expires_in: caldav_account[0].expires_in!,
                last_updated: caldav_account[0].last_updated!,
            },
            logErrorPrefix:logErrorPrefix??"getTSDAVInputFromCalDAVAccount"
        }

}
export function accessTokenNeedsRefresh(caldav_auth_object: caldav_accounts ){
    if(!caldav_auth_object){
        console.error("accessTokenNeedsRefresh: No caldav_auth_object provided")
        return true
    }
    if(!caldav_auth_object.access_token){
        console.error("accessTokenNeedsRefresh: caldav_auth_object.access_token is empty")
        return true
    }
    if(!caldav_auth_object.last_updated || !caldav_auth_object.expires_in){
        return true

    }
    const startingTime = moment(caldav_auth_object.last_updated)
    // const differenceInSeconds = startingTime.diff(moment(moment.now()), "seconds")
    const differenceInSeconds = moment(moment.now()).diff(startingTime, "seconds")
    // console.log("startingTime", startingTime, differenceInSeconds)
    if(differenceInSeconds>=parseInt(caldav_auth_object.expires_in)){
        return true
    }
    return false

}

export async function refreshTokenAndSaveinDB(input: caldav_accounts){

    const result = await refreshOAuthTokenFromProvider(input)
    console.log("refreshTokenAndSaveinDB result", result)
    if(result && result.access_token && result.expires_in){
        //Save the new token in database.
        await updateCalDAVAccountAccessTokeninDB(input, {access_token: result.access_token, expires_in:result.expires_in.toString()})
    }
}
export async function getTSDAVCalDAVClient(input: GetTSDAVCalDAVClientInput): Promise<any| null> {
    // console.log("OAUTH_TOKEN_URL[caldav_auth_object?.provider!],", OAUTH_TOKEN_URL[caldav_auth_object?.provider!])
    
    return new Promise((resolve, reject) => {
        
        if(!input.authMethod || (input.authMethod && input.authMethod.toUpperCase()=="BASIC")){
            createDAVClient({
                serverUrl: input.url,
                credentials: {
                    username: input.username,
                    password: input.password
                },
                authMethod:input.authMethod,
                defaultAccountType: "caldav",
                }).then(client =>{
                    return resolve(client)
                }).catch((reason)=>{
                logError(reason, `${input.logErrorPrefix} tsdav client:`)    
                return resolve (null)
            })
            }else{

             createDAVClient({
                serverUrl: input.url,
                credentials: {
                    refreshToken: input.caldav_auth_object?.refresh_token,
                    username: input.username,
                    tokenUrl: OAUTH_TOKEN_URL[input.caldav_auth_object?.provider!],
                    clientId: input.caldav_auth_object?.client_id,
                    clientSecret: input.password,
                    accessToken: input.caldav_auth_object?.access_token,
                    redirectUrl:`${getBaseURL()}accounts/caldav/oauth/register`
                },
            
                authMethod: 'Oauth',
                defaultAccountType: 'caldav',
                }).then(client =>{
                    return resolve(client)
                }).catch((reason)=>{
                logError(reason, `${input.logErrorPrefix} tsdav client:`)    
                return resolve (null)
            })

            }
        })
    
}

// export async function process_calendarQueryResults(results, caldav_url, calendar, client)
// {
//     if(Array.isArray(results))
//     {
//         console.log(results)
//         var objectURLs= []
//         for(const i in results)
//         {
//             if(varNotEmpty(results[i].href) && results[i].href!="")
//             {
//                 objectURLs.push(caldav_url+results[i].href)

//             }

        
//         }
//         console.log("objectURLs", objectURLs)

//         const calendarObjects = await client.calendarMultiGet({
//             url: calendar.url,
//             props: {
//             },
//             objectUrls:objectURLs,
//             depth: '1',
           
//         });

//         console.log("calendarObjects", calendarObjects)



//     }

// }