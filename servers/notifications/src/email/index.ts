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

    static sendVerificationCode = async (to: string, code: string): Promise<SentMessageInfo> => {
        try {
            const info = await Email.send({
                to,
                subject: "Verificacion de Inicio de Sesion",
                text: "Tu codigo de verificacion es: " + code,
                html: `
                    <html>
                        <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
                            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                                <div style="text-align: center; padding-bottom: 20px;">
                                    <img src="https://res.cloudinary.com/brayhandeaza/image/upload/v1734925393/gwxyuqagrvxxwq2xps6f.png" alt="binomia-logo"">
                                </div>
                                <h2 style="color: #1D9B48; text-align: center;">Verificación de Inicio de Sesión</h2>
                                <p style="font-size: 16px; color: #555;">
                                    Hola, <br>
                                    Has solicitado un código de verificación para iniciar sesión. Tu código es:
                                </p>  
                                <span style="font-size: 18px; background: #1D9B48; color: #fff; border-radius: 10px; padding: 5px 10px; font-weight: bold; text-align: center;">
                                    ${code}
                                </span>                                                        
                               <p style="font-size: 16px; color: #555;">
                                    Si no solicitaste este código, puedes ignorar este mensaje.
                                </p>                              
                                <p style="font-size: 16px; color: #555;">El equipo de soporte</p>
                                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                                <footer style="text-align: center; font-size: 12px; color: #999;">
                                    <p>Si necesitas ayuda, por favor <a href="mailto:soporte@tuempresa.com" style="color: #1D9B48; text-decoration: none;">contáctanos</a> para obtener ayuda.</p>
                                </footer>
                            </div>                            
                        </body>
                    </html>
                `
            });

            return info

        } catch (error) {
            console.error(error);
            throw error
        }
    }
}


export default Email

