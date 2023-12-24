import { getUserHashSSIDfromAuthorisation, getUserIDFromNextAuthID, getUserIDFromNextAuthID_FromSession } from "@/helpers/api/user"
import crypto from "crypto"
import { varNotEmpty } from "@/helpers/general";
import { getSequelizeObj } from "../../db";
import { Sequelize } from "sequelize";
import { users } from "@/../models/users";
import { getUserIDFromNextAuthSession, nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export class UsersClass{

    userid: String
    sequelize: Sequelize

    constructor(userid)
    {
        if(varNotEmpty(userid)==false ||varNotEmpty(userid) && userid=="" )
        {
            throw new Error("User id cannot be empty.")
        }
        this.userid= userid
        this.sequelize= getSequelizeObj()

    }

    /**
     * 
     * @param authorisationHeaders Authorisation headers that have been passed with the API Call.
     * @returns Userid of the user. Null if nothing found.
     */
    static async idFromAuthorisation(authorisationHeaders)
    {
      var userHash= await getUserHashSSIDfromAuthorisation(authorisationHeaders)
      const userid = UsersClass.getUseridFromUserhash(userHash)
      return userid

    }
    static async  getUserIDFromLogin(req,res){
        if(!varNotEmpty(req) || !varNotEmpty(res)){
            return null
        }
    
        if(await nextAuthEnabled()){
            return await getUserIDFromNextAuthID_FromSession(req,res)
        }else{
            var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)
            if(userHash && Array.isArray(userHash)){

                const userid = await UsersClass.getUseridFromUserhash(userHash[0])
                return userid
            }
            return null
        }
    
    }
    
    static async getUseridFromUserhash(userHash){
        const Users=  users.initModel(getSequelizeObj())
        const res = await Users.findOne({
            where:{
                userhash:userHash
            }, 
            raw: true,
            nest: true,
        })
    
        if(res && res.users_id){
            return res.users_id
        }
        return null
    }

}
