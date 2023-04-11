import Cookies from 'js-cookie'

export function setCookie(cname, cvalue, exdays)
{

    Cookies.set(cname, cvalue, { expires: exdays })

}

export function getDefaultCalendarID()
{
    Cookies.get("DEFAULT_CALENDAR_NAME")
    return "2";
}

export function setDefaultCalendarID(calendars_id)
{
    Cookies.set("DEFAULT_CALENDAR_NAME", calendars_id, { expires: 3650 })
}
