import { TransactionJoiSchema } from "@/auth/transactionJoiSchema"
import { QUEUE_JOBS_NAME, REDIS_SUBSCRIPTION_CHANNEL, ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from "@/constants"
import { Cryptography } from "@/helpers/cryptography"
import { AccountModel, QueuesModel, TransactionsModel, UsersModel } from "@/models"
import { transactionsQueue } from "@/queues"
import { redis } from "@/redis"
import { CreateTransactionType } from "@/types"
import { Job, JobJson } from "bullmq"
import { Op } from "sequelize"


export default class TransactionController {
    static createTransaction = async (data: CreateTransactionType) => {
        try {
            const validatedData = await TransactionJoiSchema.createTransaction.parseAsync(data)
            const senderAccount = await AccountModel.findOne({
                where: { username: validatedData.sender },
                include: [
                    {
                        model: UsersModel,
                        as: 'user'
                    }
                ]
            })

            if (!senderAccount)
                throw "sender account not found";

            const receiverAccount = await AccountModel.findOne({
                where: {
                    username: validatedData.receiver
                },
                include: [
                    {
                        model: UsersModel,
                        as: 'user'
                    }
                ]
            })

            if (!receiverAccount)
                throw "receiver account not found";

            const hash = await Cryptography.hash(JSON.stringify({
                ZERO_ENCRYPTION_KEY,
                ZERO_SIGN_PRIVATE_KEY,
                hash: {
                    receiverUsername: validatedData.receiver,
                    receiver: validatedData.receiver,
                    amount: validatedData.amount,
                    transactionType: validatedData.transactionType,
                    currency: validatedData.currency,
                    location: validatedData.location
                }
            }))


            const signature = await Cryptography.sign(hash, ZERO_SIGN_PRIVATE_KEY)
            const transaction = await TransactionsModel.create({
                fromAccount: senderAccount.toJSON().id,
                toAccount: receiverAccount.toJSON().id,
                amount: validatedData.amount,
                deliveredAmount: validatedData.amount,
                transactionType: validatedData.transactionType,
                currency: validatedData.currency,
                location: validatedData.location,
                signature
            })

            await senderAccount.update({
                balance: senderAccount.toJSON().balance - validatedData.amount
            })

            await receiverAccount.update({
                balance: receiverAccount.toJSON().balance + validatedData.amount
            })

            const transactionData = await transaction.reload({
                include: [
                    {
                        model: AccountModel,
                        as: 'from',
                        include: [{
                            model: UsersModel,
                            as: 'user',
                        }]
                    },
                    {
                        model: AccountModel,
                        as: 'to',
                        include: [{
                            model: UsersModel,
                            as: 'user',
                        }]
                    }
                ]
            })

            await Promise.all([
                redis.publish(REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED, JSON.stringify({
                    data: transactionData.toJSON(),
                    senderSocketRoom: senderAccount.toJSON().username,
                    recipientSocketRoom: receiverAccount.toJSON().username
                })),
                redis.publish(REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED_FROM_QUEUE, JSON.stringify({
                    data: transactionData.toJSON(),
                    senderSocketRoom: senderAccount.toJSON().username,
                    recipientSocketRoom: receiverAccount.toJSON().username,
                }))
            ])

            return transactionData.toJSON()

        } catch (error: any) {
            throw error.message
        }
    }

    static updateTransactionStatus = async (job: Job) => {
        try {
            const decryptedData = await Cryptography.decrypt(job.data)
            const { transactionId } = JSON.parse(decryptedData)

            const transaction = await TransactionsModel.findOne({
                where: { transactionId }
            })

            if (!transaction)
                throw "transaction not found";

            if (transaction.toJSON().status !== "completed") {
                const updatedTransaction = await transaction.update({ status: "completed" })
                return updatedTransaction.toJSON()
            }

            return transaction.toJSON()

        } catch (error: any) {
            throw error.message
        }
    }

    static prosessTransaction = async ({ repeatJobKey }: JobJson): Promise<string> => {
        try {
            const queueTransaction = await QueuesModel.findOne({
                where: {
                    [Op.and]: [
                        { repeatJobKey },
                        { status: "active" }
                    ]
                }
            })

            if (!queueTransaction)
                throw "transaction not found";

            if (queueTransaction.toJSON().jobName === "pendingTransaction") {
                // [TODO]: implement pending transaction
                const isTrue = true
                if (isTrue) {
                    const decryptedData = await Cryptography.decrypt(queueTransaction.toJSON().data)
                    const { transactionId } = JSON.parse(decryptedData)

                    const transaction = await TransactionsModel.findOne({
                        where: {
                            transactionId
                        }
                    })

                    if (!transaction)
                        throw "transaction not found";

                    await transaction.update({
                        status: "completed"
                    })

                    return "transactionStatusCompleted"
                }

                await queueTransaction.update({
                    repeatedCount: queueTransaction.toJSON().repeatedCount + 1
                })

                return queueTransaction.toJSON().jobName

            } else {
                const { jobId, jobName, jobTime, receiverId, senderId, amount, signature, data } = queueTransaction.toJSON()
                const hash = await Cryptography.hash(JSON.stringify({
                    jobId,
                    receiverId,
                    senderId,
                    amount,
                    repeatJobKey,
                    jobTime,
                    jobName,
                    ZERO_ENCRYPTION_KEY
                }))


                const verify = await Cryptography.verify(hash, signature, ZERO_SIGN_PRIVATE_KEY)
                if (verify) {
                    const decryptedData = await Cryptography.decrypt(data)
                    const validatedData = await TransactionJoiSchema.createTransaction.parseAsync(JSON.parse(decryptedData))

                    await TransactionController.createTransaction(validatedData)
                    await queueTransaction.update({
                        repeatedCount: queueTransaction.toJSON().repeatedCount + 1
                    })
                }

                return "createTransaction"
            }

        } catch (error) {
            console.log({ prosessTransaction: error });
            throw error
        }
    }

    static listenToRedisEvent = async ({ channel, payload }: { channel: string, payload: string }) => {
        switch (channel) {
            case QUEUE_JOBS_NAME.CREATE_TRANSACTION:
            case QUEUE_JOBS_NAME.PENDING_TRANSACTION: {
                const { jobName, jobTime, jobId,referenceData, amount, userId, data } = JSON.parse(payload);
                const encryptedData = await Cryptography.encrypt(JSON.stringify(data));

                await transactionsQueue.createJobs({ jobId, referenceData, jobName, jobTime, amount, userId, data: encryptedData });
                break;
            }
            case QUEUE_JOBS_NAME.REMOVE_TRANSACTION_FROM_QUEUE: {
                const { jobId } = JSON.parse(payload);
                console.log("REMOVE_TRANSACTION_FROM_QUEUE:", jobId);

                await transactionsQueue.removeJob(jobId);
                break;
            }
            
            default: {
                break;
            }
        }
    }
}