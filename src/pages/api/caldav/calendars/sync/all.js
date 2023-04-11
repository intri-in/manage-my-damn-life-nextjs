import { getCaldavAccountDetailsfromId } from "@/helpers/api/cal/caldav"
import { checkifCalendarExistforUser, deleteCalendarFromDB, getCaldavAccountsAllData, getCaldavAccountsfromUserid, getCalendarsfromCaldavAccountsID, insertCalendarintoDB, updateCalendarinDB } from "@/helpers/api/cal/calendars"
import { getCalendarObjectsFromCalendarbyType } from "@/helpers/api/cal/object"
import { getUserHashSSIDfromAuthorisation, getUseridFromUserhash, middleWareForAuthorisation } from "@/helpers/api/user"
import { isValidResultArray } from "@/helpers/general"
import { AES } from "crypto-js"
import { createDAVClient } from "tsdav"
import CryptoJS from "crypto-js"
export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)

            var userid = await getUseridFromUserhash(userHash[0])
            var allCaldavAccountBasicData = await getCaldavAccountsAllData(userid)
            if(isValidResultArray(allCaldavAccountBasicData))
            {
                for(let i=0; i<allCaldavAccountBasicData.length;i++)
                {

                    var allCalendars= await getCalendarsfromCaldavAccountsID(allCaldavAccountBasicData[i].caldav_accounts_id)
                    if(isValidResultArray(allCalendars))
                    {
                        var inputCalendarList=[]

                        for(let j=0; j<allCalendars.length; j++)
                        {
                            var objects= await getCalendarObjectsFromCalendarbyType(allCalendars[j].calendars_id)
                            var oldCalendarObject =allCalendars[j] 

                            oldCalendarObject["objects"] = objects
                            inputCalendarList.push(oldCalendarObject)
                    
                        }
                    
                        var response = await syncCalendar(allCaldavAccountBasicData[i].url, allCaldavAccountBasicData[i].username, allCaldavAccountBasicData[i].password, allCalendars)
                        var processResponse=await processSyncCalendarResponse(allCaldavAccountBasicData[i].caldav_accounts_id, response)

                      
                        /*
                        for(let j=0; j<allCalendars.length; j++)
                        {
                            //Fetch all events for this calendar now.
                            //var objects= await getCalendarObjectsFromCalendarbyType(allCalendars[j].calendars_id)
                           
                            if(objects!=null && objects!= [] && allCalendars[j].calendars_id=='91')
                            {
                                var oldCalendarObject =allCalendars[j] 

                                oldCalendarObject["objects"] = objects
                                var response = await syncCalendar(allCaldavAccountBasicData[i].url, allCaldavAccountBasicData[i].username, allCaldavAccountBasicData[i].password, [ oldCalendarObject])
                                console.log(response)
    
                            }
                            

                        }
                        )*/
                    }


                }
            }

            res.status(200).json({ success: true, data: { message: "OK"} })


        }
        else
        {
            res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }
    }
    else {
        res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }
}

async function syncCalendar(caldav_url, caldav_username, caldav_password, oldCalendarObject )
{
    return new Promise( (resolve, reject) => {
         createDAVClient({
            serverUrl: caldav_url,
            credentials: {
                username: caldav_username,
                password: AES.decrypt(caldav_password,process.env.AES_PASSWORD).toString(CryptoJS.enc.Utf8)
            },
            authMethod: 'Basic',
            defaultAccountType: 'caldav',
        }).then((client) => {
            client. syncCalendars({
                oldCalendars:oldCalendarObject,
                detailedResult: true,
                
              }).then((result) =>{
                resolve(result)
              }).catch(error => resolve(error))

        }, (rejected) => {
            console.log(rejected)
        })

    })
}

async function processSyncCalendarResponse(caldav_accounts_id, response)
{
    if(response!=null)
    {

        //First we take care of calendars required to be created.
        if(isValidResultArray(response.created))
        {
            for (const i in response.created)
            {
                console.log(response.created[i].calendars_id)
                var calendarExists=await checkifCalendarExistforUser(response.created[i],caldav_accounts_id)
                if(calendarExists==false)
                {
                    await insertCalendarintoDB(response.created[i], caldav_accounts_id)

                }
            }
        }

        // Now we deal with the calendars requiring updated.
        if(isValidResultArray(response.updated))
        {
            for (const i in response.updated)
            {
                var calendarExists=await checkifCalendarExistforUser(response.updated[i],caldav_accounts_id)
                console.log(calendarExists, caldav_accounts_id, response.updated[i].calendar_id)
                if(calendarExists==true)
                {
                    var updateResult= await updateCalendarinDB(response.updated[i], caldav_accounts_id)
                    console.log(updateResult, response.updated[i].url)
                }
            }
        }
        
        // Finally delete calendars.

        if(isValidResultArray(response.deleted))
        {
            for (const i in response.deleted)
            {
                var calendarExists=await checkifCalendarExistforUser(response.updated[i],caldav_accounts_id)
                if(calendarExists==true)
                {
                    await deleteCalendarFromDB(response.deleted[i],caldav_accounts_id)
                }

            }
        }

    }

    return true
  

}