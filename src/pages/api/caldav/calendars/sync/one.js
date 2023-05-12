import { getCaldavAccountDetailsfromId } from "@/helpers/api/cal/caldav"
import { getCaldavAccountsAllData, getCaldavAccountsfromUserid, getCalendarsfromCaldavAccountsID } from "@/helpers/api/cal/calendars"
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
            if(req.query.calendar_id!=null)
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

                         
                            for(let j=0; j<allCalendars.length; j++)
                            {
                                //Fetch all events for this calendar now.
                              
                                if(allCalendars[j].calendars_id==req.query.calendar_id)
                                {
                                    var objects= await getCalendarObjectsFromCalendarbyType(allCalendars[j].calendars_id)
                                    var oldCalendarObject =allCalendars[j] 

                                    oldCalendarObject["objects"] = objects
                                    var response = await syncCalendar(allCaldavAccountBasicData[i].url, allCaldavAccountBasicData[i].username, allCaldavAccountBasicData[i].password, [ oldCalendarObject])
                                    console.log(response[0])
        
                                }
                                

                            }
                            
                        }


                    }
                }

                res.status(200).json({ success: true, data: { message: "response"} })
            }else{
                res.status(422).json({ success: false, data: {message: 'INVALID_INPUT', details: {caldav_account_id: req.query.caldav_account_id}}})
            }
            


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
                detailedResult: false,
                
              }).then((result) =>{
                return resolve(result)
              }).catch(error => resolve(error))

        }, (rejected) => {
            console.log(rejected)
        })

    })
}