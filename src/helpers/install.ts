import { NextRouter } from "next/router"
import { getAPIURL, varNotEmpty } from "./general"
import { toast } from "react-toastify"
import { getInstallCheckCookie, setInstallOKCookie } from "./frontend/cookies"
import { INSTALL_CHECK_THRESHOLD_SECONDS } from "@/config/constants"

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
                    //Save install check cookie
                    setInstallOKCookie(Date.now())
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
        //router.push('/install')
    }
    return installed


}

export async function installCheck_Cookie(router){
    let installed =false
    var lastTimeChecked = getInstallCheckCookie()
    // console.log("lastTimeChecked", lastTimeChecked, (Date.now()-lastTimeChecked>INSTALL_CHECK_THRESHOLD_SECONDS*1000))
    if(!lastTimeChecked){
        installed = await installCheck(router)
        return installed
    }else if(lastTimeChecked && (Date.now()-lastTimeChecked>INSTALL_CHECK_THRESHOLD_SECONDS*1000)) {
        installed = await installCheck(router)
        return installed
    }else if(lastTimeChecked){
        return true
    }

}