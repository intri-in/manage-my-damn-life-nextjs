import { getConnectionVar } from '@/helpers/api/db';

export async function getRegistrationStatus()
{
    var con = getConnectionVar()

    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM settings WHERE name=?", ["GLOBAL_DISABLE_USER_REGISTRATION"], function (err, result, fields) {
            if (err) {
                console.log(err)
                resolve(null)
            }
            con.end()
            var result = Object.values(JSON.parse(JSON.stringify(result)))
            if(result!=null && Array.isArray(result) && result.length>0 && result[0].name!=null && result[0].name!=undefined && result[0].global!=null && result[0].name!="" && result[0].global!="false"   && result[0].global!="0"  )
            {
                resolve(result[0].value)
            }else{
                resolve(0)
            }

        })
    })

}

export async function userRegistrationAllowed()
{

    var fromDB = await getRegistrationStatus()
    if(fromDB!=null && fromDB!="1" && fromDB!="true" )
    {
        // Not disabled in database
        fromDB=false
    }else
    {
        fromDB = true
    }
    var fromEnv = process.env.NEXT_PUBLIC_DISABLE_USER_REGISTRATION


    if(fromDB == false && fromEnv == "false")
    {
        //Registration not disabled anywhere.
        return true
    }else{
        return false
    }
}