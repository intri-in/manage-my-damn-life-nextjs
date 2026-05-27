import { caldav_accounts } from "models/caldav_accounts";
import { GetTSDAVCalDAVClientInput } from "./tsdav";
import { getSequelizeObj } from "./db";
import moment from "moment";
const model= caldav_accounts.initModel(getSequelizeObj())
export async function updateCalDAVAccountAccessTokeninDB(input: caldav_accounts, newData: {access_token: string, expires_in:string}){

    await model.update({
        last_updated: moment(moment.now()).toISOString(),
        access_token: newData.access_token,
        expires_in: newData.expires_in
    },{
        where:{
            caldav_accounts_id: input.caldav_accounts_id
        }
    })



}