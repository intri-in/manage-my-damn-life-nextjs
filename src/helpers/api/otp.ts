import { otp_table } from "models/otp_table";
import { getRandomString } from "../crypto"
import { getConnectionVar, getSequelizeObj } from "./db"
import { sendEmail } from "./email"
import crypto from "crypto"

const otp_tableModel = otp_table.initModel(getSequelizeObj())
const MAX_OTP_VALIDITY = process.env.MAX_OTP_VALIDITY ? parseInt(process.env.MAX_OTP_VALIDITY) : 1800

function getOTPHash(otp){
    return crypto.createHash('sha256').update(otp.toString()).digest('base64')
}
export async function generateOTP_passwordReset(userid)
{
    const otp= Math.floor(100000 + Math.random() * 900000)
    console.log("otp", otp)
    const created = Math.floor(Date.now()/1000)
    const type = "PASSWORD_RESET"

    /*
    // TODO
    As of now, OTP is stored as a plain text (oops, mybad)
    To change it to a hashed value, a change in database's column length is required, which would require an update page for the end user.
    I'll leave this as it is for now, but this HAS TO be changed.
    
    const salt = await bcrypt.genSalt(10)
    const otpHash  = await bcrypt.hash(toString(otp), salt)
    console.log(otpHash)
    */
    const reqid = getRandomString(16)
    await deleteAllOTPs_passwordReset(userid)
    const otpHash= getOTPHash(otp)
    return otp_tableModel.create({ userid: userid, otp:otpHash.toString(), created:created.toString(), type:type, reqid:reqid });
    // var con = getConnectionVar()
    // return new Promise( (resolve, reject) => {
    //     con.query('INSERT INTO otp_table (userid, otp, created, type, reqid) VALUES (?,?,? ,?,?)', [userid, otp, created, type, reqid], function (error, results, fields) {
    //         con.end()
    //         if (error) {
    //             console.log(error) 
    //             return resolve(null)

    //         }
    //         return resolve({reqid: reqid, otp: otp})
    //         });

    // })

}

export async function sendResetPasswordMessage(emailid, otp ): Promise<Object>
{
    let messageText = ("<b>OTP to reset your password</b>")
    messageText += "<p> Hi there!</p>"
    messageText += "<p> Your OTP to reset your MMDL password is: <b>"+otp+"</b></p>"
    messageText += "<p> Thank you,</p>"
    messageText += "<p> MMDL Admin</p>"

    var subject = otp+ " is your OTP to reset your MMDL password"
    return new Promise( (resolve, reject) => {
        
        sendEmail(emailid, subject, messageText).then(result =>
            {
                return resolve(result)
            }).catch(e =>{
                return resolve({})

        }) 
        })       
}

export async function deleteAllOTPs_passwordReset(userid)
{

    return otp_table.destroy({
        where:{
            userid: userid.toString(),
            type: 'PASSWORD_RESET'
        }
    })
    // var con = getConnectionVar()

    // return new Promise( (resolve, reject) => {
    //     con.query('DELETE FROM otp_table WHERE userid=? AND type=?', [userid,  'PASSWORD_RESET'], function (error, results, fields) {
    //     if (error) {
    //         console.log(error.message)
    //     }
    //     con.end()

    //     return resolve(true)
    //     });
    // })

}
export async function otpIsValid(userid, reqid, otp)
{


    const resultfromDB = await otp_tableModel.findOne({
        where:{
            otp:getOTPHash(otp.toString()), userid:userid.toString(), reqid:reqid.toString()
        }
    })

    if(resultfromDB &&("otp" in resultfromDB) && ("created" in resultfromDB) && resultfromDB.created)
            {
                var maxValidity= Math.floor(Date.now()/1000) + MAX_OTP_VALIDITY
                if(parseInt(resultfromDB.created) < maxValidity){
                    return true

                }else{
                    return false
                }

            }
    return false
    // var con = getConnectionVar()
    // return new Promise( (resolve, reject) => {
    //     con.query("SELECT * FROM otp_table WHERE otp=? AND userid=? AND reqid=? ", [otp, userid, reqid], function (err, result, fields) {
    //         con.end()

    //         if (err){
    //             console.log(err)
    //             return resolve(false)
              
    //         } 
    //         var resultfromDB = Object.values(JSON.parse(JSON.stringify(result)))
    //         if(resultfromDB!=null&&Array.isArray(resultfromDB)&&resultfromDB.length>0)
    //         {
    //             var maxValidity= Math.floor(Date.now()/1000) + process.env.MAX_OTP_VALIDITY
    //             if(resultfromDB[0].created < maxValidity){
    //                 return resolve(true)

    //             }else{
    //                 return resolve(false)
    //             }
    //             return resolve(resultfromDB[0].users_id)

    //         }
    //         else
    //         {
    //             return resolve(false)
    //         }
    //         return resolve(false);

    //     })
    // })
}



