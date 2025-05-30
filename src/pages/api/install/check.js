import {  isInstalled, isInstalled_CheckWithSequelize, testDBConnection } from "@/helpers/api/install"
import { logVar, varNotEmpty } from "@/helpers/general"
import { shouldLogforAPI } from "@/helpers/logs"
const LOGTAG = "api/install/check"
export default async function handler(req, res) {
    if (req.method === 'GET') {
        try{
            var connStatus = await testDBConnection()
        if(shouldLogforAPI()) console.log("/api/install/check connStatus", connStatus)
            if(!connStatus)  return res.status(503).json({ success: false ,data: {message: "ERROR_DB_CON_ERROR", details: connStatus}})


            const installed = await isInstalled_CheckWithSequelize()

            if(shouldLogforAPI()) console.log(LOGTAG, "installed ->", installed)
            //We have successful connection to a database. Now we check the install info from database.
                if(installed==true)
                {
                    return res.status(200).json({ success: true ,data: {message: ""}})

                }else{
                return  res.status(200).json({ success: false ,data: {message: "NOT_INSTALLED"}})

                }

        }catch(e){
            res.status(500).json({ success: false ,data: {message: e.message}})

        }
        
           
        


    } 
    else
    {
        res.status(422).json({ success: false ,data: {message: "INVALID_METHOD"}})

    }
}