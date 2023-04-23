import { checkifUserisInDB, startLoginRequest } from '@/helpers/api/user';
import validator from 'validator';
//import { checkifUserisInDB, startLoginRequest } from '@/helpers/user';
export default async function handler(req, res) {
    console.log("req.body.username", req.body.username, "req.body.password", req.body.password)
    if (req.method === 'POST') {
        if(req.body.username!=null)
        {
            if(req.body.password==null)
            {
                var username = validator.escape(req.body.username)
                if(checkifUserisInDB(username)==true)
                {
                    //User is in db. Ask to login with a password.
                    res.status(422).json({ success: false ,data: {message: "LOGIN_WITH_PASSWORD"}})
    
                }
                else
                {
                    //User is not in db. Ask to register with password.
                    res.status(422).json({ success: false ,data: {message: "REGISTER_FOR_A_PASSWORD" }})
    
                }
    
            }
            else
            {
                //Try to login.
                const ssidOutput = await startLoginRequest(req.body.username, req.body.password)
                if(ssidOutput==false)
                {
                    res.status(401).json({ success: 'false' ,data: {message: "INVALID_PASSWORD"}})

                }else{
                    res.status(200).json({ success: 'true' ,data: {message: ssidOutput}})

                }

            }

        }
        else
        {
            res.status(422).json({ success: 'false' ,data: {message: "INVALID_INPUT"} })

        }
        

        

    }
    else 
    {
        res.status(403).json({ success: 'false' ,data: {message: "INVALID_METHOD." }})
    }
}
