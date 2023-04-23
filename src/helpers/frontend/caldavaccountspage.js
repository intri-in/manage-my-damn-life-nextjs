import { getCaldavAccountsfromServer, saveCaldavAccounstoDB } from "./calendar"
import { getcalendarDB } from "./db"

export async function getAllAddedCaldavAccounts(){

    
    return new Promise( (resolve, reject) => {
    
        getcalendarDB().caldav_accounts.toArray().then((caldav_accounts) =>{

            if(caldav_accounts!=null && caldav_accounts.length >0)
            {

                resolve({success: true, data: {message: caldav_accounts}})
            }
            else
            {
                //Get Caldav accounts from server.
                getCaldavAccountsfromServer().then((response) =>{
                    if(response.success==true)
                    {
                        saveCaldavAccounstoDB(response.data.message)
                    }
                    else
                    {
                        resolve({success: false, data: {message: response.data.message}})
                    }

                })

            }
        })


    })
}



