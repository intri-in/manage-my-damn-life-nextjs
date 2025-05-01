import { varNotEmpty } from "@/helpers/general";
import { getConnectionVar, getSequelizeObj } from "../db";
import { settings } from "models/settings";

const SettingsModel = settings.initModel(getSequelizeObj())


export default class Settings{

   

    static async getAllforUserid(userid)
    {

        const resultFromDB =  await SettingsModel.findAll({
            where: {
                userid:userid.toString()
            },
        });
        if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
        {
            return resultFromDB;
        }
        else
        {
            return null;
        }

        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //     con.query("SELECT * FROM settings WHERE userid=?", [userid], function (err, result, fields) {
        //         con.end()

        //         if (err) {
        //             console.log(err);
        //             return resolve(null);
        //         }
        //         var resultFromDB=Object.values(JSON.parse(JSON.stringify(result)))
    
        //         if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
        //         {
        //             return resolve(resultFromDB);
        //         }
        //         else
        //         {
        //             return resolve(null);
        //         }
                
    
        //     })
        // })

    }

    /**
     * Returns global settings
     * @returns Array with global settings.
     */
    static async getAllGlobal()
    {

        const resultFromDB =  await SettingsModel.findAll({
            where: {
                global:"1"
            },
        });
        if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
        {
            return resultFromDB;
        }
        else
        {
            return null;
        }



        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //     con.query("SELECT * FROM settings WHERE global=1", [], function (err, result, fields) {
        //         con.end()

        //         if (err) {
        //             console.log(err);
        //             return resolve(null);
        //         }
        //         var resultFromDB=Object.values(JSON.parse(JSON.stringify(result)))
    
        //         if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
        //         {
        //             return resolve(resultFromDB);
        //         }
        //         else
        //         {
        //             return resolve(null);
        //         }
                
    
        //     })
        // })

    }

    static async getGlobal(name)
    {
        const resultFromDB =  await SettingsModel.findAll({
            where: {
                name:name
            },
        });
        if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
        {
            return resultFromDB[resultFromDB.length-1]["value"];
        }
        else
        {
            return null;
        }

        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //     con.query("SELECT * FROM settings WHERE name=?", [name], function (err, result, fields) {
        //         con.end()

        //         if (err) {
        //             console.log(err);
        //             return resolve(null);
        //         }
        //         var resultFromDB=Object.values(JSON.parse(JSON.stringify(result)))
    
        //         if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
        //         {
        //             return resolve(resultFromDB[resultFromDB.length-1]["value"]);
        //         }
        //         else
        //         {
        //             return resolve(null);
        //         }
                
    
        //     })
        // })

    }
    static async getForUser(userid, name )
    {
        const resultFromDB = await SettingsModel.findAll({
            where: {
                userid: userid.toString(),
                name:name
            },
        });
        if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
        {
            return resultFromDB[resultFromDB.length-1]["value"];
        }
        else
        {
            return null;
        }
        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //     con.query("SELECT * FROM settings WHERE userid=? AND name=?", [userid, name], function (err, result, fields) {
        //         con.end()

        //         if (err) {
        //             console.log(err);
        //             return resolve(null);
        //         }
        //         var resultFromDB=Object.values(JSON.parse(JSON.stringify(result)))
    
        //         if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
        //         {
        //             return resolve(resultFromDB[resultFromDB.length-1]["value"]);
        //         }
        //         else
        //         {
        //             return resolve(null);
        //         }
                
    
        //     })
        // })


    }

    static async modifyForUser(userid, name, value, isGlobal)
    {
        let settingFromDB : string | undefined | null=null
        if(isGlobal)
        {
            settingFromDB= await this.getGlobal(name)

        }else{
            settingFromDB= await this.getForUser(userid, name)

        }
        // console.log("settingFromDB", name, settingFromDB)
        if(settingFromDB)
        {
            // Setting exists in DB. Modify.

            let query =(!isGlobal) ? {
                where:{
                    name:name,
                    userid:userid.toString()
                }
            } : {
                    where:{
                        name:name,
                    }
                }
            
            await SettingsModel.update({value: value},
                query)
            return true
        //     let query="UPDATE settings SET ? WHERE name = ? AND userid=?"
        //     if(isGlobal=="1")
        //     {
        //         query="UPDATE settings SET ? WHERE name = ? AND global=1"
        //     }
        //     return new Promise( (resolve, reject) => {
        //         con.query(query,[{value :value }, name, userid], function (error, results, fields) {
        //         con.end()
        //         if (error) {
        //             return resolve(false)
        //         }
        //         return resolve(true)
        //         })
        //    }
        //    )

        }else
        {
            // Add.
            if(isGlobal=="1")
            {
                userid=null
            }

            await SettingsModel.create({ name:name, userid:userid, global:isGlobal, value:value});
            return true
            // return new Promise( (resolve, reject) => {
            //     con.query('INSERT INTO settings (name, userid, global, value) VALUES (?,? ,?,?)', [name, userid, isGlobal, value], function (error, results, fields) {
            //         con.end()
            //         if (error) {
            //             console.log(error.message)
            //             return resolve(false)
            //         }
                    
            //         return resolve(true)
            //         });
            
            // })
        
        }

        // if(settingFromDB)
        // {
        //     // Setting exists in DB. Modify.

        //     var query="UPDATE settings SET ? WHERE name = ? AND userid=?"
        //     if(isGlobal=="1")
        //     {
        //         query="UPDATE settings SET ? WHERE name = ? AND global=1"
        //     }
        //     return new Promise( (resolve, reject) => {
        //         con.query(query,[{value :value }, name, userid], function (error, results, fields) {
        //         con.end()
        //         if (error) {
        //             return resolve(false)
        //         }
        //         return resolve(true)
        //         })
        //    }
        //    )

        // }else
        // {
        //     // Add.
        //     if(isGlobal=="1")
        //     {
        //         userid=null
        //     }
        //     return new Promise( (resolve, reject) => {
        //         con.query('INSERT INTO settings (name, userid, global, value) VALUES (?,? ,?,?)', [name, userid, isGlobal, value], function (error, results, fields) {
        //             con.end()
        //             if (error) {
        //                 console.log(error.message)
        //                 return resolve(false)
        //             }
                    
        //             return resolve(true)
        //             });
            
        //     })
        
        // }

    }
}