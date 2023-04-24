import Cookies from "js-cookie";
import { getUserDB } from "./db";
import { Base64 } from "js-base64";


export async function getUserData() {

    var db = getUserDB()
    const userdata = await db.user.toArray();
    return userdata
}

export function setLoginCookie(userhash, ssid) {
    Cookies.set("USERHASH", userhash, { expires: 30 })
    Cookies.set("SSID", ssid, { expires: 30 })
}

export function logoutUser()
{
    // Just deleted the cookies. 
    Cookies.remove("USERHASH")
    Cookies.remove("SSID")
    Cookies.remove("USER_DATA_LABELS")
    Cookies.remove("USER_SETTING_SYNCTIMEOUT")
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