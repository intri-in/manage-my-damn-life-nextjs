import { webcal_accounts } from "models/webcal_accounts";
import { getSequelizeObj } from "./db";
import ical from '@/../ical/ical'
const webcal_accountsModel = webcal_accounts.initModel(getSequelizeObj())

export async function parseandAddICSToDB(userid, name, link, updateInterval){

    const parsedCal = await parseWebCalFromAddress(link)
    if(parsedCal && Array.isArray(parsedCal) && parsedCal.length>0){

        await insertWebcalIntoDB(userid, name, link, updateInterval)
        return null
    }else{
        return "INVALID_WEBCAL_LINK"
    }

}


export async function insertWebcalIntoDB(userid, name, link, updateInterval){
    await webcal_accountsModel.create({ name:name, link:link, updateInterval: updateInterval, userid:userid });
    return

}

export async function isURLPresentinDBFortheUser(url, userid){
    const fromDB =  await webcal_accountsModel.findAll({
        where: {
            userid: userid.toString(),
            link:url.trim()
        },
    })

    if(fromDB && Array.isArray(fromDB) && fromDB.length>0){
        return true
    }else{
        return false
    }

}

export async function parseWebCalFromAddress(link){

    return new Promise( (resolve, reject) => {

        const requestOptions =
        {
            method: 'GET',
        }
        fetch(link, requestOptions)
        .then(response => response.text())
        .then(data =>{

            const parsedICS = ical.parseICS(data)
            if(!parsedICS) return resolve(null)
            let toReturn: any[] = []
            for(const key in parsedICS){
                // console.log("data[key]", data[key])
                if(parsedICS[key].type=="VEVENT")
                {
                    toReturn.push(parsedICS[key])
                }
            }
            return resolve(toReturn)
        }).catch(e =>{

            return resolve([])

        })

    })



}
export async function getWebCalsFromDB(userid){
    
    return await webcal_accountsModel.findAll({
        where: {
            userid: userid.toString(),
        },
    })


}

export async function deleteWebCalsFromDB(id, userid){


    return await webcal_accountsModel.destroy({
        where:{
            userid: userid.toString(),
            id: id
        }

    })
}