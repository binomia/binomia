import { QUEUE_JOBS_NAME } from "@/constants";
import { transactionsQueue } from "@/queues";
import Redis from "ioredis";


export const connection = {
    host: "redis",
    port: 6379
}

export default new Redis({
    host: "redis",
    port: 6379
})


export const initRedisEventSubcription = async () => {
    process.on("message", async ({ channel, payload }: any) => {
        switch (channel) {
            case QUEUE_JOBS_NAME.CREATE_TRANSACTION:
                const { jobName, jobTime, transaction } = JSON.parse(payload);
                await transactionsQueue.createJobs(jobName, jobTime, transaction);
                break;
            default:
                break;
        }
    })
}

