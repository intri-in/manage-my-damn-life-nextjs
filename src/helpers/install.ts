import { NextRouter } from "next/router"
import { getAPIURL, varNotEmpty } from "./general"
import { toast } from "react-toastify"

export async function getIfInstalled():Promise<boolean>{
    const url_api = getAPIURL() + "install/check"


    const requestOptions =
    {
        method: 'GET',
        //headers: new Headers({ 'authorization': authorisationData }),
    }

    return new Promise( (resolve, reject) => {
        fetch(url_api, requestOptions)
        .then(response => {
            
            return response.json()
        
        })
        .then((body) => {
            if(varNotEmpty(body) && varNotEmpty(body.success)){
                if(body.success==true){

                    return resolve(true)
                }else{
                    return resolve(false)
                }
            }else{
                return resolve(false)
            }
        }).catch(e =>{
            console.error("getIfInstalled", e)
            return resolve(false)
        })
    })
}

export async function installCheck(router: NextRouter){
    const installed: boolean = await getIfInstalled()
    
    if(!installed){
        router.push('/install')
    }

}