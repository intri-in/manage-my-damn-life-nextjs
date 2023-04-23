import Settings from "@/helpers/api/classes/Settings"
import { User } from "@/helpers/api/classes/User"
import { getConnectionVar } from "@/helpers/api/db"
import { getICS } from "@/helpers/api/ical"
import { getInstallDateFromDB, isInstalled, testDBConnection } from "@/helpers/api/install"
import { middleWareForAuthorisation } from "@/helpers/api/user"
import { varNotEmpty } from "@/helpers/general"
import moment from "moment"

export default async function handler(req, res) {
    if (req.method === 'GET') {

        var connStatus = await testDBConnection()
            if(varNotEmpty(connStatus))
            {
                res.status(503).json({ success: false ,data: {message: "ERROR_DB_CON_ERROR", details: connStatus}})

            }else{

                var installed = await isInstalled()
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