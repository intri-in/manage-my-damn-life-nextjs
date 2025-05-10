import Settings from "@/helpers/api/classes/Settings"
import { User } from "@/helpers/api/classes/User"
import { getConnectionVar } from "@/helpers/api/db"
import { getICS } from "@/helpers/api/ical"
import { FINAL_TABLES, checkifDBExists, createMMDL_DB, getInstallDateFromDB, getListofTables, installTables, isInstalled, testDBConnection } from "@/helpers/api/install"
import { middleWareForAuthorisation } from "@/helpers/api/user"
import { logVar, varNotEmpty } from "@/helpers/general"
import { shouldLogforAPI } from "@/helpers/logs"
import moment from "moment"
import runManualMigrations from "runSequelizeMigrations"
const LOGTAG = "api/install/go"

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // if(process.env.NEXT_PUBLIC_TEST_MODE=="true")
        // {
        //     //Test reponse.
        //     return res.status(200).json({ success: true ,data: {message: "ERROR_MMDL_ALREADY_INSTALLED"}})
        // }
        const ok =  await testDBConnection()
        if(!ok) return res.status(503).json({ success: false ,data: {message: err}})

        

        return await moveOn(req, res)
        const dbExits= await checkifDBExists()
        if(varNotEmpty(dbExits) && dbExits == true)
        {
            //Db Exists, probably. And the user has access to it.
            
            //We continue.



        }else{

            return res.status(401).json({ success: false ,data: {message: "NO_ACCESS_TO_DB"}})
            //Check if this is a docker install (so we assume user has root privileges on database).

            // if(varNotEmpty(process.env.DOCKER_INSTALL) && process.env.DOCKER_INSTALL=="true")
            // {
            //     // This is a docker install.
            //     // We now need to try to install the db.
            //     var statusofDBCreation = await createMMDL_DB()
            //     logVar(statusofDBCreation, LOGTAG+" statusofDBCreation")
            //     if(statusofDBCreation==true)
            //     {
            //     }else{
            //         

            //     }
            // }else{
            //     res.status(401).json({ success: false ,data: {message: "NO_ACCESS_TO_DB"}})

            // }

        }
            

    
        
    }
}

async function moveOn(req, res)
{
    //We have successful connection to a database. Now we check the install info from database.

    const installed = await isInstalled(true)
    if(shouldLogforAPI()) console.log('/api/install/go moveOn -> Installed :', installed)
    if(installed==true){
        return res.status(409).json({ success: false ,data: {message: "ERROR_MMDL_ALREADY_INSTALLED"}})

    }else{
        // All required tables weren't found in the database.
        // Either the use didn't run the migrate command, or MMDL is being run using docker.
        // We try to run the migrations here.
        
        try{
            const result = await runManualMigrations()
            console.log("result", result)
            if(result==true){
                
                return res.status(200).json({ success: true ,data: {message:"INSTALL_OK", details: result}})
            }else{
                return res.status(500).json({ success:false ,data: {message:"ERROR_GENERIC", details:JSON.stringify(result)}})
    
            }
    
        }
        catch (e){
            console.log(e)
            return res.status(500).json({ success:false ,data: {message:"ERROR_GENERIC", details:JSON.stringify(e)}})

        }

      
        
    }

} 
/**
 * @deprecated
 * Install process before v0.3.0 has now been moved here. 
 */
async function installTables_OldVersion(){
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

}