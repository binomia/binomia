import { topUpQueue, transactionsQueue } from "@/queues";
import { JSONRPCServer } from "json-rpc-2.0";
import { connection, redis } from "@/redis";
import { QUEUE_JOBS_NAME, ZERO_ENCRYPTION_KEY } from "@/constants";
import { Queue } from "bullmq";
import { topUpMethods } from "./topupRPC";
import { AES } from "cryptografia";



export const initMethods = (server: JSONRPCServer) => {
    topUpMethods(server)

    // gloabal methods
    server.addMethod("test", async ({ userId }: { userId: number }) => {
        try {
            const queue = new Queue("transactions", { connection });

            const getJobs = await queue.getJobs(["delayed"])

            const jobs = await Promise.all(
                getJobs.map(async job => {
                    const jsonData = job.asJSON()

                    const decryptedData = await AES.decrypt(JSON.parse(jsonData.data), ZERO_ENCRYPTION_KEY)
                    const response = JSON.parse(decryptedData).response

                    if (response?.userId === userId && response.isRecurrence)
                        return response

                    return []
                }).flat()
            )

            return jobs.flat()

        } catch (error: any) {
            console.log({ error });
            throw new Error(error);
        }
    });

    server.addMethod("getJob", async ({ userId }: { userId: string }) => {
        try {
            const queue = new Queue("topups", { connection });
            const getJobs = await queue.getJobs(["delayed"])

            const jobs = await Promise.all(
                getJobs.map(async job => {
                    const jsonData = job.asJSON()

                    const decryptedData = await AES.decrypt(JSON.parse(jsonData.data), ZERO_ENCRYPTION_KEY)
                    const response = JSON.parse(decryptedData).response

                    if (response?.userId === userId && response.isRecurrence)
                        return response

                    return []
                }).flat()
            )

            return jobs.flat()

        } catch (error: any) {
            console.log({ error });
            throw new Error(error);
        }
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

}