var { SendMailClient } = require("zeptomail");
require("dotenv").config();

const url = "api.zeptomail.com/v1.1/email/template";
const token = process.env.zeptomail_token;

let client = new SendMailClient({url, token});

client.sendMail({
    "mail_template_key": process.env.otp_template_key,
    "from": 
    {
        "address": "noreply@betatenant.com",
        "name": "noreply"
    },
    "to": 
    [
        {
        "email_address": 
            {
                "address": "ukokjnr@gmail.com",
                "name": "Victor Ukok"
            }
        }
    ],
    "merge_info": {"name":"Victor Ukok","OTP":"300303"},
    "subject": "Test Email"
}).then((resp) => console.log("success")).catch((error) => console.log(error,"error"));