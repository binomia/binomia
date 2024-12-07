import { QUEUE_JOBS_NAME } from "@/constants";
import { Cryptography } from "@/helpers/cryptography";
import { transactionsQueue } from "@/queues";
import { Queue } from 'bullmq';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import Redis from "ioredis";
import { createBullBoard } from "@bull-board/api";


export const connection = {
    host: "redis",
    port: 6379
}

export const redis = new Redis({
    host: "redis",
    port: 6379
})


export const initRedisEventSubcription = async (bullDashboard: ReturnType<typeof createBullBoard>) => {
    process.on("message", async ({ channel, payload }: any) => {
        switch (channel) {
            case QUEUE_JOBS_NAME.CREATE_TRANSACTION:
            case QUEUE_JOBS_NAME.PENDING_TRANSACTION: {
                const { jobName, jobTime, jobId, amount, senderId, receiverId, data } = JSON.parse(payload);
                const encryptedData = await Cryptography.encrypt(JSON.stringify(data));

                await transactionsQueue.createJobs({ jobId, jobName, jobTime, amount, senderId, receiverId, data: encryptedData });
                break;
            }
            case QUEUE_JOBS_NAME.REMOVE_TRANSACTION_FROM_QUEUE: {
                const { jobId } = JSON.parse(payload);
                console.log("REMOVE_TRANSACTION_FROM_QUEUE:", jobId);

                await transactionsQueue.removeJob(jobId);
                break;
            }
            case QUEUE_JOBS_NAME.CREATE_NEW_QUEUE: {
                const queue = new Queue(payload, { connection: { host: "redis", port: 6379 } });
                const adapter = new BullMQAdapter(queue);

                bullDashboard.addQueue(adapter);
                break;
            }
            default: {
                break;
            }
        }
    })
}
