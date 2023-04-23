import validator from 'validator';
import { checkifUserisInDB } from '@/helpers/api/user';
import { insertUserIntoDB } from '@/helpers/api/user';
import { User } from '@/helpers/api/classes/User';
import { deleteAllOTPs_passwordReset, generateOTP_passwordReset, otpIsValid, sendResetPasswordMessage } from '@/helpers/api/otp';
export default async function handler(req, res) {
    if (req.method === 'POST') {
      console.log(req.body)
        if(req.body.otp!=null&&req.body.otp!=undefined && req.body.otp!="" && req.body.password!=null&&req.body.password!=undefined && req.body.password!="" &&  req.body.reqid!=null&&req.body.reqid!=undefined && req.body.reqid!="" && req.body.userhash!=null&&req.body.userhash!=undefined && req.body.userhash!="")
        {
          var userID = await User.getIDFromUserhash(req.body.userhash)
          //Check userid and OTP combo.
          var otpValid = await otpIsValid(userID, req.body.reqid, req.body.otp)

          if(otpValid)
          {
            // Reset password.
            var userObject= new User(userID)
            var passwordUpdateReponse = await userObject.updatePassword(req.body.password)
            if(passwordUpdateReponse==null)
            {
                deleteAllOTPs_passwordReset(userID)
                res.status(200).json( {success: true, data: {message: "PASSWORD_RESET_OK"}})

            }else{
                res.status(500).json( {success: false, data: {message: "ERROR_PASSWORD_RESET_FAILED", details: passwordUpdateReponse }})

            }

          }else{
            res.status(401).json( {success: false, data: {message: "ERROR_INVALID_OTP"}})

          }

        } else
        {
            res.status(422).json( {success: false, data: {message: "INVALID_INPUT"}})
        }
    }else
    {
        res.status(422).json({ success: false ,data: {message: "INVALID_METHOD"}})

    }
}