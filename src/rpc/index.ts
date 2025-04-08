import { ZERO_ENCRYPTION_KEY } from "@/constants";
import Email from "@/email";
import { JSONRPCServer } from "json-rpc-2.0";
import jwt from 'jsonwebtoken';
import { authServer } from "./clients";
import { sendNotification } from "@/expo";
import { Server } from "socket.io";
import { HASH } from "cryptografia";

export const initMethods = (server: JSONRPCServer, io: Server) => {
    server.addMethod("sendEmail", async ({ to, code, subject, text, html }: { to: string, code: string, subject: string, text: string, html: string }) => {
        try {
            console.log({ code });

            const hash = await HASH.sha256Async(code.toString());
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

    server.addMethod("sendVerificationCode", async ({ email, code }: { email: string, code: string }) => {
        try {
            console.log({ email, code });
            
            const sentMessageInfo = await Email.sendVerificationCode(email, code);
            return sentMessageInfo

        } catch (error) {

        }
    });

    server.addMethod("newTransactionNotification", async ({ data }: { data: { token: string, message: string }[] }) => {
        try {
            await sendNotification(data)
            return true

        } catch (error) {
            console.log(error);
        }
    });

    server.addMethod("socketEventEmitter", async ({ data, channel, senderSocketRoom, recipientSocketRoom }: { data: any, channel: string, senderSocketRoom: string, recipientSocketRoom: string }) => {
        try {
            io.to([recipientSocketRoom, senderSocketRoom]).emit(channel, data)
            return true

        } catch (error) {
            console.log(error);
        }
    });
}