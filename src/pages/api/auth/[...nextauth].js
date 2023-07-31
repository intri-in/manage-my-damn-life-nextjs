import authProviders from "config/nextAuthProviders"
import NextAuth from "next-auth"
import SequelizeAdapter from "@auth/sequelize-adapter";
import { Sequelize } from "sequelize";
import { getSequelizeObj } from "@/helpers/api/db";

const sequelize = getSequelizeObj()

export const authOptions = {
  // Configure one or more authentication providers
  providers:authProviders,
  adapter: SequelizeAdapter(sequelize,{
    synchronize: false
  }),
  callbacks: {
    session: async (session, user) => {
       return Promise.resolve(session)
 }
 }
}

export default NextAuth(authOptions)