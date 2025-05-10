import { toast } from "react-toastify";
import { getErrorResponse } from "../errros";
import { getAPIURL } from "../general";
import { getAuthenticationHeadersforUser } from "./user";

export async function getTemplatesFromServer()
{
    const url_api=getAPIURL()+"templates/get"
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
