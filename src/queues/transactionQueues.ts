import { Job, JobJson, Queue, Worker } from "bullmq";
import { WeeklyQueueTitleType } from "@/types";
import { getNextDay } from "@/helpers";
import { QueueTransactionsController } from "@/controllers/queueTransactionsController";
import shortUUID from "short-uuid";


export default class TransactionsQueue {
    queue: Queue;

    constructor() {
        this.queue = new Queue("transactions", { connection: { host: "redis", port: 6379 } });
        this.workers()
    }

    private executeJob = async (job: JobJson) => {
        try {
            const prosessTransaction = await QueueTransactionsController.prosessTransaction(job)
            if (prosessTransaction === "transactionStatusCompleted")
                if (job.repeatJobKey)
                    this.removeJob(job.repeatJobKey)

        } catch (error) {
            console.log({ executeJob: error });
        }
    }

    private workers = async () => {
        const worker = new Worker('transactions', async (job) => this.executeJob(job.asJSON()), {
            connection: { host: "redis", port: 6379 },
            settings: {
                backoffStrategy: (attemptsMade: number) => attemptsMade * 1000
            }
        });

        worker.on('completed', (job: Job) => {
            console.log('Job completed', job.repeatJobKey);
        })
    }

    createJobs = async ({ jobId, jobName, jobTime, amount, receiverId, senderId, data }: { jobId: string, amount: number, jobName: string, jobTime: WeeklyQueueTitleType, senderId: number, receiverId: number, data: string }) => {
        switch (jobName) {
            case "weekly": {
                const delay = getNextDay(jobTime)

                const job = await this.addJob(jobId, data, delay, delay);
                const transaction = await QueueTransactionsController.createTransaction(Object.assign(job.asJSON(), {
                    jobTime,
                    jobName,
                    receiverId,
                    senderId,
                    amount,
                    data,
                }))

                return transaction
            }
            case "pendingTransaction": {
                const delay = 1000 * 20 // * 30 // 30 minutes
                const job = await this.addJob(jobId, data, delay, delay);

                const transaction = await QueueTransactionsController.createTransaction(Object.assign(job.asJSON(), {
                    jobTime,
                    jobName,
                    receiverId,
                    senderId,
                    amount,
                    data,
                }))

                return transaction
            }
            default: {
                return
            }
        }
    }

    addJob = async (jobName: string, data: string, delay: number = 0, every: number = 0) => {
        const job = await this.queue.add(jobName, data, { delay, repeat: { every, startDate: delay } })
        return job
    }

    removeJob = async (repeatJobKey: string) => {
        try {
            const job = await this.queue.removeJobScheduler(repeatJobKey)
            if (job) {
                const transaction = await QueueTransactionsController.inactiveTransaction(repeatJobKey)
                return transaction;
            }

            throw "Job not found"

        } catch (error: any) {
            throw error.toString()
        }
    }

    updateJob = async (repeatJobKey: string, jobName: string, jobTime: WeeklyQueueTitleType): Promise<any> => {
        try {
            const job = await this.queue.removeJobScheduler(repeatJobKey)
            if (job) {
                const transaction = await QueueTransactionsController.inactiveTransaction(repeatJobKey)

                const newTransaction = await this.createJobs({
                    jobId: shortUUID.generate(),
                    amount: transaction.amount,
                    jobName,
                    jobTime,
                    senderId: transaction.senderId,
                    receiverId: transaction.receiverId,
                    data: transaction.data
                })

                return newTransaction;
            }

            throw "Job not found"

        } catch (error: any) {
            throw error.toString()
        }
    }
}