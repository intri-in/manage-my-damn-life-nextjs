import { getConnectionVar, getSequelizeObj } from '@/helpers/api/db';
import { settings } from 'models/settings';
import { users } from 'models/users';

const Users= users.initModel(getSequelizeObj())
const Settings = settings.initModel(getSequelizeObj())

export async function getRegistrationStatus()
{
    const resultfromDB = await Settings.findAll({
        where:{
            name:"GLOBAL_DISABLE_USER_REGISTRATION",
        },
        raw: true,
        nest: true,
    })

    if(resultfromDB && Array.isArray(resultfromDB) && resultfromDB.length>0 &&  resultfromDB[0].name!=null && resultfromDB[0].name!=undefined && resultfromDB[0].global!=null && resultfromDB[0].name!="" && resultfromDB[0].global!="false"   && resultfromDB[0].global!="0" ){
        return resultfromDB[0]["value"]
    }
    return 1

    // var con = getConnectionVar()

    // return new Promise( (resolve, reject) => {
    //     con.query("SELECT * FROM settings WHERE name=?", ["GLOBAL_DISABLE_USER_REGISTRATION"], function (err, result, fields) {
    //         con.end()
    //         if (err) {
    //             console.log(err)
    //             return resolve(null)
    //         }
    //         var result = Object.values(JSON.parse(JSON.stringify(result)))
    //         if(result!=null && Array.isArray(result) && result.length>0 && result[0].name!=null && result[0].name!=undefined && result[0].global!=null && result[0].name!="" && result[0].global!="false"   && result[0].global!="0"  )
    //         {
    //             return resolve(result[0].value)
    //         }else{
    //             return resolve(0)
    //         }

    //     })
    // })

}

export async function userRegistrationAllowed()
{

    let fromDB = await getRegistrationStatus()
    let disabledFromDB = false
    if(fromDB){
        if(fromDB.toString()=="0" || fromDB.toString().toLowerCase()=="false"){
            disabledFromDB=true
        }
    }
    
    let fromEnv = process.env.NEXT_PUBLIC_DISABLE_USER_REGISTRATION ? process.env.NEXT_PUBLIC_DISABLE_USER_REGISTRATION : "false"


    if(!disabledFromDB && fromEnv == "false")
    {
        //Registration not disabled anywhere.
        return true
    }else{
        return false
    }
}