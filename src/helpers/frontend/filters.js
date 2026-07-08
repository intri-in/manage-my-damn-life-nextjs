import moment from "moment"
import { getAuthenticationHeadersforUser } from "./user"
import { getAPIURL, varNotEmpty } from "../general"
import { getErrorResponse } from "../errros"
import { getMessageFromAPIResponse } from "./response"
import { END_OF_THE_UNIVERSE_DATE } from "@/config/constants"
import { checkIfFilterValid } from "./filtersTS"


export async function saveFiltertoServer(name, filter)
{
    const url_api=getAPIURL()+"filters/add"

    const authorisationData=await getAuthenticationHeadersforUser()


    return new Promise( (resolve, reject) => {

        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({"name":name, "filtervalue": filter}),
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData, 'Content-Type':'application/json'}),
        }
            fetch(url_api, requestOptions)
        .then(response => response.json())
        .then((body) =>{
            return resolve(body)
            }).catch(e =>
            {
                console.error("saveFiltertoServer: ",e)
                return resolve(getErrorResponse(e.message))
            })
    
    
    })

}

export async function makeFilterEditRequest(filterid, name, finalFilter)
{
    const url_api=getAPIURL()+"filters/modify"

    const authorisationData=await getAuthenticationHeadersforUser()


    return new Promise( (resolve, reject) => {

        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({"name":name, "filtervalue": finalFilter, "custom_filters_id": filterid}),
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData, 'Content-Type':'application/json'}),
        }
        
            fetch(url_api, requestOptions)
        .then(response => response.json())
        .then((body) =>{
            return resolve(body)
           
            
        }).catch(e =>{
            console.error(e)
            return resolve(getErrorResponse(e))
        })
    
    
    })

}




export async function getAllFilters(){
    var filtersFromServer = await getFiltersFromServer()
    if(varNotEmpty(filtersFromServer) && varNotEmpty(filtersFromServer.success) && filtersFromServer.success==true)
    {
        return getMessageFromAPIResponse(filtersFromServer)
    }
    return []
}
export async function getFiltersFromServer()
{
    const url_api=getAPIURL()+"filters/get"
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }

    return new Promise( (resolve, reject) => {
            const response =  fetch(url_api, requestOptions)
            .then(response => response.json())
            .then((body) =>{
                return resolve(body)       
    
                }
            ).catch(e =>{
            console.error("getFiltersFromServer",e)
            return resolve(getErrorResponse(e))
            })
       
    });
  

}




export function getFilterReadytoPost(filter)
{
    var newFilter = {}
    if(varNotEmpty(filter) && varNotEmpty(filter.logic) && varNotEmpty(filter.filter))
    {
        newFilter = {logic: filter.logic, filter:{}}
        
        if(varNotEmpty(filter.filter.due) && Array.isArray(filter.filter.due) && (filter.filter.due[0]!="" || filter.filter.due[1]!=""))
        {
            newFilter.filter.due = filter.filter.due

            if(!newFilter.filter.due[1]){
                newFilter.filter.due[1]=END_OF_THE_UNIVERSE_DATE
            }
        }

        if(varNotEmpty(filter.filter.priority) &&filter.filter.priority!="")
        {
            newFilter.filter.priority = filter.filter.priority
        }

        if(varNotEmpty(filter.filter.label) && Array.isArray(filter.filter.label) && filter.filter.label.length>0)
        {
            newFilter.filter.label = filter.filter.label
        }
        

    }

    // console.log("new Filter", newFilter)
    return newFilter


}

