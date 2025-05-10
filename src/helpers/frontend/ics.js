import { toast } from "react-toastify";
import { getRandomString } from "../crypto";
import { getAPIURL, isNumber, logVar, varNotEmpty } from "../general";
import { rruleToObject } from "./events";
import { getMessageFromAPIResponse } from "./response";
import { getAuthenticationHeadersforUser } from "./user";
import { getI18nObject } from "./general";

export async function makeGenerateICSRequest(eventObj)
{
    const url_api=getAPIURL()+"misc/generateics"

    const authorisationData=await getAuthenticationHeadersforUser()
    const requestOptions =
    {
        method: 'POST',
        body: JSON.stringify({"obj":eventObj}),
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData, 'Content-Type':'application/json'}),
    }
    return new Promise( (resolve, reject) => {


            fetch(url_api, requestOptions)
            .then(response => response.json())
            .then((body) =>{
                if(varNotEmpty(body) && varNotEmpty(body.success) && body.success==true )
                {
                    let message = getMessageFromAPIResponse(body)
                    return resolve(message)
                }else{
                    let message = getMessageFromAPIResponse(body)
                    if(varNotEmpty(message) && message!="")
                    {
                        toast.error(message)
                    }else{
                        toast.error(getI18nObject.t("GENERIC_ERROR"))
                    }
    
                    return resolve(null)
                }
                
            }).catch(e =>{
                console.error("makeGenerateICSRequest", e)

                return resolve(null)
            })
         
    })

  
}

/**
 * @deprecated
 * @param {*} eventData 
 * @returns 
 */
export  function getObjectForAPICall(eventData)
{
    let obj={}
    obj['start'] =  eventData.start
    obj['end'] =  eventData.end
    
    if(varNotEmpty(eventData["transp"]))
    {
       // obj["transp"]=eventData["transp"]

    }else{
        //obj["transp"]="TRANSPARENT"

    }
    obj['summary'] =  eventData.summary

    if(varNotEmpty(eventData.alarms) && Array.isArray(eventData.alarms))
    {
        obj['alarms']=[]

        for (const i in eventData.alarms)
        {
            obj['alarms'].push(eventData.alarms[i].VALUE*(-1/60))
        }
    }
    if(varNotEmpty(eventData.uid))
    {
        obj['uid']=eventData["uid"]
    }else{
        obj['uid']=getRandomString(32)
    }

    if(varNotEmpty(eventData.sequence))
    {
         
        //obj['sequence']=eventData["sequence"].to+1
    }
    if(varNotEmpty(eventData["rrule"]) && eventData["rrule"]!="")
    {
        let rrule= rruleToObject(eventData["rrule"])
        obj['repeating']= {
            freq: rrule["FREQ"],
            interval: rrule["INTERVAL"],
            until: rrule["UNTIL"]
          }

    }

    if(varNotEmpty(eventData["created"]))
    {
        obj['stamp']=eventData["created"]
    }else{
        obj['stamp']=new Date(Date.now())

    }
    if(varNotEmpty(eventData["location"]))
    {
        obj['location']=eventData["location"]

    }

    obj['method']=""
    if(varNotEmpty(eventData["description"]))
    {
        obj['description']=eventData["description"]

    }

    if(varNotEmpty(eventData["status"]) && eventData["status"].trim()!="")
    {
        obj['status']=eventData["status"]

    }
    if(varNotEmpty(eventData["url"]))
    {
        obj['url']=eventData["url"]

    }

    let unsupportedProperties={}
    //Now we add the remining non supported properties.
    for (const key in eventData)
    {
        
        if(key!="start" &&  key!="transp" && key!="summary" && key!="alarms" && key!="end" && key!="uid" && key!="sequence" && key!="rrule" && key!="created" && key!="description" && key!="status" && key!="url" && key!="location" && varNotEmpty(eventData[key]) && eventData[key]!="" && key!="type" && key!="dtstamp" && isNumber(key)==false)
        {

            let data=eventData[key]
            if(typeof(eventData[key])!='string')
            {
                if(Array.isArray(eventData[key]))
                {
                    data=""
                    for(const k in eventData[key])
                    {
                        data+= eventData[key][k]
                    }
                }else{
                    try{
                        data=JSON.stringify(eventData[key])
                    }
                    catch(e)
                    {
                        console.log("getObjectForAPICall", e)
                    }
                }

                
            }
            unsupportedProperties[key] = data
        }
    }

    obj["additionalTags"]=unsupportedProperties
    return obj
    
}

