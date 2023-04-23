import { getCalendarsfromCaldavAccountsID, getCaldavAccountsfromUserid } from "@/helpers/api/cal/calendars"
import { getCaldavAccountfromUserID } from '@/helpers/api/cal/calendars';
import { middleWareForAuthorisation, getUseridFromUserhash , getUserHashSSIDfromAuthorisation} from '@/helpers/api/user';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(req.headers.authorization!=null && await middleWareForAuthorisation(req.headers.authorization))
        {
            var userHash= await getUserHashSSIDfromAuthorisation(req.headers.authorization)

            var userid = await getUseridFromUserhash(userHash[0])
            var final_caldav_account_array=[]
            var caldav_accounts= await getCaldavAccountsfromUserid(userid)
            if(caldav_accounts!=null&&Array.isArray(caldav_accounts)&&caldav_accounts.length>0)
            {
                for(let i=0; i<caldav_accounts.length; i++ )
                {
                    var calendars_from_account= await getCalendarsfromCaldavAccountsID(caldav_accounts[i].caldav_accounts_id)
                    var currentCaldavID=caldav_accounts[i].caldav_accounts_id
                    var calendarArray=[]
                    if(calendars_from_account!=null&&Array.isArray(calendars_from_account)&&calendars_from_account.length>0){
                        for(let j=0; j<calendars_from_account.length;j++)
                        {
                            calendarArray.push(calendars_from_account[j])
                        }
                    }
                    var finalObject={account: caldav_accounts[i], calendars: calendars_from_account}
                    final_caldav_account_array.push(finalObject)

                }
                    var array_toAdd={i: finalObject}

                }
                
                
                res.status(200).json({ success: true, data: { message: final_caldav_account_array} })

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