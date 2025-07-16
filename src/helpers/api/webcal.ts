import { webcal_accounts } from "models/webcal_accounts";
import { webcal_events } from "models/webcal_events";
import { getSequelizeObj } from "./db";
import ical from '@/../ical/ical'
import moment from "moment";
import { getRandomColourCode } from "../general";
const webcal_accountsModel = webcal_accounts.initModel(getSequelizeObj())
const webcal_eventsModel = webcal_events.initModel(getSequelizeObj())

export async function parseandAddICSToDB(userid, name, link, updateInterval, colour){

    const parsedCal = await parseWebCalFromAddress(link)
    if(parsedCal && Array.isArray(parsedCal) && parsedCal.length>0){

        const webcalId = await insertWebcalIntoDB(userid, name, link, updateInterval, colour)
        await saveWebCalEventsIntoDB(webcalId.id, parsedCal)
        return {status: true,
            id:webcalId.id,
            message: null,
        parsedCal: parsedCal
        }
    }else{
        return {
            status: false,
            id:null,
            message: "INVALID_WEBCAL_LINK",
            parsedCal: null
        } 
    }

}


export async function insertWebcalIntoDB(userid, name, link, updateInterval,colour){
    const id  = await webcal_accountsModel.create({ name:name, link:link, updateInterval: updateInterval, userid:userid, colour: colour, lastFetched: moment().toISOString() });
    return id

}

export async function saveWebCalEventsIntoDB(webcalId, parsedCal){
    // console.log("parsedCal", webcalId)
    if(parsedCal && Array.isArray(parsedCal) && parsedCal.length>0){
        for (const i in parsedCal){
            await webcal_eventsModel.create({ webcal_accounts_id:webcalId, data: JSON.stringify(parsedCal[i])});
        }

    }
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
    
    const webCals  = await webcal_accountsModel.findAll({
        where: {
            userid: userid.toString(),
        },
    })

    for (const i in webCals){
        const data = await getEventsFromWebCalFromDatabase(webCals[i]["id"])
        webCals[i]["data"] = data


    }

    return webCals


}

export async function deleteWebCalFromDB(id, userid){

    //First we delete all events saved from webcal.
    await deleteWebCalDataFromDB(id)
    return await webcal_accountsModel.destroy({
        where:{
            userid: userid.toString(),
            id: id
        }

    })
}

export async function getEventsFromWebCalFromDatabase(webcalId){
    return await webcal_eventsModel.findAll({
        where:{
            webcal_accounts_id: webcalId.toString()
        }
    })
}
export async function deleteWebCalDataFromDB(webcalid){
    return await webcal_eventsModel.destroy({
        where:{
            webcal_accounts_id: webcalid
        }

    })
}

export async function userHasAccessToWebcal(userid, webcalid){
    const webcals= await webcal_accountsModel.findAll({
        where: {
            userid: userid.toString(),
            id: webcalid
        },
    })

    return (webcals && Array.isArray(webcals) && webcals.length>0)

}
async function getWebcalFromID(id){
    return await webcal_accountsModel.findAll({
        where: {
            id: id
        },
    })
}

async function updateWebCalsLastSyncedValue(webcalId, value?){

    const valueToInsert = value ?? moment().toISOString()
    await webcal_accountsModel.update(
        {lastFetched: valueToInsert},
        {
            where:{
                id: webcalId
            }
        }
    )



}
export async function syncWebcal(webcalId){
    const webcal = await getWebcalFromID(webcalId)
    if(webcal && Array.isArray(webcal) && webcal.length>0){
        const parsedCal = await parseWebCalFromAddress(webcal[0].link)
        if(parsedCal && Array.isArray(parsedCal) && parsedCal.length>0){
            await deleteWebCalDataFromDB(webcalId)
            await saveWebCalEventsIntoDB(webcalId, parsedCal)
            const lastFetched = moment().toISOString()
            await updateWebCalsLastSyncedValue(webcalId, lastFetched)
            return {
                status: true,
                parsedCal: parsedCal,
                lastFetched: lastFetched
            }
        }
    }

    return {
        status: false,
        parsedCal: null,
        lastFetched: null

    }
}

export async function updateColourofWebcal(webcalId, colour){
    await webcal_accountsModel.update(
        {colour: colour},
        {
            where:{
                id: webcalId
            }
        }
    )

}