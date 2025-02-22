import { TransactionJoiSchema } from "@/auth/transactionJoiSchema"
import { NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL, REDIS_SUBSCRIPTION_CHANNEL, ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from "@/constants"
import { calculateDistance, calculateSpeed, FORMAT_CURRENCY, MAKE_FULL_NAME_SHORTEN } from "@/helpers"
import { Cryptography } from "@/helpers/cryptography"
import { AccountModel, BankingTransactionsModel, CardsModel, QueuesModel, SessionModel, TransactionsModel, UsersModel } from "@/models"
import { transactionsQueue } from "@/queues"
import { anomalyRpcClient } from "@/rpc/clients/anomalyRPC"
import { notificationServer } from "@/rpc/clients/notificationRPC"
import { CreateTransactionRPCParamsType, CreateTransactionType, FraudulentTransactionType } from "@/types"
import { Job, JobJson } from "bullmq"
import { Op } from "sequelize"
import { z } from "zod"
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
                notificationServer("socketEventEmitter", {
                    data: transactionData.toJSON(),
                    channel: REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED,
                    senderSocketRoom: senderAccount.toJSON().username,
                    recipientSocketRoom: receiverAccount.toJSON().username
                }),
                notificationServer("socketEventEmitter", {
                    data: transactionData.toJSON(),
                    channel: REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED_FROM_QUEUE,
                    senderSocketRoom: senderAccount.toJSON().username,
                    recipientSocketRoom: receiverAccount.toJSON().username
                })
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

    static prosessQueuedTransaction = async ({ repeatJobKey }: JobJson): Promise<string> => {
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

            const { jobName, jobTime, amount, signature, data } = queueTransaction.toJSON()
            const hash = await Cryptography.hash(JSON.stringify({
                jobTime,
                jobName,
                amount,
                repeatJobKey,
                ZERO_ENCRYPTION_KEY
            }))

            const verify = await Cryptography.verify(hash, signature, ZERO_SIGN_PRIVATE_KEY)
            if (verify) {
                const decryptedData = await Cryptography.decrypt(data)
                await TransactionController.createQueuedTransaction(JSON.parse(decryptedData))

                await queueTransaction.update({
                    repeatedCount: queueTransaction.toJSON().repeatedCount + 1
                })
            }

            return "pending"


        } catch (error) {
            console.log({ prosessTransaction: error });
            throw error
        }
    }

    static pendingTransaction = async ({ data }: JobJson): Promise<string> => {
        try {
            // [TODO]: implement pending transaction
            const newStatus = "completed"
            const decryptedData = await Cryptography.decrypt(JSON.parse(data))
            const { transactionId } = JSON.parse(decryptedData)

            const transaction = await TransactionsModel.findOne({
                where: {
                    transactionId
                }
            })

            if (!transaction)
                throw "transaction not found";

            if (newStatus !== transaction.toJSON().status) {
                await transaction.update({
                    status: newStatus
                })
            }

            return newStatus

        } catch (error) {
            console.log({ prosessTransaction: error });
            throw error
        }
    }

    static createQueuedTransaction = async (data: CreateTransactionRPCParamsType) => {
        try {
            const { senderUsername, transactionId, receiverUsername, recurrenceData, amount, transactionType, currency, location } = data
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


            const transactionHistory = await TransactionsModel.findAll({
                limit: 100,
                where: {
                    [Op.and]: [
                        { createdAt: { [Op.gte]: new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 30)) } },
                        { fromAccount: senderAccountJSON.id }
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

            const lastTransaction = transactionHistory[transactionHistory.length - 1]?.toJSON() || null

            const distance = !lastTransaction ? 0 : calculateDistance(
                lastTransaction.location.latitude,
                lastTransaction.location.longitude,
                location.latitude,
                location.longitude
            );

            const timeDifference = !lastTransaction ? 0 : new Date().getTime() - new Date(lastTransaction.createdAt).getTime()
            const speed = calculateSpeed(distance, timeDifference)
            const signature = await Cryptography.sign(hash, ZERO_SIGN_PRIVATE_KEY)

            const newTransactionData = {
                transactionId,
                fromAccount: senderAccountJSON.id,
                toAccount: receiverAccount.toJSON().id,
                senderFullName: senderAccountJSON.user.fullName,
                receiverFullName: receiverAccount.toJSON().user.fullName,
                amount,
                deliveredAmount: amount,
                transactionType,
                currency,
                location,

                signature,
                deviceId: data.deviceId,
                ipAddress: data.ipAddress,
                isRecurring: data.isRecurring,
                platform: data.platform,
                sessionId: data.sessionId,
                previousBalance: senderAccount.toJSON().balance,
                fraudScore: 0,
                speed,
                distance
            }

            const transaction = await TransactionsModel.create(newTransactionData)
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

            const features = await TransactionJoiSchema.transactionFeatures.parseAsync({
                speed: +Number(speed).toFixed(2),
                distance: +Number(distance).toFixed(2),
                amount: +Number(amount).toFixed(2),
                id: +transactionData.toJSON().id,
                transactionType: ["transfer"].indexOf(transactionData.toJSON().transactionType.toLowerCase()),
                platform: ["ios", "android", "web"].indexOf(transactionData.toJSON().platform.toLowerCase()),
                isRecurring: data.isRecurring ? 1 : 0,
            })

            const isSuspicious = await TransactionController.checkForFraudulentTransaction(transactionData.toJSON(), transactionHistory)
            const detectedFraudulentTransaction = await anomalyRpcClient("detect_fraudulent_transaction", {
                features: Object.values(features)
            })


            if (detectedFraudulentTransaction.last_transaction_features)
                await transactionsQueue.createJobs({
                    jobId: `trainTransactionFraudDetectionModel@${shortUUID.generate()}${shortUUID.generate()}`,
                    jobName: "trainTransactionFraudDetectionModel",
                    jobTime: "trainTransactionFraudDetectionModel",
                    referenceData: null,
                    userId: senderAccount.toJSON().user.id,
                    amount: +Number(amount).toFixed(4),
                    data: {
                        last_transaction_features: detectedFraudulentTransaction.last_transaction_features
                    }
                })

            const flaggedTransactionsCount = await TransactionsModel.count({
                where: {
                    [Op.and]: [
                        { fromAccount: senderAccount.toJSON().id },
                        { status: "suspicious" },
                        { createdAt: { [Op.gte]: new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 30)) } } // 30 days
                    ]
                }
            })
            console.log({ detectedFraudulentTransaction, isSuspicious, flaggedTransactionsCount });
            if (isSuspicious || detectedFraudulentTransaction.is_fraud) {
                await Promise.all([
                    senderAccount.update({
                        status: "flagged",
                        blacklisted: flaggedTransactionsCount >= 5
                    }),
                    transaction.update({
                        status: "suspicious",
                        features: detectedFraudulentTransaction.features,
                        fraudScore: detectedFraudulentTransaction.fraud_score
                    })
                ])

                return Object.assign({}, transactionData.toJSON(), {
                    status: "suspicious",
                    features: detectedFraudulentTransaction.features,
                    fraudScore: detectedFraudulentTransaction.fraud_score
                })

            } else {
                await transaction.update({
                    features: detectedFraudulentTransaction.features,
                    fraudScore: detectedFraudulentTransaction.fraud_score
                })


                const newSenderBalance = Number(senderAccount.toJSON().balance - amount).toFixed(4)
                await senderAccount.update({
                    balance: +Number(newSenderBalance).toFixed(4)
                })

                const newReceiverBalance = Number(receiverAccount.toJSON().balance + amount).toFixed(4)
                await receiverAccount.update({
                    balance: +Number(newReceiverBalance).toFixed(4)
                })

                const encryptedData = await Cryptography.encrypt(JSON.stringify({ transactionId: transactionData.toJSON().transactionId }));
                await Promise.all([
                    notificationServer("socketEventEmitter", {
                        data: transactionData.toJSON(),
                        channel: NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL.NOTIFICATION_TRANSACTION_CREATED,
                        senderSocketRoom: senderAccount.toJSON().user.username,
                        recipientSocketRoom: receiverAccount.toJSON().user.username
                    }),
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
                    const recurrenceQueueData = Object.assign(newTransactionData, {
                        transactionId: `${shortUUID.generate()}${shortUUID.generate()}`,
                        recurrenceData: {
                            time: "oneTime",
                            title: "oneTime"
                        },
                        location: {}
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
            }

        } catch (error: any) {
            throw error.toString()
        }
    }

    static createRequestQueueedTransaction = async (data: CreateTransactionRPCParamsType) => {
        try {
            const { senderUsername, signature, transactionId, receiverUsername, amount, transactionType, currency, location } = data
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

            const features = `[[0.0, 0.0, ${Number(amount).toFixed(1)}, ${Number(Date.now()).toFixed(1)}, 0.0, 1.0, 0.0]]`
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
                signature,

                deviceId: data.deviceId,
                ipAddress: data.ipAddress,
                isRecurring: data.isRecurring,
                platform: data.platform,
                sessionId: data.sessionId,
                previousBalance: senderAccount.toJSON().balance,
                fraudScore: 0,
                speed: 0,
                distance: 0,
                features
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

            await Promise.all([
                notificationServer("newTransactionNotification", {
                    data: expoNotificationTokens
                }),
                notificationServer("socketEventEmitter", {
                    data: transactionData.toJSON(),
                    channel: NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL.NOTIFICATION_QUEUE_TRANSACTION_CREATED,
                    senderSocketRoom: senderUsername,
                    recipientSocketRoom: transaction.toJSON().to.user.username,
                })
            ])

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
                await notificationServer("socketEventEmitter", {
                    data: transaction.toJSON(),
                    channel: NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL.NOTIFICATION_TRANSACTION_REQUEST_CANCELED,
                    senderSocketRoom: senderUsername,
                    recipientSocketRoom: transaction.toJSON().to.user.username,
                })

                return transaction.toJSON()
            }

            await transaction.update({ status: "cancelled" })
            await notificationServer("socketEventEmitter", {
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

                await notificationServer("socketEventEmitter", {
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
                    notificationServer("socketEventEmitter", {
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

    static createBankingTransaction = async ({ cardId, accountId, userId, data }: { accountId: number, cardId: number, userId: number, data: any }) => {
        try {
            const validatedData = await TransactionJoiSchema.bankingCreateTransaction.parseAsync(data)
            const account = await AccountModel.findOne({
                where: {
                    id: accountId
                }
            })

            if (!account)
                throw "account not found"

            const card = await CardsModel.findOne({
                where: {
                    [Op.and]: [
                        { userId },
                        { id: cardId }
                    ]
                }
            })

            if (!card)
                throw 'The given card is not linked to the user account'

            const decryptedCardData = await Cryptography.decrypt(card.toJSON().data)
            const cardData = Object.assign({}, card.toJSON(), JSON.parse(decryptedCardData))

            //[TODO]: Need Payment Gateway Integration
            console.error("createBankingTransaction: Need Payment Gateway Integration");

            const hash = await Cryptography.hash(JSON.stringify({
                data: {
                    ...validatedData,
                    deliveredAmount: validatedData.amount,
                    accountId,
                },
                ZERO_ENCRYPTION_KEY,
                ZERO_SIGN_PRIVATE_KEY,
            }))

            const signature = await Cryptography.sign(hash, ZERO_SIGN_PRIVATE_KEY)
            const transaction = await BankingTransactionsModel.create({
                ...validatedData,
                deliveredAmount: validatedData.amount,
                accountId,
                cardId: cardData.id,
                signature,
                data: {}
            })

            const accountData = account.toJSON()
            const newBalance: number = validatedData.transactionType === "deposit" ? accountData.balance + validatedData.amount : accountData.balance - validatedData.amount

            if (!account.toJSON().allowDeposit)
                throw "account is not allowed to deposit"

            await account.update({
                balance: newBalance
            })

            return Object.assign({}, transaction.toJSON(), { card: cardData })

        } catch (error: any) {
            throw error.message
        }
    }

    static checkForFraudulentTransaction = async (transaction: FraudulentTransactionType, transactionHistory: any[]) => {
        try {
            const RAPID_TRANSACTION_TIMEFRAME = 10000; // 10 seconds
            const MAX_RAPID_TRANSACTIONS = 5;
            const MAX_SPEED_THRESHOLD_KMH = 1000;
            const { to, from } = transaction

            // Blacklisted Account Check for receiver account
            if (from.blacklisted || from.status !== 'flagged') {
                console.log(`Fraud Alert: Account ${to.id} is flagged or blacklisted.`);
                return true;
            }

            // Rapid Transactions Check for receiver account
            if (transactionHistory.length > 0) {
                const recentTransactionsFiltered = transactionHistory?.filter((trx) => {
                    const tx: z.infer<typeof TransactionJoiSchema.transaction> = trx.toJSON()

                    return new Date(Number(transaction.createdAt)).getTime() - new Date(Number(tx.createdAt)).getTime() <= RAPID_TRANSACTION_TIMEFRAME

                }) || [];

                if (recentTransactionsFiltered.length >= MAX_RAPID_TRANSACTIONS) {
                    console.log(`Fraud Alert: Too many rapid transactions for account ${to.user.username}.`);
                    return true;
                }
            }


            // Geolocation Mismatch Check
            const suspiciousTravel = transactionHistory?.some((trx) => {
                const tx: z.infer<typeof TransactionJoiSchema.transaction> = trx.toJSON()
                const distanceKm = calculateDistance(
                    tx.location.latitude, tx.location.longitude,
                    transaction.location.latitude, transaction.location.longitude
                );

                const timeDiffMs = new Date(Number(transaction.createdAt)).getTime() - new Date(Number(tx.createdAt)).getTime();
                const speedKmH = calculateSpeed(distanceKm, timeDiffMs);

                return speedKmH > MAX_SPEED_THRESHOLD_KMH;
            });

            if (suspiciousTravel) {
                console.log(`Fraud Alert: Suspicious travel detected for account ${to.user.username}.`);
                return true;
            }

            return false

        } catch (error) {
            return true
        }
    }

    static trainTransactionFraudDetectionModel = async (job: JobJson) => {
        try {
            const data = JSON.parse(job.data)
            const transaction = await TransactionsModel.findOne({
                attributes: ["id", 'features', 'createdAt'],
                where: {
                    features: data.last_transaction_features
                }
            })

            if (!transaction) {
                console.log("Transaction not found");
                return
            }

            const transactions = await TransactionsModel.findAndCountAll({
                attributes: ["id", 'features', "status"],
                order: [["id", "ASC"]],
                where: {
                    [Op.and]: [
                        {
                            createdAt: {
                                [Op.gt]: transaction.toJSON().createdAt
                            }
                        },
                        {
                            status: { [Op.or]: ["completed", "suspicious"] }
                        }
                    ]
                }
            })

            if (transactions.count > 20) {
                const transactionsFeatures = transactions.rows.map((trx) => {
                    if (trx.toJSON().features)
                        return JSON.parse(trx.toJSON().features)
                })

                await anomalyRpcClient("retrain_model", {
                    features: transactionsFeatures
                })
            }

        } catch (error) {
            console.log({ trainTransactionFraudDetectionModel: error });
            throw error
        }
    }
}