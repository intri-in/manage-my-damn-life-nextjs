import { getRandomString } from "../crypto"
import { getConnectionVar } from "./db"
import { sendEmail } from "./email"

export async function generateOTP_passwordReset(userid)
{
    var otp= Math.floor(100000 + Math.random() * 900000)
    var created = Math.floor(Date.now()/1000)
    var type = "PASSWORD_RESET"
    var reqid = getRandomString(16)
    var con = getConnectionVar()
    var deleteResponse = await deleteAllOTPs_passwordReset(userid)
    return new Promise( (resolve, reject) => {
        con.query('INSERT INTO otp_table (userid, otp, created, type, reqid) VALUES (?,?,? ,?,?)', [userid, otp, created, type, reqid], function (error, results, fields) {
            con.end()
            if (error) {
                console.log(error) 
                resolve(null)

            }
            resolve({reqid: reqid, otp: otp})
            });

    })

}

export async function sendResetPasswordMessage(emailid, otp )
{
    var messageText = ("<b>OTP to reset your password</b>")
    messageText += "<p> Hi there!</p>"
    messageText += "<p> Your OTP to reset your MMDM password is: <b>"+otp+"</b></p>"
    messageText += "<p> Thank you,</p>"
    messageText += "<p> MMDM Admin</p>"

    var subject = otp+ " is your OTP to reset your MMDM password"
    return new Promise( (resolve, reject) => {
        
        sendEmail(emailid, subject, messageText).then(result =>
            {
                resolve(result)
            })

        })        
}

export async function deleteAllOTPs_passwordReset(userid)
{
    var con = getConnectionVar()

    return new Promise( (resolve, reject) => {
        con.query('DELETE FROM otp_table WHERE userid=? AND type=?', [userid,  'PASSWORD_RESET'], function (error, results, fields) {
        if (error) {
            throw error.message
        }
        con.end()

        resolve(true)
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
                resolve(false)
              
            } 
            var resultfromDB = Object.values(JSON.parse(JSON.stringify(result)))
            if(resultfromDB!=null&&Array.isArray(resultfromDB)&&resultfromDB.length>0)
            {
                var maxValidity= Math.floor(Date.now()/1000) + process.env.MAX_OTP_VALIDITY
                if(resultfromDB[0].created < maxValidity){
                    resolve(true)

                }else{
                    resolve(false)
                }
                resolve(resultfromDB[0].users_id)

            }
            else
            {
                resolve(false)
            }
            resolve(false);

        })
    })
}



