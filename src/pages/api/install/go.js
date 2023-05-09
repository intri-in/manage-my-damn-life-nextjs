import Settings from "@/helpers/api/classes/Settings"
import { User } from "@/helpers/api/classes/User"
import { getConnectionVar } from "@/helpers/api/db"
import { getICS } from "@/helpers/api/ical"
import { FINAL_TABLES, checkifDBExists, createMMDL_DB, getInstallDateFromDB, getListofTables, installTables, isInstalled } from "@/helpers/api/install"
import { middleWareForAuthorisation } from "@/helpers/api/user"
import { logVar, varNotEmpty } from "@/helpers/general"
import moment from "moment"
const LOGTAG = "api/install/go"

export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(process.env.NEXT_PUBLIC_TEST_MODE=="true")
        {
            //Test reponse.
            res.status(200).json({ success: true ,data: {message: "ERROR_MMDL_ALREADY_INSTALLED"}})
        }else{
            var con = getConnectionVar()
            var err =  con.ping()
            if(varNotEmpty(err))
            {
                res.status(503).json({ success: false ,data: {message: err}})
    
            }else{
    
                var dbExits= await checkifDBExists()
                if(varNotEmpty(dbExits) && dbExits == true)
                {
                    //Db Exists, probably. And the user has access to it.
                    
                    //We continue.


                    await moveOn(req, res)

                }else{
                    //Check if this is a docker install (so we assume user has root privileges on database).

                    if(varNotEmpty(process.env.DOCKER_INSTALL) && process.env.DOCKER_INSTALL=="true")
                    {
                        // This is a docker install.
                        // We now need to try to install the db.
                        var statusofDBCreation = await createMMDL_DB()
                        logVar(statusofDBCreation, LOGTAG+" statusofDBCreation")
                        if(statusofDBCreation==true)
                        {
                            await moveOn(req, res)
                        }else{
                            res.status(401).json({ success: false ,data: {message: "NO_ACCESS_TO_DB"}})

                        }
                    }else{
                        res.status(401).json({ success: false ,data: {message: "NO_ACCESS_TO_DB"}})

                    }

                }
              
    
            }
    
        }
    }
}

export async function moveOn(req, res)
{
    //We have successful connection to a database. Now we check the install info from database.

    var installed = await isInstalled()
    if(installed==true){
        res.status(409).json({ success: false ,data: {message: "ERROR_MMDL_ALREADY_INSTALLED"}})

    }else{
        //Continue.

        var listTbls = await getListofTables()

        var toInstall = []
        for (const k in FINAL_TABLES){

            var found =false
            for(const i in listTbls)
            {
                for (const m in listTbls[i])
                {
                    if(listTbls[i][m]==FINAL_TABLES[k])
                    {
                        found=true
                    }

                }

            }

            if(found==false){
                toInstall.push(FINAL_TABLES[k])
            }

        }
        logVar(toInstall, "Tables to Install>>")
        var finalReponse = []
        if(toInstall.length>0)
        {
            //Install each table.
            for(const tbl in toInstall)
            {
                var response= await installTables(toInstall[tbl])
                finalReponse.push([toInstall[tbl], response])
            }
        
        }
        res.status(200).json({ success: true ,data: {message:finalReponse}})

    }

} 