import { Job, JobJson, Queue, Worker } from "bullmq";
import { MonthlyQueueTitleType, WeeklyQueueTitleType } from "@/types";
import { CRON_JOB_BIWEEKLY_PATTERN, CRON_JOB_MONTHLY_PATTERN, CRON_JOB_WEEKLY_PATTERN } from "@/constants";
import shortUUID from "short-uuid";
import TopUpController from "@/controllers/topUpController";
import MainController from "@/controllers/mainController";


export default class TopUpQueue {
    queue: Queue;

    constructor() {
        this.queue = new Queue("topups", { connection: { host: "redis", port: 6379 } });
        this.workers()
    }

    private executeJob = async (job: JobJson) => {
        try {
            const name = job.name.split("@")[0]
            switch (name) {
                case "queueTopUp": {
                    await TopUpController.createTopUp(job)
                    console.log(`Job ${job.id} completed:`);
                    break;
                }
                case "pendingTopUp": {
                    const status = await TopUpController.pendingTopUp(job)
                    if (status === "completed")
                        if (job.repeatJobKey)
                            this.removeJob(job.repeatJobKey, "completed")
                    break;
                }
                default: {
                    await TopUpController.prosessTopUp(job)
                    break;
                }
            }

        } catch (error) {
            console.log({ executeJob: error });
        }
    }

    private workers = async () => {
        const worker = new Worker('topups', async (job) => this.executeJob(job.asJSON()), {
            connection: { host: "redis", port: 6379 },
            settings: {
                backoffStrategy: (attemptsMade: number) => attemptsMade * 1000
            }
        });

        worker.on('completed', (job: Job) => {
            const name = job.name.split("@")[0]
            console.log('Job completed', job.id);
            if (name === "queueTopUp")
                job.remove()
        })
    }

    createJobs = async ({ jobId, jobName, referenceData, jobTime, amount, userId, data }: { jobId: string, referenceData: any, userId: number, amount: number, jobName: string, jobTime: string, data: string }) => {
        switch (jobName) {
            case "weekly": {
                const job = await this.addJob(jobId, data, CRON_JOB_WEEKLY_PATTERN[jobTime as WeeklyQueueTitleType]);
                const transaction = await MainController.createQueue(Object.assign(job.asJSON(), {
                    queueType: "topup",
                    jobTime,
                    jobName,
                    userId,
                    amount,
                    data,
                    referenceData
                }))

                return transaction
            }
            case "biweekly": {
                const job = await this.addJob(jobId, data, CRON_JOB_BIWEEKLY_PATTERN);
                const transaction = await MainController.createQueue(Object.assign(job.asJSON(), {
                    queueType: "topup",
                    jobTime,
                    jobName,
                    userId,
                    amount,
                    data,
                    referenceData
                }))

                return transaction
            }
            case "monthly": {
                const job = await this.addJob(jobId, data, CRON_JOB_MONTHLY_PATTERN[jobTime as MonthlyQueueTitleType]);
                const transaction = await MainController.createQueue(Object.assign(job.asJSON(), {
                    queueType: "topup",
                    jobTime,
                    jobName,
                    userId,
                    amount,
                    data,
                    referenceData
                }))

                return transaction
            }
            case "pendingTopUp": {
                const time = 1000 * 60 * 30 // 30 minutes
                await this.queue.add(jobId, data, { delay: time, repeat: { every: time }, jobId });
                break;
            }
            case "queueTopUp": {
                const job = await this.queue.add(`${jobName}@${jobTime}@${shortUUID.generate()}${shortUUID.generate()}`, data, {
                    jobId,
                    removeOnComplete: {
                        age: 1000 * 60 * 30 // 30 minutes
                    },
                    removeOnFail: {
                        age: 1000 * 60 * 60 * 24 // 24 hours
                    }
                });
                return job.asJSON()
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

    updateTopUpJob = async (repeatJobKey: string, jobName: string, jobTime: WeeklyQueueTitleType): Promise<any> => {
        try {
            const job = await this.queue.removeJobScheduler(repeatJobKey)

            if (!job)
                throw "error removing job"

            const queue = await MainController.inactiveTransaction(repeatJobKey, "cancelled")

            const newJob = await this.createJobs({
                jobId: `${jobName}@${jobTime}@${shortUUID.generate()}${shortUUID.generate()}`,
                amount: queue.amount,
                jobName,
                jobTime,
                userId: queue.userId,
                data: queue.data,
                referenceData: queue.referenceData
            })

            return newJob;

        } catch (error: any) {
            throw error.toString()
        }
    }
}