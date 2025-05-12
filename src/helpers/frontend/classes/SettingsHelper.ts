import { getAPIURL, logError, logVar, varNotEmpty } from "@/helpers/general";
import axios from "axios";
import { getAuthenticationHeadersforUser } from "../user";
import { getErrorResponse } from "@/helpers/errros";
import { getMessageFromAPIResponse } from "../response";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { SETTING_NAME_CALENDAR_START_DAY, SETTING_NAME_DATE_FORMAT, SETTING_NAME_DEFAULT_CALENDAR, SETTING_NAME_DEFAULT_VIEW_CALENDAR, SETTING_NAME_NUKE_DEXIE_ON_LOGOUT, SETTING_NAME_TIME_FORMAT, USER_SETTING_SYNCTIMEOUT } from "../settings";

// const i18next= getI18nObject()

export default class SettingsHelper
{

    static async getAllFromServerAndSave(){
        // const defaultCalendar = await SettingsHelper.getFromServer(SETTING_NAME_DEFAULT_CALENDAR)
        // localStorage.setItem(SETTING_NAME_DEFAULT_CALENDAR, defaultCalendar)

        // const defaultView = await SettingsHelper.getFromServer(SETTING_NAME_DEFAULT_VIEW_CALENDAR)
        // localStorage.setItem(SETTING_NAME_DEFAULT_VIEW_CALENDAR, defaultView)

        // const startingDay = await SettingsHelper.getFromServer(SETTING_NAME_CALENDAR_START_DAY)
        // localStorage.setItem(SETTING_NAME_CALENDAR_START_DAY, startingDay)

        // const syncTimeout = await SettingsHelper.getFromServer(USER_SETTING_SYNCTIMEOUT)
        // localStorage.setItem(USER_SETTING_SYNCTIMEOUT, syncTimeout)

        // const dateFormat = await SettingsHelper.getFromServer(SETTING_NAME_DATE_FORMAT)
        // localStorage.setItem(SETTING_NAME_DATE_FORMAT, dateFormat)

        // const timeFormat = await SettingsHelper.getFromServer(SETTING_NAME_TIME_FORMAT)
        // localStorage.setItem(SETTING_NAME_TIME_FORMAT, timeFormat)

        // const nukeDexie = await SettingsHelper.getAllFromServerAndSave(SETTING_NAME_NUKE_DEXIE_ON_LOGOUT)
        const output = await SettingsHelper.getAllFromServer()
        if(output && output["user"] && Array.isArray(output["user"])){
            for(const i in output["user"]){
                if(output["user"][i]["name"] && output["user"][i]["value"]){
                    
                    // console.log(output["user"][i]["name"], output["user"][i]["value"])

                    localStorage.setItem(output["user"][i]["name"], output["user"][i]["value"])
                }
            }

        }
        // console.log("output", output)

    }

    static async getAllFromServer(){
        const authorisationData = await getAuthenticationHeadersforUser()
        return new Promise( (resolve, reject) => {
            try{
                axios({
                    method: 'get',
                    url: getAPIURL() + "settings/get",
                    headers: { 'authorization': authorisationData, 'Content-Type': 'application/json' }
                  }).then(function (response) {
    
                    if(varNotEmpty(response) && varNotEmpty(response.status) && response.status==200 && varNotEmpty(response.data))
                    {
                        const toReturn= getMessageFromAPIResponse(response.data)
                        return resolve(toReturn)
    
                    }else{
                        return resolve("")
                    }
                  }).catch(function (error) {
                    logError(error, "SettingsHelper.getFromServer");
                    return resolve("")
                  });
        
               }
               catch(e)
               {
                logError(e, "SettingsHelper.getFromServer")
                return resolve("")
               }
    
        })


    }
    static async getFromServer(keyName: string): Promise<string>
    {
        const authorisationData = await getAuthenticationHeadersforUser()
        return new Promise( (resolve, reject) => {
            try{
                axios({
                    method: 'get',
                    url: getAPIURL() + "settings/getone?name="+keyName,
                    headers: { 'authorization': authorisationData, 'Content-Type': 'application/json' }
                  }).then(function (response) {
    
                    if(varNotEmpty(response) && varNotEmpty(response.status) && response.status==200 && varNotEmpty(response.data))
                    {
                        const toReturn= getMessageFromAPIResponse(response.data)
                        return resolve(toReturn)
    
                    }else{
                        return resolve("")
                    }
                  }).catch(function (error) {
                    logError(error, "SettingsHelper.getFromServer");
                    return resolve("")
                  });
        
               }
               catch(e)
               {
                logError(e, "SettingsHelper.getFromServer")
                return resolve("")
               }
    
        })

    }

    static async setKey(keyName: string, value: string)
    {
        const response: any = await SettingsHelper.setKeyOnServer(keyName, value)
        if(varNotEmpty(response) && varNotEmpty(response.status) && response.status==200)
        {
            // toast.success(i18next.t("SETTING")+" "+i18next.t("UPDATE_OK").toLowerCase())
            return true

        }else{
            // toast.success(i18next.t("ERROR_GENERIC"))
            // logError(response, "SettingsHelper.setKey")
            return false

        }
    }
    static async setKeyOnServer(keyName:string, value:string): Promise<Object>
    {
        const authorisationData = await getAuthenticationHeadersforUser()

        return new Promise( (resolve, reject) => {
            try{
                axios({
                    method: 'post',
                    url: getAPIURL() + "settings/modify",
                    data:{ "name": keyName, "value": value},
                    headers: { 'authorization': authorisationData, 'Content-Type': 'application/json' }
                  }).then(function (response) {
                        return resolve(response)
                  })  .catch(function (error) {
                    logError(error, "SettingsHelper.getFromServer");
                    return resolve(getErrorResponse(error))
                  });
        
               }
               catch(e)
               {
                logError(e, "SettingsHelper.getFromServer")
                return resolve(getErrorResponse(e))
                }
    
        })

    }
}