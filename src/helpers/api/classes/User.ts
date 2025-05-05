import { getConnectionVar, getSequelizeObj } from "../db";
import { getUserHashSSIDfromAuthorisation, getUseridFromUserhash, getUseridFromUserhash_ORM } from "@/helpers/api/user"
import crypto from "crypto"
import { CaldavAccount } from "./CaldavAccount";
import { varNotEmpty } from "@/helpers/general";
import { Calendars } from "./Calendars";
import Settings from "@/helpers/api/classes/Settings"
import bcrypt from 'bcryptjs';
import { users } from "models/users";
import { ssid_table } from "models/ssid_table";
import { CaldavAccountClass } from "../v2/classes/CaldavAccountClass";
import { caldav_accounts } from "models/caldav_accounts";

const userModel = users.initModel(getSequelizeObj())
export class User{

    userid: number | string
    static userModel
    static ssidModel
    static caldav_accountsModel
    constructor(userid)
    {
        if(varNotEmpty(userid)==false ||varNotEmpty(userid) && userid=="" )
        {
            throw new Error("User id cannot be empty.")
        }
        this.userid= userid
        User.userModel = users.initModel(getSequelizeObj())
        User.ssidModel = ssid_table.initModel(getSequelizeObj())
        User.caldav_accountsModel = caldav_accounts.initModel(getSequelizeObj())
    }


    static async getAll()
    {
        const res = await User.userModel.findAll()

        return res
        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //     con.query("SELECT username, email, created, level,users_id FROM users ", [ ], function (err, result, fields) {
                
        //         con.end()
        //         if (err) {
        //             console.log(err);
        //             return resolve(null)
        //         }                
        //         return resolve(Object.values(JSON.parse(JSON.stringify(result))));
    
        //     })
        // })
  
    }

    static async getDatafromUsername(username)
    {
        const res = await userModel.findAll({
            where:{
                username:username,
            }, 
            raw: true,
            nest: true,
        })
        return res

        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //     con.query("SELECT * FROM users WHERE username= ?", [ username], function (err, result, fields) {
        //         con.end()
        //         if (err) {
        //             console.log(err);
        //         }                
        //         return resolve(Object.values(JSON.parse(JSON.stringify(result))));
    
        //     })
        // })
  
    }

    /**
     * 
     * @param {*} authorisationHeaders Get userID from authorisation headers
     * @returns UserID
     */
    static async idFromAuthorisation(authorisationHeaders)
    {
      var userHash= await getUserHashSSIDfromAuthorisation(authorisationHeaders)
      if(userHash && Array.isArray(userHash)){

          var userid = await getUseridFromUserhash_ORM(userHash[0])
          return userid
      }

        return null

    }
    async delete()
    {
        await User.userModel.destroy({
            where: {
                users_id: this.userid,
              },
        })
        return true
        // var con = getConnectionVar()

        // return new Promise( (resolve, reject) => {
        //     con.query('DELETE FROM users WHERE users_id=?', [this.userid], function (error, results, fields) {
        //     con.end()
        //     if (error) {
        //         console.log(error.message)
        //         return resolve(false)
        //     }
    
        //     return resolve(true)
        //     });
        // })
    
    
    }

    async deleteAllSessions()
    {
        var userHash = await this.getHash()
        await User.ssidModel.destroy({
            where: {
                userhash: userHash,
              },
        })
        return true

        // if(varNotEmpty(userHash))
        // {
        //     var con = getConnectionVar()

        //     return new Promise( (resolve, reject) => {
        //         con.query('DELETE FROM ssid_table WHERE userhash=? ', [userHash], function (error, results, fields) {
        //             con.end()
        //             if (error) {
        //                 console.log(error.message)
        //                 return resolve(false)
        //             }
            
        //             return resolve(true)
        //             });
        
        //     })
    
        // }else{
        //     return false
        // }
    
    
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

        const res = await User.userModel.findOne({
            where:{
                users_id:this.userid,
            }, 
            raw: true,
            nest: true,
        })
        return res

        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //     con.query("SELECT users_id,username,email,created,level,userhash,mobile FROM users WHERE users_id= ? ", [this.userid], function (err, result, fields) {
        //         con.end()
        //         if (err) {
        //             console.log(err)
        //             return resolve(null)
        //         }
        //         return resolve(Object.values(JSON.parse(JSON.stringify(result)))[0])
        //     }) 


        // })
    }

    async isAdmin()
    {
        var userInfo = await this.getInfo()
        if(varNotEmpty(userInfo) && ("level" in userInfo) && userInfo.level && userInfo.level=="1")
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
        var allCaldav: [] = await this.getCaldavAccounts()
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
        const res = await User.caldav_accountsModel.findAll({
            where:{
                caldav_accounts_id:parseInt(caldav_accounts_id),
                userid: this.userid.toString()
            }, 
            raw: true,
            nest: true,
        })

        if(res && Array.isArray(res) && res.length>0 && res[0]["caldav_accounts_id"]==caldav_accounts_id){
            return true
        }
        return false

        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //     con.query("SELECT * FROM caldav_accounts WHERE caldav_accounts_id= ? AND userid=?", [caldav_accounts_id, this.userid], function (err, result, fields) {
        //         con.end()
        //         if (err) {
        //             console.log(err);
        //             return resolve(false)
        //         }                
        //         var resultFromDB=Object.values(JSON.parse(JSON.stringify(result)))
    
        //         if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
        //         {
        //             return resolve(true);
        //         }
        //         else
        //         {
        //             return resolve(false);
        //         }
                
    
        //     })
        // })
    

    }
    async getCalendarID_FromURLandCaldavAccountID(caldav_accounts_id, url){

        const userHasAccesstoCaldavAccount = await this.hasAccesstoCaldavAccountID(caldav_accounts_id)

        if(userHasAccesstoCaldavAccount){
            return await CaldavAccount.checkIfCalendarURLinCaldavAccount_GetID(caldav_accounts_id, url)
        }
    }
    // static async hasAccesstoCaldavAccountID(caldav_accounts_id, userid)
    // {

