import { QUEUE_JOBS_NAME } from "@/constants";
import { Cryptography } from "@/helpers/cryptography";
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
            case QUEUE_JOBS_NAME.CREATE_TRANSACTION: {
                const { jobName, jobTime, jobId, accountId, data } = JSON.parse(payload);
                const encryptedData = await Cryptography.encrypt(JSON.stringify(data));

                await transactionsQueue.createJobs({ jobId, jobName, jobTime, accountId, data: encryptedData });
                break;
            }
            case QUEUE_JOBS_NAME.REMOVE_TRANSACTION_FROM_QUEUE: {
                const { jobId } = JSON.parse(payload);
                console.log("REMOVE_TRANSACTION_FROM_QUEUE:", jobId);

                await transactionsQueue.removeJob(jobId);
                break;
            }
            default: {               
                break;
            }
        }
    })
}

