import {  isInstalled, testDBConnection } from "@/helpers/api/install"
import { logVar, varNotEmpty } from "@/helpers/general"
const LOGTAG = "api/install/check"
export default async function handler(req, res) {
    if (req.method === 'GET') {
        var connStatus = await testDBConnection()
            if(varNotEmpty(connStatus))
            {
                res.status(503).json({ success: false ,data: {message: "ERROR_DB_CON_ERROR", details: connStatus}})

            }else{

                    var installed = await isInstalled(true)
                    console.log("installed", installed)
                    //We have successful connection to a database. Now we check the install info from database.
                     if(installed==true)
                     {
                         res.status(200).json({ success: true ,data: {message: ""}})
     
                     }else{
                         res.status(200).json({ success: false ,data: {message: "NOT_INSTALLED"}})
     
                     }

            }
        


    } 
    else
    {
        res.status(422).json({ success: false ,data: {message: "INVALID_METHOD"}})

    }
}