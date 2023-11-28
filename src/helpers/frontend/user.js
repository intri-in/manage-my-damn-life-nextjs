import Cookies from "js-cookie";
import { getUserDB } from "./db";
import { Base64 } from "js-base64";
import { nextAuthEnabled } from "../thirdparty/nextAuth";
import { signOut } from "next-auth/react";
import { getAPIURL, varNotEmpty } from "../general";
import axios from "axios";
import { deleteAllCookies } from "./cookies";


export async function getUserData() {

    var db = getUserDB()
    const userdata = await db.user.toArray();
    return userdata
}

export function setLoginCookie(userhash, ssid) {
    Cookies.set("USERHASH", userhash, { expires: 30 })
    Cookies.set("SSID", ssid, { expires: 30 })
}

export async function logoutUser()
{
    // Just deleted the cookies. 
    Cookies.remove("USERHASH")
    Cookies.remove("SSID")
    Cookies.remove("USER_DATA_LABELS")
    Cookies.remove("USER_SETTING_SYNCTIMEOUT")

    deleteAllCookies()
    //Logout nextAuth Sessions.
    if(await nextAuthEnabled()){
        signOut()
    }
}

/**
 * Manages user logout with redirect. Calls the Logout function (which signs out the user either with NextAuth.js or with inbuilt mechanism, then redirects appropriately.)
 */
export async function logoutUser_withRedirect(router, redirectURL){
    logoutUser()
    if(varNotEmpty(router)){
        if(await nextAuthEnabled()){
            router.push('/')
        }else{
            var url = '/login'
            if(varNotEmpty(redirectURL)){
                url+="/?redirect="+redirectURL
            }
            router.push(url)
           
        }
    }

}
export function getUserDataFromCookies() {
    return ({
        userhash: Cookies.get("USERHASH"),
        ssid: Cookies.get("SSID")
    })
}
export async function getAuthenticationHeadersforUser() {
    //var userData = await getUserData()
    var userData = getUserDataFromCookies()

    var authorizationData = "Basic " + Base64.encode(userData.userhash + ":" + userData.ssid)

    return authorizationData

}
export async function insertUserdata() {

}


export async function checkLogin_InBuilt(router, redirectURL){
    const url_api=getAPIURL()+"auth/inbuilt/check"
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData, 'Content-Type':'application/json'}),
    }

    return new Promise( (resolve, reject) => {
        fetch(url_api, requestOptions)
        .then(response => response.json())
        .then((body) =>{
            if(varNotEmpty(body) && varNotEmpty(body.success)){
                if(body.success!=true){
                    logoutUser_withRedirect(router, redirectURL)
                }

            }else{
                logoutUser_withRedirect(router, redirectURL)
            }
                return resolve(true)
        }).catch(e=>
            {
                
                console.error("checkLogin_InBuilt", e)
                return resolve(false)

            }
        )

    })
}