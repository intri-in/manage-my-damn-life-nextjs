import { getAPIURL, logVar } from "@/helpers/general";
import { getAuthenticationHeadersforUser } from "../user";
import { getErrorResponse } from "@/helpers/errros";

export class FilterHelper{


    /**
     * 
     * @param {*} filter_id 
     */
    static async deleteFromServer(filter_id)
    {
        const url_api=getAPIURL()+"filters/delete?filterid="+filter_id
        const authorisationData=await getAuthenticationHeadersforUser()
    
        const requestOptions =
        {
            method: 'DELETE',
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData}),
    
        }
    
        return new Promise( (resolve, reject) => {
            try{
                const response =  fetch(url_api, requestOptions)
                .then(response => response.json())
                .then((body) =>{
                    return resolve(body)       
        
                    }
                )
    
            }
            catch(e)
            {
                logVar(e, "deleteFromServer")
                return resolve(getErrorResponse(e))
            }
        });
      
    
    }


}