
export function sendEmail( receipt_email, subject, textHTML) {
    const nodemailer = require('nodemailer');

    return new Promise( (resolve, reject) => {
        try{
            let transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                auth: {
                  user: process.env.SMTP_USERNAME,
                  pass: process.env.SMTP_PASSWORD,
                },
              });
        
              var message = {
                from: process.env.SMTP_USERNAME,
                to: receipt_email,
                subject: subject,
                html: textHTML,
              };
              transporter.sendMail(message, (err, info) => {
                if (err) {
                    console.log('sendEmail Error occurred. ' + err.message);
                    return resolve(false)
                }
                //console.log('Message sent: %s', info);
                //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                return resolve(info)
            })
           }catch(e)
           {
            console.log(e)
            return resolve(false)
           }
        
    })
    
}