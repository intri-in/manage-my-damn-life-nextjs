import { getAPIURL, logVar, varNotEmpty } from "@/helpers/general";
import axios from "axios";
import { getAuthenticationHeadersforUser } from "../user";

export default class Labels{
    
    static async getAll() : Promise<{status: number, data: {success: boolean, message: any} }>{
    
        const url_api=getAPIURL()+"caldav/calendars/labels"
        const authorisationData=await getAuthenticationHeadersforUser()
    
        const requestOptions =
        {
            method: 'GET',
            mode: 'cors',
            headers: new Headers({'authorization': authorisationData}),
    
        }
    
        return new Promise( (resolve, reject) => {

            axios({
                method: 'get',
                url: url_api,
                headers: { 'authorization': authorisationData, 'Content-Type': 'application/json' }
              }).then(function (response) {
              
                
                    return resolve(response)

               
              })  .catch(function (error) {
                logVar(error, "Labels.getAll");
                return resolve({status: 501, data: {success: false, message: null}})
              });
        })
    }
       
}