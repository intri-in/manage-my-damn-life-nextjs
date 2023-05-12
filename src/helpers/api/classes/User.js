import { getConnectionVar } from "../db";
import { getUserHashSSIDfromAuthorisation, getUseridFromUserhash } from "@/helpers/api/user"
import crypto from "crypto"
import { CaldavAccount } from "./CaldavAccount";
import { varNotEmpty } from "@/helpers/general";
import { Calendars } from "./Calendars";
import Settings from "@/helpers/api/classes/Settings"

export class User{

    constructor(userid)
    {
        if(varNotEmpty(userid)==false ||varNotEmpty(userid) && userid=="" )
        {
            throw new Error("User id cannot be empty.")
        }
        this.userid= userid
    }


    static async getAll()
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT username, email, created, level,users_id FROM users ", [ ], function (err, result, fields) {
                
                con.end()
                if (err) {
                    console.log(err);
                    return resolve(null)
                }                
                return resolve(Object.values(JSON.parse(JSON.stringify(result))));
    
            })
        })
  
    }

    static async getDatafromUsername(username)
    {

        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT * FROM users WHERE username= ?", [ username], function (err, result, fields) {
                con.end()
                if (err) {
                    console.log(err);
                }                
                return resolve(Object.values(JSON.parse(JSON.stringify(result))));
    
            })
        })
  
    }

    /**
     * 
     * @param {*} authorisationHeaders Get userID from authorisation headers
     * @returns UserID
     */
    static async idFromAuthorisation(authorisationHeaders)
    {
      var userHash= await getUserHashSSIDfromAuthorisation(authorisationHeaders)
      var userid = await getUseridFromUserhash(userHash[0])
      return userid

    }
    async delete()
    {
        var con = getConnectionVar()

        return new Promise( (resolve, reject) => {
            con.query('DELETE FROM users WHERE users_id=?', [this.userid], function (error, results, fields) {
            con.end()
            if (error) {
                console.log(error.message)
                return resolve(false)
            }
    
            return resolve(true)
            });
        })
    
    
    }

    async deleteAllSessions()
    {
        var userHash = await this.getHash()
        if(varNotEmpty(userHash))
        {
            var con = getConnectionVar()

            return new Promise( (resolve, reject) => {
                con.query('DELETE FROM ssid_table WHERE userhash=? ', [userHash], function (error, results, fields) {
                    con.end()
                    if (error) {
                        console.log(error.message)
                        return resolve(false)
                    }
            
                    return resolve(true)
                    });
        
            })
    
        }else{
            return false
        }
    
    
    }

    async getHash()
    {
        var allInfo = await this.getInfo()

        if(varNotEmpty(allInfo) && varNotEmpty(allInfo.userHash))
        {
            return allInfo.userhash
        }else{
            return null
        }
        
    }
    async getInfo()
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT users_id,username,email,created,level,userhash,mobile FROM users WHERE users_id= ? ", [this.userid], function (err, result, fields) {
                con.end()
                if (err) {
                    console.log(err)
                    return resolve(null)
                }
                return resolve(Object.values(JSON.parse(JSON.stringify(result)))[0])
            }) 


        })
    }

    async isAdmin()
    {
        var userInfo = await this.getInfo()
        if(varNotEmpty(userInfo) && varNotEmpty(userInfo.level) && userInfo.level=="1")
        {
            return true
        }
        else{
            return false
        }
    }
    /**
     * Checks if current user has access to calendar. Return full calendar object if true,
     * null otherwise
     * @param {*} calendarObject Object of class Calendars 
     * @returns full calendar object if user has access, null otherwise
     */
    async hasAccesstoCalendar(calendarObject)
    {
        var toReturn = null
        var allCaldav = await this.getCaldavAccounts()
        for(const i in allCaldav)
        {
            
            var caldavAccountObject = new CaldavAccount(allCaldav[i])
            var allCalendarsForUser = await caldavAccountObject.getAllCalendars()
            if(varNotEmpty(allCalendarsForUser))
            {
                for(const k in allCalendarsForUser)
                {
                    if(allCalendarsForUser[i].calendars_id==calendarObject.calendars_id)
                    {
                        return allCalendarsForUser[i]
                    }
                }
                
            }
            
    
        }

        return toReturn
    }
    async hasAccesstoCaldavAccountID(caldav_accounts_id)
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT * FROM caldav_accounts WHERE caldav_accounts_id= ? AND userid=?", [caldav_accounts_id, this.userid], function (err, result, fields) {
                con.end()
                if (err) {
                    console.log(err);
                    return resolve(false)
                }                
                var resultFromDB=Object.values(JSON.parse(JSON.stringify(result)))
    
                if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
                {
                    return resolve(true);
                }
                else
                {
                    return resolve(false);
                }
                
    
            })
        })
    

    }
    static async hasAccesstoCaldavAccountID(caldav_accounts_id)
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT * FROM caldav_accounts WHERE caldav_accounts_id= ? AND userid=?", [caldav_accounts_id, this.userid], function (err, result, fields) {
                con.end()
                if (err) {
                    console.log(err);
                    return resolve(false);

                }
                var resultFromDB=Object.values(JSON.parse(JSON.stringify(result)))
    
                if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
                {
                    return resolve(true);
                }
                else
                {
                    return resolve(false);
                }
                
    
            })
        })
    
    
    }

     /**
    * Gets userid from userhash
    * @param {*} userhash 
    * @returns ID of the user in the database. Empty string if user isn't present.
    */
   static async getIDFromUserhash(userhash)
   {
       var con = getConnectionVar()
       return new Promise( (resolve, reject) => {
           con.query("SELECT * FROM users WHERE userhash=? ", [ userhash], function (err, result, fields) {
                con.end()
                if (err) {
                        console.log(err);
                        return resolve("")
                    }               
                var resultfromDB = Object.values(JSON.parse(JSON.stringify(result)))
   
               if(resultfromDB!=null&&Array.isArray(resultfromDB)&&resultfromDB.length>0)
               {
                   return resolve(resultfromDB[0].users_id)
   
               }
               else
               {
                   return resolve("")
               }
               return resolve("");
   
           })
       })
   }

    async updatePassword(newPassword)
    {
        var password = crypto.createHash('sha512').update(newPassword).digest('hex')

        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
             con.query('UPDATE users SET ? WHERE users_id = ?',[{password :password, }, this.userid], function (error, results, fields) {
            if (error) {
                return resolve(error.message)
            }
            return resolve(null)
            })
        }
        )
    
    }

    /**
     * Gets all events for the current user.
     * @param {*} type Type of event like VTODO, VEVENT, VTIMEZONE
     * @returns Array of events.
     */
    async getAllEvents(type)
    {
        var toReturn = []
        var caldav_accounts = await this.getCaldavAccounts()
        for(const i in caldav_accounts)
        {
            var caldavAccountObject = new CaldavAccount(caldav_accounts[i])
            var allCalendarsForUser = await caldavAccountObject.getAllCalendars()
            if(varNotEmpty(allCalendarsForUser))
            {
                for(const k in allCalendarsForUser)
                {
                    var calObj = new Calendars(allCalendarsForUser[k])
                    var allEvents = await calObj.getAllEvents(type)
                    for(const l in allEvents)
                    {
                        toReturn.push(allEvents[l])
                    }
                }
            }
        }

        return toReturn
    }

    async getCaldavAccounts()
    {
      var con = getConnectionVar()
      return new Promise( (resolve, reject) => {
          con.query("SELECT caldav_accounts_id,username,url,name FROM caldav_accounts WHERE userid= ?", [ this.userid], function (err, result, fields) {
            con.end()
            if (err) {
                console.log(err);
                return resolve(null)
            }             
            return resolve(Object.values(JSON.parse(JSON.stringify(result))));
  
          })
      })
    }

   async getCaldavAccountsAllData()
    {

      var con = getConnectionVar()
      return new Promise( (resolve, reject) => {
          con.query("SELECT * FROM caldav_accounts WHERE userid= ?", [ this.userid], function (err, result, fields) {
            con.end()
            if (err) {
                console.log(err);
                return resolve(null)
            }              
              return resolve(Object.values(JSON.parse(JSON.stringify(result))));

          })
      })

   }

   /**
    * All functions related to Settings
    */
  

   async getSetting(name)
   {
        return await Settings.getForUser(this.userid, name)
   }

   async modifySetting(name, value, isGlobal)
   {
        return await Settings.modifyForUser(this.userid, name, value, isGlobal)
   }
}