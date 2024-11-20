import { Job, Queue, Worker } from "bullmq";
import { WeeklyQueueTitleType } from "@/types";
import { getNextDay } from "@/helpers";
import { RecurrenceTransactionsController } from "@/controllers/recurrenceTransactionsController";
import { Cryptography } from "@/helpers/cryptography";


export default class TransactionsQueue {
    queue: Queue;

    constructor() {
        this.queue = new Queue("transactions", { connection: { host: "redis", port: 6379 } });
        this.workers()
    }

    createJobs = async ({ jobId, jobName, jobTime, accountId, data }: { jobId: string, jobName: string, jobTime: WeeklyQueueTitleType, accountId: number, data: string }) => {
        switch (jobName) {
            case "weekly": {
                const delay = getNextDay(jobTime)
                const every = 1000 * 60 * 60 * 24 * 7 // 7 days

                const job = await this.add(jobId, data, delay, every);
                await RecurrenceTransactionsController.createTransaction(Object.assign(job.asJSON(), {
                    accountId,
                    data
                }))
                return job
            }
            default: {
                const job = await this.add(jobId, data, 50 * 1000, 15 * 1000);
                await RecurrenceTransactionsController.createTransaction(Object.assign(job.asJSON(), {
                    accountId,
                    data
                }))

                return job;
            }
        }
    }

    private workers = async () => {
        const worker = new Worker('transactions', async (job) => await RecurrenceTransactionsController.prosessTransaction(job), {
            connection: { host: "redis", port: 6379 },
            settings: {
                backoffStrategy: (attemptsMade: number) => attemptsMade * 1000
            }
        });

        worker.on('completed', (job: Job) => {
            console.log('Job completed', job.repeatJobKey);
        })
    }

    add = async (jobName: string, data: string, delay: number = 0, every: number = 0) => {
        const job = await this.queue.add(jobName, data, { delay, repeat: { every } })
        return job
    }

    removeJob = async (repeatJobKey: string) => {
        try {
            const job = await this.queue.removeJobScheduler(repeatJobKey)
            if (job) {
                const transaction = await RecurrenceTransactionsController.inactiveTransaction(repeatJobKey)
                return transaction;
            }

            throw `Job ${repeatJobKey}: not found.`

        } catch (error) {
            throw error
        }
    }
}