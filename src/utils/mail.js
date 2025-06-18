
import Mailgen from "mailgen";
import nodemailer from "nodemailer"


const sendEmail =  async (options) => {
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {

            name: 'Task Manager',
            link: 'https://taskmanager.js/'

        }
    });
    console.log("mailgen content = ", options.mailGenContent);
    
    var emailText = mailGenerator.generatePlaintext(options.mailGenContent);
    var emailHtml = mailGenerator.generate(options.mailGenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: process.env.MAILTRAP_SMTP_USER,
          pass: process.env.MAILTRAP_SMTP_PASS,
        },
      });
    
      const mail = {
            from: "mail.taskmanager@example.com", // sender address
            to: options.email, // list of receivers
            subject: options.subject, // Subject line
            text: emailText, // plain text body
            html: emailHtml, // html body
      }

      try {
            await transporter.sendMail(mail)

        
      } catch (error) {
        console.error("Email Failed", error)
      }

}

const emailVerificationMailGenContent = (username, verificationUrl) => {

    return{

        body: {
            name:username,
            intro: 'Welcome to App! We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started with our , please click here:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Verify your email',
                    link: verificationUrl
                }
            },

            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        },
    }
}

const forgotPasswordMailGenContent = (username, passwordResetUrl) => {

    return{

        body: {
            name:username,
            intro: 'We got request for reset your password.',
            action: {
                instructions: 'To change your password click the button',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'reset password',
                    link: passwordResetUrl
                }
            },

            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        },
    }
}


export{
sendEmail,
emailVerificationMailGenContent,
forgotPasswordMailGenContent
}