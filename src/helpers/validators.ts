export function isCaldavURLinAllowedList(serverUrl){
    if(!process.env.ADDITIONAL_VALID_CALDAV_URL_LIST){
        return false
    }
    try{
        
        const listofValidURLs = JSON.parse(process.env.ADDITIONAL_VALID_CALDAV_URL_LIST.toString())

        if(Array.isArray(listofValidURLs) && listofValidURLs.length>0)
        {
            return listofValidURLs.includes(serverUrl)
        }
        return false
    }catch(e){
        console.error("Error! isCaldavURLinAllowedList: Invalid value of ADDITIONAL_VALID_CALDAV_URL_LIST environment variable.")
    }

    return false
}