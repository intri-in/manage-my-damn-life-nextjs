import Settings from "@/helpers/api/classes/Settings"
import { User } from "@/helpers/api/classes/User"
import { getConnectionVar } from "@/helpers/api/db"
import { getICS } from "@/helpers/api/ical"
import { FINAL_TABLES, getInstallDateFromDB, getListofTables, installTables, isInstalled } from "@/helpers/api/install"
import { middleWareForAuthorisation } from "@/helpers/api/user"
import { varNotEmpty } from "@/helpers/general"
import moment from "moment"

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
                            
                            if(listTbls[i]["Tables_in_local_mmdm"]==FINAL_TABLES[k])
                            {
                                found=true
                            }
        
                        }
    
                        if(found==false){
                            toInstall.push(FINAL_TABLES[k])
                        }
        
                    }
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
    
        }
    }
}