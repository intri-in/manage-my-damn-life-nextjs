import { getConnectionVar } from "../db";
import { getUserHashSSIDfromAuthorisation, getUseridFromUserhash } from "@/helpers/api/user"
import crypto from "crypto"

export class User{

    constructor(userid)
    {
        this.userid= userid
    }


    static async getDatafromUsername(username)
    {

        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT * FROM users WHERE username= ?", [ username], function (err, result, fields) {
                if (err) throw err;
                con.end()
                resolve(Object.values(JSON.parse(JSON.stringify(result))));
    
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
    

    static async hasAccesstoCaldavAccountID(caldav_accounts_id)
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT * FROM caldav_accounts WHERE caldav_accounts_id= ? AND userid=?", [caldav_accounts_id, this.userid], function (err, result, fields) {
                if (err) throw err;
                con.end()
                var resultFromDB=Object.values(JSON.parse(JSON.stringify(result)))
    
                if(resultFromDB!=null&&Array.isArray(resultFromDB)&&resultFromDB.length>0)
                {
                    resolve(true);
                }
                else
                {
                    resolve(false);
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
               if (err) throw err;
               con.end()
               var resultfromDB = Object.values(JSON.parse(JSON.stringify(result)))
   
               if(resultfromDB!=null&&Array.isArray(resultfromDB)&&resultfromDB.length>0)
               {
                   resolve(resultfromDB[0].users_id)
   
               }
               else
               {
                   resolve("")
               }
               resolve("");
   
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
                resolve(error.message)
            }
            resolve(null)
            })
        }
        )
    
    }
    async getCaldavAccounts()
    {
      var con = getConnectionVar()
      return new Promise( (resolve, reject) => {
          con.query("SELECT caldav_accounts_id,username,url,name FROM caldav_accounts WHERE userid= ?", [ this.userid], function (err, result, fields) {
              if (err) throw err;
              con.end()
              resolve(Object.values(JSON.parse(JSON.stringify(result))));
  
          })
      })
    }

   async getCaldavAccountsAllData()
    {

      var con = getConnectionVar()
      return new Promise( (resolve, reject) => {
          con.query("SELECT * FROM caldav_accounts WHERE userid= ?", [ this.userid], function (err, result, fields) {
              if (err) throw err;
              con.end()
              resolve(Object.values(JSON.parse(JSON.stringify(result))));

          })
      })

   }

  

}