import { CALDAV_OAUTH_PROVIDERS } from "@/config/constants"

export const CalDAVOAuthProvidersList  = ({t}:{t: any}) =>{
    let toReturn = [<></>]

    if(Array.isArray(CALDAV_OAUTH_PROVIDERS)){
        for(const i in CALDAV_OAUTH_PROVIDERS){
            toReturn.push(<option key={CALDAV_OAUTH_PROVIDERS[i]} value={CALDAV_OAUTH_PROVIDERS[i]}>{t(CALDAV_OAUTH_PROVIDERS[i])}</option>)
        }
    }
    return(<>{toReturn}</>)

}