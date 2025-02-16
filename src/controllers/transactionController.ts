import { TransactionJoiSchema } from "@/auth/transactionJoiSchema"
import { NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL, QUEUE_JOBS_NAME, REDIS_SUBSCRIPTION_CHANNEL, ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from "@/constants"
import { FORMAT_CURRENCY, MAKE_FULL_NAME_SHORTEN } from "@/helpers"
import { Cryptography } from "@/helpers/cryptography"
import { AccountModel, QueuesModel, SessionModel, TransactionsModel, UsersModel } from "@/models"
import { transactionsQueue } from "@/queues"
import { redis } from "@/redis"
import { notificationServer } from "@/rpc/clients/notificationRPC"
import { CreateTransactionType } from "@/types"
import { Job, JobJson } from "bullmq"
import { Op } from "sequelize"
import shortUUID from "short-uuid"


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

    static createQueuedTransaction = async (job: JobJson) => {
        try {
            const { senderUsername, receiverUsername, recurrenceData, amount, transactionType, currency, location } = JSON.parse(job.data)
            const senderAccount = await AccountModel.findOne({
                where: { username: senderUsername },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                        attributes: { exclude: ['createdAt', 'dniNumber', 'updatedAt', 'faceVideoUrl', 'idBackUrl', 'idFrontUrl', 'profileImageUrl', 'password'] },
                    }
                ]
            })

            if (!senderAccount)
                throw "Sender account not found";

            const receiverAccount = await AccountModel.findOne({
                attributes: { exclude: ['username'] },
                where: {
                    username: receiverUsername
                },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                        attributes: { exclude: ['createdAt', 'dniNumber', 'updatedAt', 'faceVideoUrl', 'idBackUrl', 'idFrontUrl', 'password'] }
                    }
                ]
            })

            if (!receiverAccount)
                throw "Receiver account not found";


            const hash = await Cryptography.hash(JSON.stringify({
                hash: {
                    sender: senderUsername,
                    receiver: receiverUsername,
                    amount,
                    transactionType,
                    currency,
                    location
                },
                ZERO_ENCRYPTION_KEY,
                ZERO_SIGN_PRIVATE_KEY,
            }))

            const senderAccountJSON = senderAccount.toJSON();
            if (senderAccountJSON.balance < amount)
                throw "insufficient balance";

            if (!senderAccountJSON.allowSend)
                throw "sender account is not allowed to send money";


            if (!senderAccountJSON.allowReceive)
                throw "receiver account is not allowed to receive money";


            const signature = await Cryptography.sign(hash, ZERO_SIGN_PRIVATE_KEY)
            const transaction = await TransactionsModel.create({
                fromAccount: senderAccountJSON.id,
                toAccount: receiverAccount.toJSON().id,
                senderFullName: senderAccountJSON.user.fullName,
                receiverFullName: receiverAccount.toJSON().user.fullName,
                amount,
                deliveredAmount: amount,
                transactionType,
                currency,
                location,
                signature
            })


            const newSenderBalance = Number(senderAccount.toJSON().balance - amount).toFixed(4)
            await senderAccount.update({
                balance: Number(newSenderBalance)
            })

            const newReceiverBalance = Number(receiverAccount.toJSON().balance + amount).toFixed(4)
            await receiverAccount.update({
                balance: Number(newReceiverBalance)
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

            const encryptedData = await Cryptography.encrypt(JSON.stringify({ transactionId: transactionData.toJSON().transactionId }));
            await Promise.all([
                redis.publish(NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL.NOTIFICATION_TRANSACTION_CREATED, JSON.stringify({
                    data: transactionData.toJSON(),
                    senderSocketRoom: senderAccount.toJSON().user.username,
                    recipientSocketRoom: receiverAccount.toJSON().user.username
                })),

                transactionsQueue.createJobs({
                    jobId: `pendingTransaction@${shortUUID.generate()}${shortUUID.generate()}`,
                    jobName: "pendingTransaction",
                    jobTime: "everyThirtyMinutes",
                    referenceData: null,
                    userId: senderAccount.toJSON().user.id,
                    amount: amount,
                    data: encryptedData,
                })
            ])

            if (recurrenceData.time !== "oneTime") {
                const recurrenceQueueData = Object.assign(transactionData.toJSON(), {
                    amount,
                    receiver: receiverUsername,
                    sender: senderAccount.toJSON().username
                })

                const encryptedData = await Cryptography.encrypt(JSON.stringify(recurrenceQueueData));
                transactionsQueue.createJobs({
                    jobId: `${recurrenceData.title}@${recurrenceData.time}@${shortUUID.generate()}${shortUUID.generate()}`,
                    userId: senderAccount.toJSON().user.id,
                    jobName: recurrenceData.title,
                    jobTime: recurrenceData.time,
                    amount: amount,
                    data: encryptedData,
                    referenceData: {
                        fullName: receiverAccount.toJSON().user.fullName,
                        logo: receiverAccount.toJSON().user.profileImageUrl,
                    }
                })
            }

            const receiverSession = await SessionModel.findAll({
                attributes: ["expoNotificationToken"],
                where: {
                    [Op.and]: [
                        { userId: receiverAccount.toJSON().user.id },
                        { verified: true },
                        {
                            expires: {
                                [Op.gt]: Date.now()
                            }
                        },
                        {
                            expoNotificationToken: {
                                [Op.not]: null
                            }
                        }
                    ]
                }
            })

            const expoNotificationTokens: { token: string, message: string }[] = receiverSession.map(obj => ({ token: obj.dataValues.expoNotificationToken, message: `${MAKE_FULL_NAME_SHORTEN(receiverAccount.toJSON().user.fullName)} te ha enviado ${FORMAT_CURRENCY(amount)} pesos` }));
            await notificationServer("newTransactionNotification", {
                data: expoNotificationTokens
            })

            return transaction.toJSON();

        } catch (error: any) {
            throw error.toString()
        }
    }

    static createRequestQueueedTransaction = async (job: JobJson) => {
        try {
            const { senderUsername, signature, transactionId, receiverUsername, amount, transactionType, currency, location } = JSON.parse(job.data)

            const senderAccount = await AccountModel.findOne({
                where: { username: senderUsername },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                    }
                ]
            })

            if (!senderAccount)
                throw "sender account not found"

            const receiverAccount = await AccountModel.findOne({
                where: {
                    [Op.and]: [
                        { username: receiverUsername },
                        { allowRequestMe: true }
                    ]
                },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                        attributes: { exclude: ['createdAt', 'dniNumber', 'updatedAt', 'faceVideoUrl', 'idBackUrl', 'idFrontUrl', 'profileImageUrl', 'password'] }
                    }
                ]
            })

            if (!receiverAccount)
                throw "receiver account not found"


            if (!senderAccount.toJSON().allowRequestMe)
                throw `${receiverAccount.toJSON().username} account does not receive request payment`

            const message = `${receiverAccount.toJSON().username}&${senderAccount.toJSON().username}@${amount}@${ZERO_ENCRYPTION_KEY}&${ZERO_SIGN_PRIVATE_KEY}`
            const verify = await Cryptography.verify(message, signature, ZERO_SIGN_PRIVATE_KEY)


            if (!verify)
                throw "Transaction signature verification failed"

            // TODO: Authorization NOT IMPLEMENTED

            const transaction = await TransactionsModel.create({
                transactionId,
                senderFullName: senderAccount.toJSON().user.fullName,
                receiverFullName: receiverAccount.toJSON().user.fullName,
                fromAccount: senderAccount.toJSON().id,
                toAccount: receiverAccount.toJSON().id,
                amount: amount,
                deliveredAmount: amount,
                transactionType: transactionType,
                currency: currency,
                location: location,
                status: "requested",
                signature
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

            const receiverSession = await SessionModel.findAll({
                attributes: ["expoNotificationToken"],
                where: {
                    [Op.and]: [
                        { userId: receiverAccount.toJSON().user.id },
                        { verified: true },
                        {
                            expires: {
                                [Op.gt]: Date.now()
                            }
                        },
                        {
                            expoNotificationToken: {
                                [Op.not]: null
                            }
                        }
                    ]
                }
            })

            const expoNotificationTokens: { token: string, message: string }[] = receiverSession.map(obj => ({ token: obj.dataValues.expoNotificationToken, message: `${MAKE_FULL_NAME_SHORTEN(receiverAccount.toJSON().user.fullName)} te ha solicitado ${FORMAT_CURRENCY(amount)} pesos` }));
            await notificationServer("newTransactionNotification", {
                data: expoNotificationTokens
            })

            await redis.publish(NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL.NOTIFICATION_QUEUE_TRANSACTION_CREATED, JSON.stringify({
                data: transactionData.toJSON(),
                senderSocketRoom: senderAccount.toJSON().user.username,
                recipientSocketRoom: receiverAccount.toJSON().user.username,
            }))

            return transactionData.toJSON().transactionId

        } catch (error: any) {
            throw error.message
        }
    }

    static cancelRequestedTransaction = async ({ transactionId, fromAccount, senderUsername }: { transactionId: string, fromAccount: number, senderUsername: string }) => {
        try {

            const transaction = await TransactionsModel.findOne({
                where: {
                    [Op.and]: [
                        { transactionId },
                        { transactionType: "request" },
                        { fromAccount }
                    ]
                },
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

            if (!transaction)
                throw "transaction not found"

            if (transaction.toJSON().status === "cancelled") {
                await notificationServer("requestNotificationConfirmation", {
                    data: transaction.toJSON(),
                    channel: NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL.NOTIFICATION_TRANSACTION_REQUEST_CANCELED,
                    senderSocketRoom: senderUsername,
                    recipientSocketRoom: transaction.toJSON().to.user.username,
                })

                return transaction.toJSON()
            }

            await transaction.update({ status: "cancelled" })
            await notificationServer("requestNotificationConfirmation", {
                data: (await transaction.reload()).toJSON(),
                channel: NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL.NOTIFICATION_TRANSACTION_REQUEST_CANCELED,
                senderSocketRoom: senderUsername,
                recipientSocketRoom: transaction.toJSON().to.user.username,
            })

            return transaction.toJSON()

        } catch (error: any) {
            throw error.message
        }
    }

    static payRequestTransaction = async ({ transactionId, toAccount, paymentApproved }: { transactionId: string, toAccount: number, paymentApproved: boolean }) => {
        try {

            const transaction = await TransactionsModel.findOne({
                where: {
                    [Op.and]: [
                        { transactionId },
                        { status: "requested" },
                        { transactionType: "request" },
                        { toAccount }
                    ]
                },
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

            if (!transaction)
                throw "transaction not found"


            const senderAccount = await AccountModel.findOne({
                where: { id: transaction.toJSON().toAccount },
                include: [
                    {
                        model: UsersModel,
                        as: 'user'
                    }
                ]
            })

            if (!senderAccount)
                throw "sender account not found";


            if (senderAccount.toJSON().balance < transaction.toJSON().amount)
                throw "no tiene suficiente saldo para realizar esta transacción";

            const receiverAccount = await AccountModel.findOne({
                where: {
                    id: transaction.toJSON().fromAccount
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


            if (!paymentApproved) {
                await transaction.update({
                    status: "cancelled"
                })

                await notificationServer("requestNotificationConfirmation", {
                    data: transaction.toJSON(),
                    channel: NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL.NOTIFICATION_TRANSACTION_REQUEST_CANCELED,
                    senderSocketRoom: senderAccount.toJSON().user.username,
                    recipientSocketRoom: receiverAccount.toJSON().user.username
                })

                const transactionData = await transaction.reload()
                return transactionData.toJSON()

            } else {
                const message = `${senderAccount.toJSON().username}&${receiverAccount.toJSON().username}@${transaction.toJSON().amount}@${ZERO_ENCRYPTION_KEY}&${ZERO_SIGN_PRIVATE_KEY}`

                // [TODO] Verify signature
                const verify = await Cryptography.verify(message, transaction.toJSON().signature, ZERO_SIGN_PRIVATE_KEY)
                if (!verify)
                    throw "error verificando transacción"


                const newSenderBalance = Number(senderAccount.toJSON().balance) - Number(transaction.toJSON().amount)
                await senderAccount.update({
                    balance: Number(newSenderBalance.toFixed(4))
                })

                const newReceiverBalance = Number(receiverAccount.toJSON().balance) + Number(transaction.toJSON().amount)
                await receiverAccount.update({
                    balance: Number(newReceiverBalance.toFixed(4))
                })

                await transaction.update({
                    status: "pending",
                })

                const transactionData = await transaction.reload()
                await Promise.all([
                    notificationServer("requestNotificationConfirmation", {
                        data: transaction.toJSON(),
                        channel: NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL.NOTIFICATION_TRANSACTION_REQUEST_PAIED,
                        senderSocketRoom: senderAccount.toJSON().user.username,
                        recipientSocketRoom: receiverAccount.toJSON().user.username
                    }),
                    transactionsQueue.createJobs({
                        jobId: `pendingTransaction@${shortUUID.generate()}${shortUUID.generate()}`,
                        referenceData: null,
                        jobName: "pendingTransaction",
                        jobTime: "everyThirtyMinutes",
                        amount: transactionData.toJSON().amount,
                        userId: senderAccount.toJSON().id,
                        data: { transactionId: transactionData.toJSON().transactionId }
                    })                  
                ])

                return transactionData.toJSON()
            }

        } catch (error: any) {
            throw error.message
        }
    }


    static listenToRedisEvent = async ({ channel, payload }: { channel: string, payload: string }) => {
        switch (channel) {
            case QUEUE_JOBS_NAME.CREATE_TRANSACTION:
            case QUEUE_JOBS_NAME.PENDING_TRANSACTION: {
                const { jobName, jobTime, jobId, referenceData, amount, userId, data } = JSON.parse(payload);

                await transactionsQueue.createJobs({ jobId, referenceData, jobName, jobTime, amount, userId, data });
                break;
            }
            case QUEUE_JOBS_NAME.REMOVE_TRANSACTION_FROM_QUEUE: {
                const { jobId } = JSON.parse(payload);
                console.log("REMOVE_TRANSACTION_FROM_QUEUE:", jobId);

                await transactionsQueue.removeJob(jobId);
                break;
            }
            case QUEUE_JOBS_NAME.QUEUE_REQUEST_TRANSACTION:
            case QUEUE_JOBS_NAME.QUEUE_TRANSACTION: {
                const { jobId, jobName, userId, jobTime, data, amount } = JSON.parse(payload);

                await transactionsQueue.createJobs({
                    jobId,
                    jobName,
                    jobTime,
                    referenceData: null,
                    amount,
                    userId,
                    data: JSON.parse(data)
                });
                break;
            }

            default: {
                break;
            }
        }
    }
}