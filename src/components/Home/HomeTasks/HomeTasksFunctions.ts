import { SYSTEM_DEFAULT_LABEL_PREFIX } from "@/config/constants";
import { CalendarsHelper } from "@/helpers/frontend/classes/Calendars";
import Labels from "@/helpers/frontend/classes/Labels";
import { getAllFilters, getFiltersFromServer } from "@/helpers/frontend/filters";
import { getI18nObject } from "@/helpers/frontend/general";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { varNotEmpty } from "@/helpers/general";
import * as _ from 'lodash'
export async function refreshMenuOptionsFromServer(menuOptions: {})
{

    const i18next= getI18nObject()

    var newMenuOptions = _.cloneDeep(menuOptions)
    const labelsFromServer = await getLabelArrayFromServer()
    var labelArray = []

    if(varNotEmpty(labelsFromServer) && Array.isArray(labelsFromServer))
    {
        for(const i in labelsFromServer)
        {
            if(varNotEmpty(labelsFromServer[i]["name"]) && !labelsFromServer[i]["name"].startsWith(SYSTEM_DEFAULT_LABEL_PREFIX+"-"))
            {
                var tempObj = {}
                tempObj[labelsFromServer[i]["name"]]={logic:"or", filter:{label:[labelsFromServer[i]["name"]]}}
                labelArray.push(tempObj)
            }
        }
    }

    if(labelArray.length>0)
    {
        newMenuOptions[i18next.t("LABELS")]=labelArray

    }
    /**
     * Add Filters to Menu
    */
    var filtersFromServer = await getAllFilters()

    if(varNotEmpty(filtersFromServer) && Array.isArray(filtersFromServer) && filtersFromServer.length>0)
    {
        var finalFilterOptions = []
        for (const i in filtersFromServer)
        {
            var tempObj = {}
            var jsonFilter = JSON.parse(filtersFromServer[i]["filtervalue"])
            tempObj[filtersFromServer[i]["name"]]=jsonFilter
            finalFilterOptions.push(tempObj)

        }

        if(finalFilterOptions.length>0)
        {
            newMenuOptions[i18next.t("FILTERS")]=finalFilterOptions

        }
    }

    /**
     * Add Calendars to the menu
     */

    const calendars = await CalendarsHelper.getAllCalendars()
    for (const i in calendars)
    {
        var calendarOptions = []
        var finalKey = calendars[i]["account"]["name"]
        for (const j in calendars[i]["calendars"])
        {
            var tempObj = {}
            tempObj[calendars[i]["calendars"][j]["displayName"]]={calendars_id: calendars[i]["calendars"][j].calendars_id, caldav_accounts_id:  calendars[i]["account"]["caldav_accounts_id"]}

            calendarOptions.push(tempObj)

        }
        if(calendarOptions.length>0)
        {
            newMenuOptions[finalKey]=calendarOptions

        }
    }

    
    return newMenuOptions
}

async function getLabelArrayFromServer() : Promise<Object[]>
{
    var toReturn = []
    const response = await Labels.getAll()
    if(varNotEmpty(response) && varNotEmpty(response.status) && response.status==200 && response.data.success.toString()=="true" )
    {
        return getMessageFromAPIResponse(response.data)
    }else{
        return toReturn
    }
}