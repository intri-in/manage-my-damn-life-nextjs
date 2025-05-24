import { Sequelize } from "sequelize"
import { getSequelizeObj } from "../../db"
import { caldav_accounts } from "models/caldav_accounts"
import { sequelize } from "models"
import { AES } from 'crypto-js';

export class CaldavAccountClass{
    userid: string
    model: typeof caldav_accounts

    constructor(userid){
        this.userid = userid
        this.model= caldav_accounts.initModel(getSequelizeObj())
    }

    /**
     * Check if a particular CalDAV account exists for a user.
     * @param username username of Caldav Account
     * @param url Url of caldav account
     * @returns caldav_accounts_id if the account exists. Null otherwise
     */
    async accountExists(username, url, userid){

        const res = await this.model.findOne({
            where:{
                username:username,
                url: url,
                userid:userid.toString()
            }, 
            raw: true,
            nest: true,
        })
        if(res && res.caldav_accounts_id){
            return res
        }
        return null


    }

    async save(accountname, username, password, url, authMethod){
        const encryptedPass = AES.encrypt(password, process.env.AES_PASSWORD).toString()
        await this.model.create({name: accountname, username: username, userid: this.userid, password: encryptedPass, authMethod: authMethod,url:url })

        const newID= await this.accountExists(username, url,this.userid)
        return newID
    }


}