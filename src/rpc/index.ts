import { topUpQueue, transactionsQueue } from "@/queues";
import { WeeklyQueueTitleType } from "@/types";
import { JSONRPCServer } from "json-rpc-2.0";
import { connection, redis } from "@/redis";
import { QUEUE_JOBS_NAME, ZERO_ENCRYPTION_KEY } from "@/constants";
import { Job, JobType, Queue } from "bullmq";
import { transactionMethods } from "./transactionRPC";
import { topUpMethods } from "./topupRPC";
import { AES } from "cryptografia";



export const initMethods = (server: JSONRPCServer) => {
    transactionMethods(server)
    topUpMethods(server)

    // gloabal methods
    server.addMethod("test", async ({ name, }: { name: string }) => {
        try {
            const queue = new Queue(name, { connection: { host: "redis", port: 6379 } });
            const getJobs = await queue.getJobs()

            const jobs = await Promise.all(
                getJobs.map(async job => ({
                    ...job.asJSON(),
                    state: (await job.getState()),
                    queueName: job.queueName,
                }))
            )

            return jobs

        } catch (error: any) {
            console.log({ error });
            throw new Error(error);
        }
    });

    // const transactionResponse = {
    //     userId,
    //     transactionId,
    //     "amount": validatedData.amount,
    //     "deliveredAmount": validatedData.amount,
    //     "voidedAmount": validatedData.amount,
    //     "transactionType": validatedData.transactionType,
    //     "currency": "DOP",
    //     "status": "waiting",
    //     "location": validatedData.location,
    //     "createdAt": Date.now().toString(),
    //     "updatedAt": Date.now().toString(),
    //     "from": {
    //         ...account,
    //         user
    //     },
    //     "to": {
    //         ...receiverAccount.toJSON()
    //     }
    // }

    // const queueData = {
    //     receiverUsername: validatedData.receiver,
    //     sender: {
    //         id: userId,
    //         fullName: user.fullName,
    //         username: user.username,
    //         accountId: user.account.id,
    //         balance: user.account.balance
    //     },
    //     transaction: {
    //         transactionId,
    //         amount: validatedData.amount,
    //         location: validatedData.location,
    //         currency: validatedData.currency,
    //         transactionType: validatedData.transactionType,
    //         signature,
    //         recurrenceData,
    //         status: "pending",
    //         isRecurring: recurrenceData.time !== "oneTime",
    //     },
    //     device: {
    //         deviceId: deviceid,
    //         sessionId: sid,
    //         ipAddress: ipaddress,
    //         platform,
    //     },
    //     response: transactionResponse
    // }

    // gloabal methods
    server.addMethod("getJob", async ({ userId }: { userId: string }) => {
        try {
            const queue = new Queue("transactions", { connection });
            const getJobs = await queue.getJobs(["delayed"])

            const jobs = await Promise.all(
                getJobs.map(async job => {
                    const jsonData = job.asJSON()

                    const decryptedData = await AES.decrypt(JSON.parse(jsonData.data), ZERO_ENCRYPTION_KEY)
                    const response = JSON.parse(decryptedData).response

                    if (response?.userId === userId && response.isRecurrence)
                        return { response, userId }

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

    server.addMethod("updateRecurrentTransactions", async ({ jobKey, jobName, jobTime, queueType }: { jobKey: string, queueType: string, jobName: string, jobTime: WeeklyQueueTitleType }) => {
        try {
            // if (queueType === "topup") {
            //     const job = await topUpQueue.updateTopUpJob(jobKey, jobName, jobTime)
            //     return job
            // }

            const job = await transactionsQueue.updateTransactionJob(jobKey, jobName, jobTime)
            return job

            // Creates a new Job Scheduler that generates a job every 1000 milliseconds (1 second)
            const firstJob = await transactionsQueue.queue.upsertJobScheduler('my-scheduler-id', {
                every: 1000,
            });

        } catch (error: any) {
            throw new Error(error.toString());
        }
    });
}