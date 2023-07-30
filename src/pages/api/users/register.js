import validator from 'validator';
import { checkifUserisInDB } from '@/helpers/api/user';
import { insertUserIntoDB } from '@/helpers/api/user';
export default async function handler(req, res) {
    if (req.method === 'POST') {
        
        var isValidEmail = false
        if(req.body.email!=null && req.body.email!="" && req.body.email!=undefined){
            isValidEmail = validator.isEmail(req.body.email)

        }
            
        if(req.body.username!=null&&req.body.password!=null&&req.body.email!=null && isValidEmail)
        {
            
                var username = validator.escape(req.body.username)
                
                
                if(await checkifUserisInDB(username)==true)
                {
                    //User is in db. Ask to login with a password.
                    res.status(200).json({ success: false ,data: {message: "ERROR_LOGIN_WITH_PASSWORD"}  })
    
                }
                else
                {
                    //User is not in db. Register user.
                    var  response = await insertUserIntoDB(req.body.username, req.body.password, req.body.email)

                    console.log("response" ,response)
                    if(response){
                        res.status(200).json({ success: response ,data: {message: "USER_INSERT_OK"} })

                    }else{
                        res.status(401).json({ success: response ,data: {message: "CANT_CREATE_USER"} })

                    }
    
                }
    
            }
            else
            {
                res.status(422).json({ success: 'false' ,data: {message: "INVALID_INPUT"}})
            }

        }
        else
        {
            res.status(422).json({ success: 'false' ,data: {message: "INVALID_METHOD"}})

        }
}
