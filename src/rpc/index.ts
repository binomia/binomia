import { topUpQueue, transactionsQueue } from "@/queues";
import { WeeklyQueueTitleType } from "@/types";
import { JSONRPCServer } from "json-rpc-2.0";
import { redis } from "@/redis";
import { QUEUE_JOBS_NAME } from "@/constants";
import { Job, Queue } from "bullmq";
import { transactionMethods } from "./transactionRPC";
import { topUpMethods } from "./topupRPC";



export const initMethods = (server: JSONRPCServer) => {
    transactionMethods(server)
    topUpMethods(server)
    
    // gloabal methods
    server.addMethod("test", async ({ queueName, jobId, jobKey }: { queueName: string, jobId: string, jobKey: string }) => {
        const job = await transactionsQueue.queue.getJobScheduler(jobKey)
        return job
    });

    // queue methods
    server.addMethod("dropJobs", async () => {
        try {
            const keys = await redis.keys('bull:*:meta')
            const queueNames = keys.map(key => key.split(':')[1]);
            const queues = queueNames.map(name => new Queue(name, { connection: { host: "redis", port: 6379 } }));

            const jobs = await Promise.all(queues.map(async (queue) => {
                const getJobs = await queue.getJobs()
                await Promise.all(
                    getJobs.map(async ({ repeatJobKey, queueQualifiedName }) => {
                        if (repeatJobKey) {
                            if (queueQualifiedName === "bull:topups")
                                await topUpQueue.removeJob(repeatJobKey)

                            else if (queueQualifiedName === "bull:transactions")
                                await transactionsQueue.removeJob(repeatJobKey)
                        }
                    })
                )

                return "All jobs deleted";
            }));

            return jobs

        } catch (error: any) {
            console.log({ error });
            throw new Error(error);
        }

    });

    server.addMethod("getQueuesWithJobs", async () => {
        const keys = await redis.keys('bull:*:meta')
        const queueNames = keys.map(key => key.split(':')[1]);
        const queues = queueNames.map(name => new Queue(name, { connection: { host: "redis", port: 6379 } }));

        const jobs = await Promise.all(queues.map(async (queue) => {
            const name = queue.name
            const getJobs = await queue.getJobs()

            const jobs = await Promise.all(
                getJobs.map(async job => ({
                    ...job.asJSON(),
                    state: (await job.getState()),
                    queueName: job.queueName,
                }))
            )

            return { name, jobs };
        }));

        return jobs
    });

    server.addMethod("getQueues", async () => {
        const keys = await redis.keys('bull:*:meta')
        const queues = keys.map(key => key.split(':')[1]);


        return queues
    });

    server.addMethod("addQueue", async ({ queueName }: { queueName: string }) => {
        try {
            await redis.publish(QUEUE_JOBS_NAME.CREATE_NEW_QUEUE, queueName)
            return queueName

        } catch (error: any) {
            throw new Error(error.toString());
        }
    });

    server.addMethod("deleteRecurrentTransactions", async ({ jobKey, queueType }: { jobKey: string, queueType: string }) => {
        try {
            if (queueType === "topup") {
                const job = await topUpQueue.removeJob(jobKey)
                return job
            }

            const job = await transactionsQueue.removeJob(jobKey)
            return job

        } catch (error: any) {
            throw new Error(error.toString());
        }
    });

    server.addMethod("updateRecurrentTransactions", async ({ jobKey, jobName, jobTime, queueType }: { jobKey: string, queueType: string, jobName: string, jobTime: WeeklyQueueTitleType }) => {
        try {
            if (queueType === "topup") {
                const job = await topUpQueue.updateTopUpJob(jobKey, jobName, jobTime)
                return job
            }

            const job = await transactionsQueue.updateTransactionJob(jobKey, jobName, jobTime)
            return job

        } catch (error: any) {
            throw new Error(error.toString());
        }
    });
}