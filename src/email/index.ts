import { NODEMAILER_EMAIL, SENDGRID_API_KEY } from "@/constants";
import nodemailer, { SentMessageInfo } from "nodemailer";
import sgMail from '@sendgrid/mail';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // gmail server
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: "brayhandeaza@gmail.com",
        pass: "ezze dczd mehm iceg",
    },
});

sgMail.setApiKey(SENDGRID_API_KEY);


class Email {
    static sendGrid = async ({ to, subject, text, html }: { to: string, subject: string, text: string, html: string }): Promise<SentMessageInfo> => {
        try {
            const info = await sgMail.send({
                to,
                html,
                from: "brayhandeaza@gmail.com",
                subject,
                text,
                // templateId: "4dcb1341dd3c4806a84931ee59f0311e",
            });

            return info

        } catch (error: any) {
            console.error(error);

            if (error.response) {
                console.error(error.response.body)
            }
        }
    }


    static send = async ({ to, subject, text, html }: { to: string, subject: string, text: string, html: string }): Promise<SentMessageInfo> => {
        try {
            const info = await transporter.sendMail({ from: NODEMAILER_EMAIL, to, subject, text, html })
            return info.messageId

        } catch (error) {
            console.log(error);
        }
    }
}


export default Email

