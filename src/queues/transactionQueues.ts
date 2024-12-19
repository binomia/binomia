import { Job, JobJson, Queue, Worker } from "bullmq";
import { MonthlyQueueTitleType, WeeklyQueueTitleType } from "@/types";
import { QueueTransactionsController } from "@/controllers/queueTransactionsController";
import shortUUID from "short-uuid";
import { CRON_JOB_BIWEEKLY_PATTERN, CRON_JOB_EVERY_HALF_HOUR_PATTERN, CRON_JOB_MONTHLY_PATTERN, CRON_JOB_WEEKLY_PATTERN } from "@/constants";


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

    createJobs = async ({ jobId, jobName, jobTime, amount, receiverId, senderId, data }: { jobId: string, amount: number, jobName: string, jobTime: string, senderId: number, receiverId: number, data: string }) => {
        console.log({
            jobName,
            jobTime
        });
        switch (jobName) {
            case "weekly": {
                const job = await this.addJob(jobId, data, CRON_JOB_WEEKLY_PATTERN[jobTime as WeeklyQueueTitleType]);
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
            case "biweekly": {
                const job = await this.addJob(jobId, data, CRON_JOB_BIWEEKLY_PATTERN);
                const transaction = await QueueTransactionsController.createTransaction(Object.assign(job.asJSON(), {
                    jobTime,
                    jobName,
                    receiverId,
                    senderId,
                    amount,
                    data
                }))

                return transaction
            }
            case "monthly": {
                const job = await this.addJob(jobId, data, CRON_JOB_MONTHLY_PATTERN[jobTime as MonthlyQueueTitleType]);
                const transaction = await QueueTransactionsController.createTransaction(Object.assign(job.asJSON(), {
                    jobTime,
                    jobName,
                    receiverId,
                    senderId,
                    amount,
                    data
                }))

                return transaction
            }
            case "pendingTransaction": {
                const job = await this.addJob(jobId, data, CRON_JOB_EVERY_HALF_HOUR_PATTERN);
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

    addJob = async (jobName: string, data: string, pattern: string) => {
        const job = await this.queue.upsertJobScheduler(jobName, { tz: "EST", pattern }, { data });
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