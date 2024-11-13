import { QUEUE_JOBS_NAME } from "@/constants";
import Redis from "ioredis";


export const connection = {
    host: "redis",
    port: 6379
}

export default new Redis(connection)



export const initRedisEventSubcription = () => {
    process.on("message", async ({ channel, payload }: any) => {
        switch (channel) {
            case QUEUE_JOBS_NAME.CREATE_TRANSACTION:
                const { transaction, recipientSocketRoom } = JSON.parse(payload)
                console.log({ transaction, recipientSocketRoom });
                break;
            default:
                break;
        }
    })
}

