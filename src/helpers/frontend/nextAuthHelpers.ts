import { addUserToDB_Dexie } from "./dexie/users_dexie"
import { getMessageFromAPIResponse } from "./response"

export function getSessionFromNextAuthAPI():Promise<any>{
    const url_api = "/api/auth/session"
    const requestOptions =
    {
        method: 'GET',
        headers: new Headers({'Content-Type':'application/json'}),
    }

    return new Promise( (resolve, reject) => {
        fetch(url_api, requestOptions)
        .then(response => response.json())
        .then((body) =>{
            return resolve(body)
        })
        .catch(e =>{
            console.error("getSessionFromNextAuthAPI", e)
            return resolve(null)
        })

    })
}

export async function getUserIDFromNextAuthSession_API(){

    const body = await getSessionFromNextAuthAPI()
    // console.log("body", body)
    if(body && ("user" in body) && ("id" in body.user) && body.user.id){
        return body.user.id
    }
    
    return null

}