import validator from 'validator';
import { checkifUserisInDB } from '@/helpers/api/user';
import { insertUserIntoDB } from '@/helpers/api/user';
import { User } from '@/helpers/api/classes/User';
import { generateOTP_passwordReset, sendResetPasswordMessage } from '@/helpers/api/otp';
export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(req.query.username!=null&&req.query.username!=undefined && req.query.username!="")
        {
            //Check if user has a valid email.
            const userData = await User.getDatafromUsername(req.query.username)
            if(userData!=null && Array.isArray(userData) && userData.length>0)
            {
                if(userData[0].email!="" && userData[0].email!=null && userData[0].email!=undefined && validator.isEmail(userData[0].email))
                {
                    // User has a valid email. Generate and send OTP to the email.
                    const response = await generateOTP_passwordReset(userData[0].users_id)

                    if(response!=null && response.otp!=null)
                    {
                        // console.log("Response", response)
                        const finalReponse = await sendResetPasswordMessage(userData[0].email, response.otp)
                        if(finalReponse && finalReponse!=false && ("messageId" in finalReponse) && finalReponse.messageId)
                        {
                            return res.status(200).json({ success: true ,data: {message: {userhash: userData[0].userhash, reqid: response.result.reqid}}})

                        }else{
                            return res.status(500).json({ success: false ,data: {message: "ERROR_EMAIL_SENDING_FAILED"}})

                        }

                    }else{
                        return res.status(500).json({ success: false ,data: {message: "ERROR_GENERIC"}})

                    }


                }else{
                    return res.status(200).json({ success: false ,data: {message: "ERROR_NO_EMAIL_SET"}})

                }
            }else{
                return res.status(403).json({ success: false ,data: {message: "ERROR_INVALID_USERNAME"}})

            }
        }
        else
        {
            return res.status(422).json({ success: false, data: {message: "INVALID_INPUT"}})
        }
    } else
    {
        return res.status(422).json({ success: false ,data: {message: "INVALID_METHOD"}})

    }
}