    //     const caldavObj = new CaldavAccountClass(userid)

    //     var con = getConnectionVar()
    //     return new Promise( (resolve, reject) => {
    //         con.query("SELECT * FROM caldav_accounts WHERE caldav_accounts_id= ? AND userid=?", [caldav_accounts_id, this.userid], function (err, result, fields) {
    //             con.end()
    //             if (err) {
    //                 console.log(err);
    //                 return resolve(false);

    //             }
    //             var resultFromDB=Object.values(JSON.parse(JSON.stringify(result)))
    
    //             if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
    //             {
    //                 return resolve(true);
    //             }
    //             else
    //             {
    //                 return resolve(false);
    //             }
                
    
    //         })
    //     })
    
    
    // }

     /**
    * Gets userid from userhash
    * @param {*} userhash 
    * @returns ID of the user in the database. Empty string if user isn't present.
    */
   static async getIDFromUserhash(userhash)
   {
        const resultfromDB = await userModel.findAll({
            where:{
                userhash: userhash
            }, 
            raw: true,
            nest: true,
        })



        if(resultfromDB!=null&&Array.isArray(resultfromDB)&&resultfromDB.length>0)
        {
            return resultfromDB[0]["users_id"]

        }
        else
        {
            return ""
        }
    //    var con = getConnectionVar()
    //    return new Promise( (resolve, reject) => {
    //        con.query("SELECT * FROM users WHERE userhash=? ", [ userhash], function (err, result, fields) {
    //             con.end()
    //             if (err) {
    //                     console.log(err);
    //                     return resolve("")
    //                 }               
    //             var resultfromDB = Object.values(JSON.parse(JSON.stringify(result)))
   
    //            if(resultfromDB!=null&&Array.isArray(resultfromDB)&&resultfromDB.length>0)
    //            {
    //                return resolve(resultfromDB[0].users_id)
   
    //            }
    //            else
    //            {
    //                return resolve("")
    //            }
    //            return resolve("");
   
    //        })
    //    })
   }

    async updatePassword(newPassword)
    {
        //var password = crypto.createHash('sha512').update(newPassword).digest('hex')
        const salt = await bcrypt.genSalt(10)
        const password  = await bcrypt.hash(newPassword, salt)

        await User.userModel.update(
        { password: password },
        {
            where: {
                users_id: this.userid,
            },
        },
        )

        return null
        // var con = getConnectionVar()
        // return new Promise( (resolve, reject) => {
        //      con.query('UPDATE users SET ? WHERE users_id = ?',[{password :password, }, this.userid], function (error, results, fields) {
        //     if (error) {
        //         return resolve(error.message)
        //     }
        //     return resolve(null)
        //     })
        // }
        // )
    
    }

    /**
     * Gets all events for the current user.
     * @param {*} type Type of event like VTODO, VEVENT, VTIMEZONE
     * @returns Array of events.
     */
    async getAllEvents(type)
    {
        var toReturn: any[] = []
        var caldav_accounts = await this.getCaldavAccounts()
        for(const i in caldav_accounts)
        {
            var caldavAccountObject = new CaldavAccount(caldav_accounts[i])
            var allCalendarsForUser = await caldavAccountObject.getAllCalendars()
            if(varNotEmpty(allCalendarsForUser))
            {
                for(const k in allCalendarsForUser)
                {
                    const calObj = new Calendars(allCalendarsForUser[k])
                    var allEvents  = await calObj.getAllEvents(type)
                    for(const l in allEvents)
                    {
                        toReturn.push(allEvents[l])
                    }
                }
            }
        }

        return toReturn
    }

    async getCaldavAccounts() : Promise<any>
    {

        const resultfromDB = await User.caldav_accountsModel.findAll({
            attributes: ['caldav_accounts_id', 'username','url','name'],
            where:{
                userid: this.userid
            }, 
            raw: true,
            nest: true,
        })

        return resultfromDB

    //   var con = getConnectionVar()
    //   return new Promise( (resolve, reject) => {
    //       con.query("SELECT caldav_accounts_id,username,url,name FROM caldav_accounts WHERE userid= ?", [ this.userid], function (err, result, fields) {
    //         con.end()
    //         if (err) {
    //             console.log(err);
    //             return resolve(null)
    //         }             
    //         return resolve(Object.values(JSON.parse(JSON.stringify(result))));
  
    //       })
    //   })
    }

   async getCaldavAccountsAllData()
    {
        const resultfromDB = await User.caldav_accountsModel.findAll({
            where:{
                userid: this.userid.toString()
            }, 
            raw: true,
            nest: true,
        })

        return resultfromDB

    //   var con = getConnectionVar()
    //   return new Promise( (resolve, reject) => {
    //       con.query("SELECT * FROM caldav_accounts WHERE userid= ?", [ this.userid], function (err, result, fields) {
    //         con.end()
    //         if (err) {
    //             console.log(err);
    //             return resolve(null)
    //         }              
    //           return resolve(Object.values(JSON.parse(JSON.stringify(result))));

    //       })
    //   })

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