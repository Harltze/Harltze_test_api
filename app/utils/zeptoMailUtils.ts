import "dotenv/config";
import { SendMailClient } from "zeptomail";

const url = "api.zeptomail.com/v1.1/email/template";
const token = process.env.zeptomail_token;

let client = new SendMailClient({url, token});

interface ZeptomailInterface {
    email: string;
    name: string
}

async function sendZeptoEmailWithOTP(emailDetails: ZeptomailInterface[], OTP: string) {

    try {

        const emailDetailsTransformed = emailDetails.map(e => {
            return {
                "email_address":
                    {
                        "address": e.email,
                        "name": e.name
                    }
                }
        });
    
        await client.sendMail({
            "mail_template_key": process.env.otp_template_key,
            "from": 
            {
                "address": "noreply@betatenant.com",
                "name": "Beta Tenant"
            },
            "to": emailDetailsTransformed,
            "merge_info": {"name": emailDetails[0].name,"OTP": OTP},
            "subject": "Beta Tenant - OTP"
        });

        return {
            anyError: false,
            error: {},
            message: "Email Sent Successfully"
        }
    } catch (error) {
        return {
            anyError: true,
            error,
            message: "An error occurred"
        }
    }
};

export {
    sendZeptoEmailWithOTP
};