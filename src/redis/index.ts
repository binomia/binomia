import { REDIS_SUBSCRIPTION_CHANNEL } from "@/constants";
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
    subscriber.subscribe(REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED)

    subscriber.on("message", (channel, payload) => {
        const { transaction, recipientSocketRoom } = JSON.parse(payload)
        console.log({
            channel,
            transaction,
            recipientSocketRoom
        });

        io.to(recipientSocketRoom).emit(channel, transaction)
    })
}

