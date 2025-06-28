import { Job, Queue, Worker } from "bullmq";
import { MonthlyQueueTitleType, WeeklyQueueTitleType } from "@/types";
import { CRON_JOB_BIWEEKLY_PATTERN, CRON_JOB_MONTHLY_PATTERN, CRON_JOB_WEEKLY_PATTERN } from "@/constants";
import shortUUID from "short-uuid";
import TopUpController from "@/controllers/topUpController";
import MainController from "@/controllers/mainController";
import { redis } from "@/redis";


export default class TopUpQueue {
    queue: Queue;

    constructor() {
        this.queue = new Queue("topups", { connection: { host: "redis", port: 6379 } });
        // this.workers()
    }

    private executeJob = async (job: Job) => {
        try {
            const name = job.name.split("@")[0]
            switch (name) {
                case "queueTopUp": {
                    await TopUpController.createTopUp(job.asJSON())                
                    break;
                }
                case "pendingTopUp": {
                    await TopUpController.pendingTopUp(job.asJSON())
                    break;
                }
                default: {
                    await TopUpController.prosessTopUp(job.asJSON())
                    break;
                }
            }

        } catch (error) {
            console.log({ executeJob: error });
        }
    }

    private workers = async () => {
        const worker = new Worker('topups', async (job) => this.executeJob(job), {
            connection: { host: "redis", port: 6379 },
            settings: {
                backoffStrategy: (attemptsMade: number) => attemptsMade * 1000
            }
        });

        worker.on('completed', async (job: Job) => {
            try {
                const name = job.name.split("@")[0]
                if (name === "pendingTopUp" && job.repeatJobKey)
                    await this.removeJob(job?.repeatJobKey)
                else
                    await job.remove()

                console.log(`Job ${job.id} completed:`);

            } catch (error: any) {
                console.log({ queueTopUp: error });

            }
        })
    }

    createJobs = async ({ jobId, jobName, jobTime, data }: { jobId: string, jobName: string, jobTime: string, data: string }) => {
        switch (jobName) {
            case "weekly": {
                await this.addJob(jobId, data, CRON_JOB_WEEKLY_PATTERN[jobTime as WeeklyQueueTitleType]);
                break;
            }
            case "biweekly": {
                await this.addJob(jobId, data, CRON_JOB_BIWEEKLY_PATTERN);
                break;
            }
            case "monthly": {
                await this.addJob(jobId, data, CRON_JOB_MONTHLY_PATTERN[jobTime as MonthlyQueueTitleType]);
                break;
            }
            case "pendingTopUp": {
                const time = 1000 * 60 * 30 // 30 minutes
                await this.queue.add(jobId, data, { delay: time, repeat: { every: time }, jobId, removeOnComplete: true });
                break;
            }
            case "queueTopUp": {
                await this.queue.add(`${jobName}@${jobTime}@${shortUUID.generate()}${shortUUID.generate()}`, data, {
                    jobId,
                    removeOnComplete: true
                });
                break
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
                jobName,
                jobTime,
                data: queue.data,
            })

            return newJob;

        } catch (error: any) {
            throw error.toString()
        }
    }
}