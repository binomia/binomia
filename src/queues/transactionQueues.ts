import { Job, JobJson, Queue, Worker } from "bullmq";
import { MonthlyQueueTitleType, WeeklyQueueTitleType } from "@/types";
import shortUUID from "short-uuid";
import { CRON_JOB_BIWEEKLY_PATTERN, CRON_JOB_MONTHLY_PATTERN, CRON_JOB_WEEKLY_PATTERN } from "@/constants";
import TransactionController from "@/controllers/transactionController";
import MainController from "@/controllers/mainController";


export default class TransactionsQueue {
    queue: Queue;

    constructor() {
        this.queue = new Queue("transactions", { connection: { host: "redis", port: 6379 } });
        this.workers()
    }

    private executeJob = async (job: JobJson) => {
        try {
            const prosessTransaction = await TransactionController.prosessTransaction(job)
            if (prosessTransaction === "transactionStatusCompleted")
                if (job.repeatJobKey)
                    this.removeJob(job.repeatJobKey, "completed")

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


    createJobs = async ({ jobId, jobName, jobTime, amount, userId, data }: { jobId: string, userId: number, amount: number, jobName: string, jobTime: string, data: string }) => {        
        switch (jobName) {
            case "weekly": {
                const job = await this.addJob(jobId, data, CRON_JOB_WEEKLY_PATTERN[jobTime as WeeklyQueueTitleType]);
                const transaction = await MainController.createQueue(Object.assign(job.asJSON(), {
                    queueType: "transaction",
                    jobTime,
                    jobName,                    
                    userId,
                    amount,
                    data,
                }))

                return transaction
            }
            case "biweekly": {
                const job = await this.addJob(jobId, data, CRON_JOB_BIWEEKLY_PATTERN);
                const transaction = await MainController.createQueue(Object.assign(job.asJSON(), {
                    queueType: "transaction",
                    jobTime,
                    jobName,
                    userId,
                    amount,
                    data
                }))

                return transaction
            }
            case "monthly": {
                const job = await this.addJob(jobId, data, CRON_JOB_MONTHLY_PATTERN[jobTime as MonthlyQueueTitleType]);
                const transaction = await MainController.createQueue(Object.assign(job.asJSON(), {
                    queueType: "transaction",
                    jobTime,
                    jobName,
                    userId,
                    amount,
                    data
                }))

                return transaction
            }
            case "pendingTransaction": {
                const job = await this.queue.add(jobId, data, { delay: 1000 * 60 * 30, repeat: { every: 1000 * 60 * 30 }, jobId }); // 30 minutes
                const transaction = await MainController.createQueue(Object.assign(job.asJSON(), {
                    queueType: "transaction",
                    jobTime,
                    jobName,
                    userId,
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

    removeJob = async (repeatJobKey: string, newStatus: string = "cancelled") => {
        try {
            const job = await this.queue.removeJobScheduler(repeatJobKey)
            if (job) {
                const transaction = await MainController.inactiveTransaction(repeatJobKey, newStatus)
                return transaction;
            }

            throw "Job not found"

        } catch (error: any) {
            throw error.toString()
        }
    }

    updateJob = async (repeatJobKey: string, jobName: string, jobTime: WeeklyQueueTitleType): Promise<any> => {
        try {
            // const job = await this.queue.getJobScheduler(repeatJobKey)
            const job = await this.queue.removeJobScheduler(repeatJobKey)
            if (job) {
                const transaction = await MainController.inactiveTransaction(repeatJobKey, "cancelled")

                const newTransaction = await this.createJobs({
                    jobId: `${jobName}@${jobTime}@${shortUUID.generate()}${shortUUID.generate()}`,
                    amount: transaction.amount,
                    jobName,
                    jobTime,
                    userId: transaction.userId,
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