import validator from 'validator';
import { DAVTokens, fetchOauthTokens } from 'tsdav';
import { middleWareForAuthorisation} from '@/helpers/api/user';
import { UsersClass } from '@/helpers/api/v2/classes/UsersClass';
import { processCalendarFromCaldav } from '@/helpers/api/v2/caldavHelper';
import { CaldavAccountClass } from '@/helpers/api/v2/classes/CaldavAccountClass';
import { isCaldavURLinAllowedList } from '@/helpers/validators';
import { CalDAVAuthObject, getTSDAVCalDAVClient, OAUTH_TOKEN_URL } from '@/helpers/api/tsdav';
import { getBaseURL } from '@/helpers/general';
import { fetchOAuthTokenFromProvider } from '@/helpers/api/OAuth';
import moment from 'moment';
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})

    }
    if(await middleWareForAuthorisation(req,res)==false)
    {
        return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

    }
    const userid =  await  UsersClass.getUserIDFromLogin(req, res)
    if(userid==null){
        return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

    }
    const authMethod = req.body.auth_method ? req.body.auth_method :"Basic"
    if(!req.body.url || !req.body.username || !req.body.accountname || !req.body.password ){
        
        return res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })
        
    }
    //Sample token for OAUTH
    let token :DAVTokens | undefined = {}
    const provider = req.body.provider
    // console.log("req", req.body)
    if (authMethod.toUpperCase()=="OAUTH"){
        if(!req.body.provider || !req.body.client_id ||  !req.body.auth_code ){
            return res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })
        }
        //We should exchange the authcode for tokens.
        token = await fetchOAuthTokenFromProvider({
            auth_code: req.body.auth_code,
            client_id: req.body.client_id,
            client_secret: req.body.password,
            provider:req.body.provider,

        })
        // token = await fetchOauthTokens({
        // authorizationCode: req.body.auth_code,
        // clientId: req.body.client_id,
        // clientSecret: req.body.password,
        // tokenUrl: tokenURL,
        // redirectUrl: `${getBaseURL()}/accounts/caldav/oauth/register`,
        // });

        // console.log("token", token,`${getBaseURL()}accounts/caldav/oauth/register`)
        if(!token || !token.access_token){
            return res.status(401).json({ success: false, data: { message: 'ERROR_INVALID_OAUTH_AUTHORISATION_CODE'} })
        }
    }
    if ((req.body.url!=null && validator.isURL(req.body.url)) || req.body.url.startsWith("http://localhost") || req.body.url.startsWith("https://localhost") || isCaldavURLinAllowedList(req.body.url) ){
        

        const url = req.body.url
        const username = validator.escape(req.body.username)
        const password = req.body.password
        const accountname = validator.escape(req.body.accountname)
        const client_id = req.body.client_id
        const caldav_auth_object: CalDAVAuthObject = (authMethod.toUpperCase()=="OAUTH" && token && token.access_token) ? {
            client_id:client_id,
            access_token: token.access_token!,
            refresh_token:  token.refresh_token,
            auth_code: req.body.auth_code,
            provider: req.body.provider,
            expires_in: token.expires_in!.toString(),
            last_updated: moment(moment.now()).toISOString()

        }:{
            client_id:"",
            access_token: "",
            refresh_token:  "",
            auth_code: "",
            provider: "",
            expires_in: "",
            last_updated: moment(moment.now()).toISOString()


        }
        const client =  await getTSDAVCalDAVClient({
            url: url, username: username, password: password, authMethod: authMethod, caldav_auth_object:caldav_auth_object, logErrorPrefix: "api/v2/caldav/register"
        })
        // console.log("client", client)
        if(!client){
            return res.status(401).json({ success: false, data: {message: "INVALID_CALDAV_DETAILS"}})
        }
        
        const calendars = await client.fetchCalendars()
        // console.log("calendars", calendars)
        if(!calendars) return res.status(401).json({ success: false, data: {message: 'INVALID_CALDAV_DETAILS'}})
            
        //Caldav authentication was successful. We'll save the details in the db now.
        const caldav_account = new CaldavAccountClass(userid)
        let caldav_accounts_fromDB= await caldav_account.accountExists(username, url,userid)
        if(caldav_accounts_fromDB) return res.status(409).json({ version: 2, success: false, data: {message:"CALDAV_ALREADY_EXISTS"}})
       
       
            //Save Caldav Account.
        caldav_accounts_fromDB = await caldav_account.save(accountname, username, password, url, authMethod, caldav_auth_object)
        const output ={
            name: caldav_accounts_fromDB!.name,
            username:req.body.username,
            caldav_accounts_id: caldav_accounts_fromDB!.caldav_accounts_id,
            url: caldav_accounts_fromDB!.url,
            calendars: processCalDAVResponse(calendars),
            authMethod: authMethod,
            provider: provider

        }   
            
        return res.status(200).json({ version: 2, success: true, data: output})


       
   
        
        
        
    }
    else {
        return res.status(422).json({ success: false, data: {message: 'INVALID_INPUT'} })
    }
   
            
     
}


function processCalDAVResponse(calendarsFromCaldav: any){
    if(!calendarsFromCaldav && !Array.isArray(calendarsFromCaldav)){
        return null
    }
    var output: any = []
    calendarsFromCaldav.forEach(calendar => {

        const processedCal = processCalendarFromCaldav(calendar)
        if(processedCal!.displayName !="" && processedCal!.url!=""){
            output.push(processedCal)

        }
        
    }
    );

    return output
}