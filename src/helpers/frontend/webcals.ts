import { toast } from "react-toastify";
import { getAPIURL } from "../general";
import { getAuthenticationHeadersforUser } from "./user";
import { getErrorResponse } from "../errros";
import { addWebCalAccounttoDexie, addWebCalEventstoDexie, getAllWebcalsforCurrentUserfromDexie, getEventsfromWebcal_Dexie, isWebCalAccountAlreadyinDexie } from "./dexie/webcal_dexie";
import { WebCalEvents } from "./dexie/dexieDB";

export async function getWebCalsFromServer()
{
    const url_api=getAPIURL()+"webcal/get"
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }

    return new Promise( (resolve, reject) => {
            const response =  fetch(url_api, requestOptions as RequestInit)
            .then(response => response.json())
            .then((body) =>{
                let toReturn: any[] = []
                if(body && typeof(body) == "object" && ("success" in body) && body.success){
                    if("data" in body && typeof(body.data) == "object" && body.data &&  "message" in body.data && body.data.message){
                        if(Array.isArray(body.data.message)){
                            toReturn =[...body.data.message]
                        }
            
                    }
                }
            
                return resolve(toReturn)       

                }
            ).catch(e =>{
            console.error("getTemplatesFromServer",e)
            if(typeof(window)!="undefined"){
                toast.error(e.message)
            }
            return resolve(getErrorResponse(e))
            })
       
    });
  

}
export async function setupWebCalDataFromServer(){
    const webCals = await getWebCalsFromServer()
    // console.log("webCals", webCals)
    if(webCals && Array.isArray(webCals) && webCals.length>0){
        for (const i in webCals){
            if(await isWebCalAccountAlreadyinDexie(webCals[i]["id"]) == false){

                await addWebCalAccounttoDexie(webCals[i]["id"],webCals[i]["name"],webCals[i]["link"],webCals[i]["updateInterval"],webCals[i]["lastFetched"],webCals[i]["colour"])
                await addWebCalEventstoDexie(webCals[i]["id"],webCals[i]["data"])
            }
        }
    }
}



export async function getAllEventsFromWebcalForRender(){
    const allWebcals = await getAllWebcalsforCurrentUserfromDexie()
    let toReturn: WebCalEvents[] = []
    
    if (allWebcals && Array.isArray(allWebcals) && allWebcals.length>0){
        for (const i in allWebcals){
            let webcals_events = await getEventsfromWebcal_Dexie(allWebcals[i].webcals_id)
            //Add Colour
            for (const j in webcals_events){
                webcals_events[j]["colour"]=allWebcals[i].colour
            }
            toReturn = [...toReturn, ...webcals_events]


        }
    }

    return toReturn
}