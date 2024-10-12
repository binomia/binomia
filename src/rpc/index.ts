import { ZERO_ENCRYPTION_KEY } from "@/constants";
import Email from "@/email";
import { JSONRPCServer } from "json-rpc-2.0";
import jwt from 'jsonwebtoken';
import { Cryptography } from "@/helpers/cryptography";
import { authServer } from "./clients";


export const initMethods = (server: JSONRPCServer) => {
    server.addMethod("sendEmail", async ({ to, code, subject, text, html }: { to: string, code: string, subject: string, text: string, html: string }) => {
        try { 
            console.log({code});
            
            const hash = await Cryptography.hash(code.toString());
            const token = jwt.sign({ exp: 10 * 1000 * 60, data: hash }, ZERO_ENCRYPTION_KEY);
            const signature = await authServer("signData", { token })
            
            await Email.send({ to, subject, text, html })
            return {
                token,
                signature
            }

        } catch (error) {
            console.log(error);
        }
    });

    // Another example method
    server.addMethod("echo", (data) => {
        return data;
    });
}