'use client'
import { getMessageFromAPIResponse } from "../frontend/response"
import { getAPIURL } from "../general"

export async function nextAuthEnabled(){
    if(typeof window === 'undefined'){
        const useNext = process.env.USE_NEXT_AUTH
        if(useNext == "true"){
            return true
        }else{
            return false
        }

    }
    // const url_api=getAPIURL()+"oauth/status"
    const url_api = "/api/oauth/status"
    const requestOptions =
    {
        method: 'GET',
        headers: new Headers({'Content-Type':'application/json'}),
    }
    return new Promise( (resolve, reject) => {
        fetch(url_api, requestOptions)
        .then(response => response.json())
        .then((body) =>{
                if(body && body.success)
                {
                    const isNextAuthEnabled = getMessageFromAPIResponse(body)
                    // console.log("body", body)
                    // console.log("isNextAuthEnabled", isNextAuthEnabled)
                    return resolve(isNextAuthEnabled)
                }else{
                    return resolve(false)
                }
            })
        .catch(e =>{
            console.error("nextAuthEnabled", e)
        })
        

    })
    // if(process.env.USE_NEXT_AUTH==="true"){
    //     return true
    // }else{
    //     return false
    // }
}

/**
 * Takes in result of getServerSession from NextAuth.js
 * and return the user id.
 */
export function getUserIDFromNextAuthSession(session: any)
{
    if(session){
        if(session.user)
        {
            if(session.user.id){
                return session.user.id
            }
        }
    }

    return null
}