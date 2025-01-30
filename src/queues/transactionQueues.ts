import { Job, JobJson, Queue, Worker, KeepJobs } from "bullmq";
import { MonthlyQueueTitleType, WeeklyQueueTitleType } from "@/types";
import shortUUID from "short-uuid";
import { CRON_JOB_BIWEEKLY_PATTERN, CRON_JOB_MONTHLY_PATTERN, CRON_JOB_WEEKLY_PATTERN, QUEUE_JOBS_NAME, REDIS_SUBSCRIPTION_CHANNEL, ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from "@/constants";
import TransactionController from "@/controllers/transactionController";
import MainController from "@/controllers/mainController";
import { AccountModel, SessionModel, TransactionsModel, UsersModel } from "@/models";
import { Cryptography } from "@/helpers/cryptography";
import { Op } from "sequelize";
import { redis } from "@/redis";

export default class TransactionsQueue {
    queue: Queue;
    queueTransaction: Queue;

    constructor() {
        this.queue = new Queue("transactions", { connection: { host: "redis", port: 6379 } });
        this.queueTransaction = new Queue("queueTransactions", { connection: { host: "redis", port: 6379 } });
        this.workers()
        this.queueTransactionWorker()
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
    private executeQueueTransactionJob = async (job: JobJson) => {
        try {
            await TransactionController.createQueuedTransaction(job)
            console.log(`Job ${job.id} completed:`);
            
        } catch (error) {
            console.log({ executeQueueTransactionJob: error });
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

    private queueTransactionWorker = async () => {
        const worker = new Worker('queueTransactions', async (job) => this.executeQueueTransactionJob(job.asJSON()), {
            connection: { host: "redis", port: 6379 },
            concurrency: 50,
            settings: {
                backoffStrategy: (attemptsMade: number) => attemptsMade * 1000
            },
            removeOnComplete: { count: 1 },
        });

        worker.on('completed', (job: Job) => {
            console.log('Job completed', job.repeatJobKey);
        })
    }

    // private createTransaction = async (data: any) => {
    //     try {
    //         const { senderUsername, receiverUsername, recurrenceData, senderFullName, receiverFullName, amount, transactionType, currency, location } = data;

    //         const senderAccount = await AccountModel.findOne({
    //             where: { username: senderUsername },
    //             include: [
    //                 {
    //                     model: UsersModel,
    //                     as: 'user',
    //                     attributes: { exclude: ['createdAt', 'dniNumber', 'updatedAt', 'faceVideoUrl', 'idBackUrl', 'idFrontUrl', 'profileImageUrl', 'password'] },
    //                 }
    //             ]
    //         })

    //         if (!senderAccount)
    //             throw "Sender account not found";

    //         const receiverAccount = await AccountModel.findOne({
    //             attributes: { exclude: ['username'] },
    //             where: {
    //                 username: receiverUsername
    //             },
    //             include: [
    //                 {
    //                     model: UsersModel,
    //                     as: 'user',
    //                     attributes: { exclude: ['createdAt', 'dniNumber', 'updatedAt', 'faceVideoUrl', 'idBackUrl', 'idFrontUrl', 'profileImageUrl', 'password'] }
    //                 }
    //             ]
    //         })

    //         if (!receiverAccount)
    //             throw "Receiver account not found";


    //         const hash = await Cryptography.hash(JSON.stringify({
    //             hash: {
    //                 sender: senderUsername,
    //                 receiver: receiverUsername,
    //                 amount,
    //                 transactionType,
    //                 currency,
    //                 location
    //             },
    //             ZERO_ENCRYPTION_KEY,
    //             ZERO_SIGN_PRIVATE_KEY,
    //         }))

    //         const senderAccountJSON = senderAccount.toJSON();
    //         if (senderAccountJSON.toJSON().balance < amount)
    //             throw "insufficient balance";

    //         if (!senderAccountJSON.toJSON().allowSend)
    //             throw "sender account is not allowed to send money";


    //         if (!senderAccountJSON.toJSON().allowReceive)
    //             throw "receiver account is not allowed to receive money";


    //         const signature = await Cryptography.sign(hash, ZERO_SIGN_PRIVATE_KEY)

    //         const transaction = await TransactionsModel.create({
    //             fromAccount: senderAccountJSON.id,
    //             toAccount: receiverAccount.toJSON().id,
    //             senderFullName,
    //             receiverFullName,
    //             amount,
    //             deliveredAmount: amount,
    //             transactionType,
    //             currency,
    //             location,
    //             signature
    //         })


    //         const newSenderBalance = Number(senderAccount.toJSON().balance - amount).toFixed(4)
    //         await senderAccount.update({
    //             balance: Number(newSenderBalance)
    //         })

    //         const newReceiverBalance = Number(receiverAccount.toJSON().balance + amount).toFixed(4)
    //         await receiverAccount.update({
    //             balance: Number(newReceiverBalance)
    //         })

    //         const transactionData = await transaction.reload({
    //             include: [
    //                 {
    //                     model: AccountModel,
    //                     as: 'from',
    //                     include: [{
    //                         model: UsersModel,
    //                         as: 'user',
    //                     }]
    //                 },
    //                 {
    //                     model: AccountModel,
    //                     as: 'to',
    //                     include: [{
    //                         model: UsersModel,
    //                         as: 'user',
    //                     }]
    //                 }
    //             ]
    //         })

    //         const receiverSession = await SessionModel.findAll({
    //             attributes: ["expoNotificationToken"],
    //             where: {
    //                 [Op.and]: [
    //                     { userId: receiverAccount.toJSON().user.id },
    //                     { verified: true },
    //                     {
    //                         expires: {
    //                             [Op.gt]: Date.now()
    //                         }
    //                     },
    //                     {
    //                         expoNotificationToken: {
    //                             [Op.not]: null
    //                         }
    //                     }
    //                 ]
    //             }
    //         })

    //         // Needs Work
    //         const expoNotificationTokens: string[] = receiverSession.map(obj => obj.dataValues.expoNotificationToken);
    //         const encryptedData = await Cryptography.encrypt(JSON.stringify({ transactionId: transactionData.toJSON().transactionId }));
    //         await Promise.all([
    //             redis.publish(REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED, JSON.stringify({
    //                 data: transactionData.toJSON(),
    //                 senderSocketRoom: senderAccount.toJSON().user.username,
    //                 recipientSocketRoom: receiverAccount.toJSON().user.username,
    //                 expoNotificationTokens,
    //             })),

    //             // redis.publish(QUEUE_JOBS_NAME.PENDING_TRANSACTION, JSON.stringify({
    //             //     jobId: `pendingTransaction@${shortUUID.generate()}${shortUUID.generate()}`,
    //             //     jobName: "pendingTransaction",
    //             //     jobTime: "everyThirtyMinutes",
    //             //     senderId: senderAccount.toJSON().id,
    //             //     receiverId: receiverAccount.toJSON().id,
    //             //     amount: amount,
    //             //     data: { transactionId: transactionData.toJSON().transactionId },
    //             // })),

    //             this.createJobs({
    //                 jobId: `pendingTransaction@${shortUUID.generate()}${shortUUID.generate()}`,
    //                 jobName: "pendingTransaction",
    //                 jobTime: "everyThirtyMinutes",
    //                 referenceData: null,
    //                 userId: senderAccount.toJSON().user.id,
    //                 amount: amount,
    //                 data: encryptedData,
    //             })
    //         ])

    //         if (recurrenceData.time !== "oneTime") {
    //             const recurrenceQueueData = Object.assign(transactionData.toJSON(), {
    //                 amount,
    //                 receiver: receiverUsername,
    //                 sender: senderAccount.toJSON().username
    //             })

    //             // await redis.publish(QUEUE_JOBS_NAME.CREATE_TRANSACTION, JSON.stringify({
    //             //     jobId: `${recurrenceData.title}@${recurrenceData.time}@${shortUUID.generate()}${shortUUID.generate()}`,
    //             //     jobName: recurrenceData.title,
    //             //     jobTime: recurrenceData.time,
    //             //     senderId: senderAccount.toJSON().id,
    //             //     receiverId: receiverAccount.toJSON().id,
    //             //     amount: amount,
    //             //     data: recurrenceQueueData
    //             // }))

    //             const encryptedData = await Cryptography.encrypt(JSON.stringify(recurrenceQueueData));
    //             this.createJobs({
    //                 jobId: `${recurrenceData.title}@${recurrenceData.time}@${shortUUID.generate()}${shortUUID.generate()}`,
    //                 referenceData: null,
    //                 userId: senderAccount.toJSON().user.id,
    //                 jobName: recurrenceData.title,
    //                 jobTime: recurrenceData.time,
    //                 amount: amount,
    //                 data: encryptedData,
    //             })


    //         }


    //         return transaction.toJSON();

    //     } catch (error: any) {
    //         throw error.toString()
    //     }
    // }


    createJobs = async ({ jobId, referenceData, jobName, jobTime, amount, userId, data }: { jobId: string, referenceData: any, userId: number, amount: number, jobName: string, jobTime: string, data: string }) => {
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
                const job = await this.queue.add(jobId, data, { delay: 1000 * 60 * 30, repeat: { every: 1000 * 60 * 30 }, jobId }); // 30 minutes
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
            case "queueTransaction": {
                const job = await this.queueTransaction.add(jobId, data, { removeOnComplete: true, removeOnFail: true });                               
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