export  function getObjectForAPICallV2(eventData)
{
    let obj={}
    obj['start'] =  eventData.start
    obj['end'] =  eventData.end
    
    if(varNotEmpty(eventData["transp"]))
    {
       // obj["transp"]=eventData["transp"]

    }else{
        //obj["transp"]="TRANSPARENT"

    }
    obj['summary'] =  eventData.summary

    if(varNotEmpty(eventData.alarms) && Array.isArray(eventData.alarms))
    {
        obj['alarms']=[]

        for (const i in eventData.alarms)
        {
            obj['alarms'].push(eventData.alarms[i].VALUE*(-1/60))
        }
    }
    if(varNotEmpty(eventData.uid))
    {
        obj['uid']=eventData["uid"]
    }else{
        obj['uid']=getRandomString(32)
    }

    if(varNotEmpty(eventData.sequence))
    {
         
        obj['sequence']=eventData["sequence"].to+1
    }
    if(varNotEmpty(eventData["rrule"]) && eventData["rrule"]!="" && eventData["rrule"]["FREQ"] && eventData["rrule"]["INTERVAL"])
    {
        // let rrule= rruleToObject(eventData["rrule"])
        obj['repeating']= {
            freq: eventData["rrule"]["FREQ"],
            interval: eventData["rrule"]["INTERVAL"],
            until: eventData["rrule"]["UNTIL"]
          }

    }

    if(varNotEmpty(eventData["created"]))
    {
        obj['stamp']=eventData["created"]
    }else{
        obj['stamp']=new Date(Date.now())

    }
    if(varNotEmpty(eventData["location"]))
    {
        obj['location']=eventData["location"]

    }

    obj['method']=""
    if(varNotEmpty(eventData["description"]))
    {
        obj['description']=eventData["description"]

    }

    if(varNotEmpty(eventData["status"]) && eventData["status"].trim()!="")
    {
        obj['status']=eventData["status"]

    }
    if(varNotEmpty(eventData["url"]))
    {
        obj['url']=eventData["url"]

    }

    let unsupportedProperties={}
    //Now we add the remining non supported properties.
    for (const key in eventData)
    {
        
        if(key!="start" &&  key!="transp" && key!="summary" && key!="alarms" && key!="end" && key!="uid" && key!="sequence" && key!="rrule" && key!="created" && key!="description" && key!="status" && key!="url" && key!="location" && varNotEmpty(eventData[key]) && eventData[key]!="" && key!="type" && key!="dtstamp" && isNumber(key)==false)
        {

            let data=eventData[key]
            if(typeof(eventData[key])!='string')
            {
                if(Array.isArray(eventData[key]))
                {
                    data=""
                    for(const k in eventData[key])
                    {
                        data+= eventData[key][k]
                    }
                }else{
                    try{
                        data=JSON.stringify(eventData[key])
                    }
                    catch(e)
                    {
                        console.log("getObjectForAPICall", e)
                    }
                }

                
            }
            unsupportedProperties[key] = data
        }
    }

    obj["additionalTags"]=unsupportedProperties
    return obj
    
}

export async function makeParseICSRequest(data,type)
    {
        const url_api = getAPIURL() + "misc/parseics_ical"

        const authorisationData = await getAuthenticationHeadersforUser()
        const requestOptions =
        {
            method: 'POST',
            body: JSON.stringify({ "ics": data, "type":type}),
            mode: 'cors',
            headers: new Headers({ 'authorization': authorisationData, 'Content-Type': 'application/json' }),
        }
        return new Promise( (resolve, reject) => {
            
            
                fetch(url_api, requestOptions)
                    .then(response => response.json())
                    .then((body) => {
                        return resolve(body)
                    }).catch(e =>{
                        console.error("makeParseICSRequest", e)
                        return resolve({
                            success:false,
                            data:{message:e.message, details:e}
                        })
                    })
    
        })
    }