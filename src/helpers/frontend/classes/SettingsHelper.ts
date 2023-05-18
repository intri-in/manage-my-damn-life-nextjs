import { getAPIURL, logError, logVar, varNotEmpty } from "@/helpers/general";
import axios from "axios";
import { getAuthenticationHeadersforUser } from "../user";
import { getErrorResponse } from "@/helpers/errros";
import { getMessageFromAPIResponse } from "../response";
import { displayErrorMessageFromAPIResponse, getI18nObject } from "../general";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const i18next= getI18nObject()

export default class SettingsHelper
{


    static async getFromServer(keyName: string)
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
                  })  .catch(function (error) {
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
            toast.success(i18next.t("SETTING")+" "+i18next.t("UPDATE_OK").toLowerCase())
            return true

        }else{
            toast.success(i18next.t("ERROR_GENERIC"))
            logError(response, "SettingsHelper.setKey")
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