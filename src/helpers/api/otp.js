import { getRandomString } from "../crypto"
import { getConnectionVar } from "./db"
import { sendEmail } from "./email"
import bcrypt from 'bcryptjs';
export async function generateOTP_passwordReset(userid)
{
    var otp= Math.floor(100000 + Math.random() * 900000)
    var created = Math.floor(Date.now()/1000)
    var type = "PASSWORD_RESET"

    /*
    // TODO
    As of now, OTP is stored as a plain text (oops, mybad)
    To change it to a hashed value, a change in database's column length is required, which would require an update page for the end user.
    I'll leave this as it is for now, but this HAS TO be changed.
    
    const salt = await bcrypt.genSalt(10)
    const otpHash  = await bcrypt.hash(toString(otp), salt)
    console.log(otpHash)
    */
    var reqid = getRandomString(16)
    var con = getConnectionVar()
    var deleteResponse = await deleteAllOTPs_passwordReset(userid)
    return new Promise( (resolve, reject) => {
        con.query('INSERT INTO otp_table (userid, otp, created, type, reqid) VALUES (?,?,? ,?,?)', [userid, otp, created, type, reqid], function (error, results, fields) {
            con.end()
            if (error) {
                console.log(error) 
                return resolve(null)

            }
            return resolve({reqid: reqid, otp: otp})
            });

    })

}

export async function sendResetPasswordMessage(emailid, otp )
{
    var messageText = ("<b>OTP to reset your password</b>")
    messageText += "<p> Hi there!</p>"
    messageText += "<p> Your OTP to reset your MMDL password is: <b>"+otp+"</b></p>"
    messageText += "<p> Thank you,</p>"
    messageText += "<p> MMDL Admin</p>"

    var subject = otp+ " is your OTP to reset your MMDL password"
    return new Promise( (resolve, reject) => {
        
        sendEmail(emailid, subject, messageText).then(result =>
            {
                return resolve(result)
            })

        })        
}

export async function deleteAllOTPs_passwordReset(userid)
{
    var con = getConnectionVar()

    return new Promise( (resolve, reject) => {
        con.query('DELETE FROM otp_table WHERE userid=? AND type=?', [userid,  'PASSWORD_RESET'], function (error, results, fields) {
        if (error) {
            console.log(error.message)
        }
        con.end()

        return resolve(true)
        });
    })

}
export async function otpIsValid(userid, reqid, otp)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM otp_table WHERE otp=? AND userid=? AND reqid=? ", [otp, userid, reqid], function (err, result, fields) {
            con.end()

            if (err){
                console.log(err)
                return resolve(false)
              
            } 
            var resultfromDB = Object.values(JSON.parse(JSON.stringify(result)))
            if(resultfromDB!=null&&Array.isArray(resultfromDB)&&resultfromDB.length>0)
            {
                var maxValidity= Math.floor(Date.now()/1000) + process.env.MAX_OTP_VALIDITY
                if(resultfromDB[0].created < maxValidity){
                    return resolve(true)

                }else{
                    return resolve(false)
                }
                return resolve(resultfromDB[0].users_id)

            }
            else
            {
                return resolve(false)
            }
            return resolve(false);

        })
    })
}



