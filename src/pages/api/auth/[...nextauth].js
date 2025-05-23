import authProviders from "config/nextAuthProviders"
import NextAuth from "next-auth"
import SequelizeAdapter from "@auth/sequelize-adapter";
import { Sequelize } from "sequelize";
import { getSequelizeObj } from "@/helpers/api/db";
import { users } from "models/users";
import Account from "models/account";
import session from "models/session";

const sequelize = getSequelizeObj(false)

export const authOptions = {
  // Configure one or more authentication providers
  providers:authProviders,
  adapter: SequelizeAdapter(sequelize,{
    synchronize: false, 
    
  }),
  callbacks: {
    session: async (session, user) => {
      // console.log("user, session", user, session)
       return Promise.resolve(session)
    },
    async redirect({ url, baseUrl }) {
      return "/setup"
    },
  
 },

}

export default NextAuth(authOptions)