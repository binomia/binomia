import { REDIS_SUBSCRIPTION_CHANNEL } from "@/constants";
import Email from "@/email";
import { sendNotification } from "@/expo";
import Redis from "ioredis";
import { Server } from "socket.io";


export const redis = new Redis({
    host: "redis",
    port: 6379,
})

export const subscriber = new Redis({
    host: "redis",
    port: 6379,
})


export const initRedisEventSubcription = (io: Server) => {
    process.on("message", async ({ channel, payload }: any) => {
        switch (channel) {
            case REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED: {
                const { data, recipientSocketRoom, expoNotificationTokens } = JSON.parse(payload)
                
                io.to(recipientSocketRoom).emit(channel, data)
                await sendNotification(expoNotificationTokens)
                
                break;
            }
            case REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_REQUEST_PAIED: {
                const { data, recipientSocketRoom } = JSON.parse(payload)
                io.to(recipientSocketRoom).emit(channel, data)
                break;
            }
            case REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED_FROM_QUEUE: {
                const { data, senderSocketRoom } = JSON.parse(payload)
                io.to(senderSocketRoom).emit(channel, data)
                break;
            }
            case REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_REQUEST_CANCELED: {
                const { data, senderSocketRoom } = JSON.parse(payload)
                io.to(senderSocketRoom).emit(channel, data)
                break;
            }
            case REDIS_SUBSCRIPTION_CHANNEL.LOGIN_VERIFICATION_CODE: {
                const { data: { user, code } } = JSON.parse(payload)

                await Email.sendVerificationCode(user.email, code);
                console.log("redis event: ", code);
                break;
            }
            case REDIS_SUBSCRIPTION_CHANNEL.BANKING_TRANSACTION_CREATED: {
                const transaction = JSON.parse(payload)
                console.log({ BANKING_TRANSACTION_CREATED: transaction });
                break;
            }
            default:
                break;
        }
    })
}
