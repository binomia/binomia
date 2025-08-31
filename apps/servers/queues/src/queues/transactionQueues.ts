import { Job, JobJson, Queue, Worker } from "bullmq";
import { CancelRequestedTransactionType, CreateBankingTransactionType, CreateQueueedTransactionType, CreateRequestQueueedTransactionType, MonthlyQueueTitleType, PayQueuedRequestedTransactionType, WeeklyQueueTitleType } from "@/types";
import { CRON_JOB_BIWEEKLY_PATTERN, CRON_JOB_MONTHLY_PATTERN, CRON_JOB_WEEKLY_PATTERN, ZERO_ENCRYPTION_KEY } from "@/constants";
import shortUUID from "short-uuid";
import TransactionController from "@/controllers/transactionController";
import MainController from "@/controllers/mainController";
import { connection } from "@/redis";
import { AES } from "cryptografia";
import { BullMQOtel } from "bullmq-otel"


export default class TransactionsQueue {
    queue: Queue;
    constructor() {
        this.queue = new Queue("transactions", {

            connection,
            telemetry: new BullMQOtel("queue-server-transactions")
        });

        this.workers()
    }

    private executeJob = async (job: JobJson) => {
        try {
            switch (true) {
                case job.name.includes("queueTransaction"): {
                    const decryptedData = await AES.decrypt(JSON.parse(job.data), ZERO_ENCRYPTION_KEY)
                    const data: CreateQueueedTransactionType = JSON.parse(decryptedData)

                    await TransactionController.createQueuedTransaction(data)
                    console.log(`Job ${job.id} completed:`, job.name.split("@")[0]);
                    break;
                }
                case job.name.includes("queueRequestTransaction"): {
                    const decryptedData = await AES.decrypt(JSON.parse(job.data), ZERO_ENCRYPTION_KEY)
                    const data: CreateRequestQueueedTransactionType = JSON.parse(decryptedData)

                    await TransactionController.createRequestQueueedTransaction(data)
                    console.log(`Job ${job.id} completed:`, job.name.split("@")[0]);
                    break;
                }
                case job.name.includes("pendingTransaction"): {
                    const status = await TransactionController.pendingTransaction(job)
                    if (status === "completed")
                        if (job.repeatJobKey)
                            this.removeJob(job.repeatJobKey, "completed")
                    break;
                }
                case job.name.includes("payRequestTransaction"): {
                    const data: PayQueuedRequestedTransactionType = JSON.parse(job.data)
                    await TransactionController.payRequestTransaction(data)
                    break
                }
                case job.name.includes("cancelRequestedTransaction"): {
                    const data: CancelRequestedTransactionType = JSON.parse(job.data)
                    await TransactionController.cancelRequestedTransaction(data)
                    break
                }
                case job.name.includes("trainTransactionFraudDetectionModel"): {
                    await TransactionController.trainTransactionFraudDetectionModel(job)
                    break;
                }
                case job.name.includes("createBankingTransaction"): {
                    await TransactionController.createBankingTransaction(JSON.parse(job.data))
                    break;
                }
                default: {
                    await TransactionController.prosessQueuedTransaction(job)
                    break;
                }
            }

        } catch (error) {
            console.log({ executeJob: error });
        }
    }

    private workers = async () => {
        const worker = new Worker('transactions', async (job) => this.executeJob(job.asJSON()), {
            connection,
            removeOnComplete: {
                age: 20
            },
            settings: {
                backoffStrategy: (attemptsMade: number) => attemptsMade * 1000
            },
        });

        worker.on('completed', async (job: Job) => {
            try {
                await job.remove()

            } catch (error) {
                console.log({ completed: error });
            }
        })
    }

    createJobs = async ({ jobId, referenceData, jobName, jobTime, amount, userId, data }: { jobId: string, referenceData: any, userId: number, amount: number, jobName: string, jobTime: string, data: any }) => {
        try {
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
                        referenceData
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
                        data,
                        referenceData
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
                        data,
                        referenceData
                    }))

                    return transaction
                }
                case "pendingTransaction": {
                    const time = 1000 * 60 * 30
                    await this.queue.add(jobId, data, {
                        jobId,
                        repeatJobKey: jobId,
                        delay: time,
                        repeat: { every: time, },
                        removeOnComplete: {
                            age: 60 * 30
                        },
                        removeOnFail: {
                            age: 60 * 30
                        },
                    });
                    break;
                }
                case "queueTransaction":
                case "trainTransactionFraudDetectionModel":
                case "queueRequestTransaction": {
                    const job = await this.queue.add(jobId, data, {
                        jobId,
                        removeOnComplete: {
                            age: 30
                        },
                        removeOnFail: {
                            age: 60 * 10
                        }
                    });
                    return job.asJSON()
                }
                default: {
                    return
                }
            }
        } catch (error) {
            console.log({ createJobs: error });
        }
    }

    addJob = async (jobName: string, data: string, pattern: string) => {
        const job = await this.queue.upsertJobScheduler(jobName, { tz: "EST", pattern }, { data });
        return job
    }

    removeJob = async (repeatJobKey: string, newStatus: string = "cancelled") => {
        try {
            const job = await this.queue.removeJobScheduler(repeatJobKey)
            if (!job)
                throw "Job not found"

            const transaction = await MainController.inactiveTransaction(repeatJobKey, newStatus)
            return transaction;

        } catch (error: any) {
            throw error.toString()
        }
    }

    updateTransactionJob = async (repeatJobKey: string, jobName: string, jobTime: WeeklyQueueTitleType): Promise<any> => {
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