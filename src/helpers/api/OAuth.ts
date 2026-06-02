import { caldav_accounts } from "models/caldav_accounts";
import { getBaseURL } from "../general";
import { OAUTH_TOKEN_URL } from "./tsdav";
import { decryptCalDAVPassword } from "./cal/caldav";

export async function fetchOAuthTokenFromProvider({provider, auth_code, client_id, client_secret, redirect_uri}:{provider: string, auth_code:string, client_id:string, client_secret:string, redirect_uri?:string}){
        const url_api = OAUTH_TOKEN_URL[provider]
        console.log("")
        const body = new URLSearchParams({
            client_id: client_id,
            code: auth_code,
            client_secret: client_secret,
            redirect_uri: redirect_uri ?? `${getBaseURL()}accounts/caldav/oauth/register`,
            grant_type:"authorization_code"
          })
        // console.log("body", body)
        const requestOptions = {
          method: "POST",
          body: body ,
          headers: new Headers({
            "Content-Type": "application/x-www-form-urlencoded",
          })
        };
        try{

            const response = await fetch(url_api, requestOptions)
            const data = await response.json()
            // console.log("data", data)
            return data
        }catch(e){
            console.error("fetchOAuthTokenFromProvider", e)
        }

        return {}


}

export async function refreshOAuthTokenFromProvider(caldav_account: caldav_accounts){
  if(!caldav_account) return
        // console.log("decryptedPass", caldav_account.password)

        const decryptedPass = decryptCalDAVPassword(caldav_account.password!)
        const url_api = OAUTH_TOKEN_URL[caldav_account.provider!]
        const body = new URLSearchParams({
            client_id: caldav_account.client_id!,
            client_secret: decryptedPass,
            refresh_token:caldav_account.refresh_token!,
            grant_type:"refresh_token"
          })
        // console.log("body", body)
        const requestOptions = {
          method: "POST",
          body: body ,
          headers: new Headers({
            "Content-Type": "application/x-www-form-urlencoded",
          })
        };
        try{

            const response = await fetch(url_api, requestOptions)
            const data = await response.json()
            console.log("refreshOAuthTokenFromProvider data", data)
            return data
        }catch(e){
            console.error("refreshOAuthTokenFromProvider", e)
        }

        return {}



}