import Cookies from "js-cookie";

export function getSyncTimeout()
{
    var timeout = Cookies.get("USER_SETTING_SYNCTIMEOUT")
    return 1000*60*5
}

export function setSyncTimeout(timeinMinutes)
{
    Cookies.set("USER_SETTING_SYNCTIMEOUT", timeinMinutes*60*1000, { expires: 10000 })
}

