import { varNotEmpty } from "@/helpers/general";
import { getConnectionVar } from "../db";

export default class Settings{

   

    static async getAllforUserid(userid)
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT * FROM settings WHERE userid=?", [userid], function (err, result, fields) {
                con.end()

                if (err) {
                    console.log(err);
                    return resolve(null);
                }
                var resultFromDB=Object.values(JSON.parse(JSON.stringify(result)))
    
                if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
                {
                    return resolve(resultFromDB);
                }
                else
                {
                    return resolve(null);
                }
                
    
            })
        })

    }

    /**
     * Returns global settings
     * @returns Array with global settings.
     */
    static async getAllGlobal()
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT * FROM settings WHERE global=1", [], function (err, result, fields) {
                con.end()

                if (err) {
                    console.log(err);
                    return resolve(null);
                }
                var resultFromDB=Object.values(JSON.parse(JSON.stringify(result)))
    
                if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
                {
                    return resolve(resultFromDB);
                }
                else
                {
                    return resolve(null);
                }
                
    
            })
        })

    }

    static async getGlobal(name)
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT * FROM settings WHERE name=?", [name], function (err, result, fields) {
                con.end()

                if (err) {
                    console.log(err);
                    return resolve(null);
                }
                var resultFromDB=Object.values(JSON.parse(JSON.stringify(result)))
    
                if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
                {
                    return resolve(resultFromDB[resultFromDB.length-1]["value"]);
                }
                else
                {
                    return resolve(null);
                }
                
    
            })
        })

    }
    static async getForUser(userid, name )
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT * FROM settings WHERE userid=? AND name=?", [userid, name], function (err, result, fields) {
                con.end()

                if (err) {
                    console.log(err);
                    return resolve(null);
                }
                var resultFromDB=Object.values(JSON.parse(JSON.stringify(result)))
    
                if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
                {
                    return resolve(resultFromDB[resultFromDB.length-1]["value"]);
                }
                else
                {
                    return resolve(null);
                }
                
    
            })
        })


    }

    static async modifyForUser(userid, name, value, isGlobal)
    {
        var settingFromDB=null
        if(isGlobal=="1")
        {
            settingFromDB= await this.getGlobal(name)

        }else{
            settingFromDB= await this.getForUser(userid, name)

        }
        var con = getConnectionVar()
        if(varNotEmpty(settingFromDB))
        {
            // Setting exists in DB. Modify.

            var query="UPDATE settings SET ? WHERE name = ? AND userid=?"
            if(isGlobal=="1")
            {
                query="UPDATE settings SET ? WHERE name = ? AND global=1"
            }
            return new Promise( (resolve, reject) => {
                con.query(query,[{value :value }, name, userid], function (error, results, fields) {
                con.end()
                if (error) {
                    return resolve(false)
                }
                return resolve(true)
                })
           }
           )

        }else
        {
            // Add.
            if(isGlobal=="1")
            {
                userid=null
            }
            return new Promise( (resolve, reject) => {
                con.query('INSERT INTO settings (name, userid, global, value) VALUES (?,? ,?,?)', [name, userid, isGlobal, value], function (error, results, fields) {
                    con.end()
                    if (error) {
                        console.log(error.message)
                        return resolve(false)
                    }
                    
                    return resolve(true)
                    });
            
            })
        
        }
    }
}