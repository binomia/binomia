import { REDIS_SUBSCRIPTION_CHANNEL } from "@/constants";
import Email from "@/email";
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
            case REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED:
                const { transaction, recipientSocketRoom } = JSON.parse(payload)

                io.to(recipientSocketRoom).emit(channel, transaction)
                break;

            case REDIS_SUBSCRIPTION_CHANNEL.LOGIN_VERIFICATION_CODE:                
                const { data: { user, code } } = JSON.parse(payload)

                // await Email.sendVerificationCode(user.email, code);
                console.log("redis event: ", code);
                break;

            default:
                break;
        }
    })
}

