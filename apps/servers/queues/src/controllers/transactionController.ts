import { TransactionJoiSchema } from "@/auth/transactionJoiSchema"
import { NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL, REDIS_SUBSCRIPTION_CHANNEL, ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY, ZERO_SIGN_PUBLIC_KEY } from "@/constants"
import { calculateDistance, calculateSpeed, fetchGeoLocation, FORMAT_CURRENCY, insertLadger, MAKE_FULL_NAME_SHORTEN } from "@/helpers"
import { AccountModel, BankingTransactionsModel, QueuesModel, SessionModel, TransactionsModel, UsersModel } from "@/models"
import { transactionsQueue } from "@/queues"
import { anomalyRpcClient } from "@/rpc/clients/anomalyRPC"
import { notificationServer } from "@/rpc/clients/notificationRPC"
import { CancelRequestedTransactionType, CreateBankingTransactionType, CreateRequestQueueedTransactionType, CreateTransactionType, FraudulentTransactionType } from "@/types"
import { Job, JobJson } from "bullmq"
import { Op } from "sequelize"
import shortUUID from "short-uuid"
import { AES, ECC, HASH, RSA } from "cryptografia"

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

            const messageToSign = `${validatedData.receiver}&${senderAccount.toJSON().user.username}@${validatedData.amount}@${ZERO_ENCRYPTION_KEY}`
            const hash = await HASH.sha256Async(messageToSign)

            const signature = await RSA.sign(hash, ZERO_SIGN_PRIVATE_KEY)
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
            const decryptedData = await AES.decryptAsync(job.data, ZERO_ENCRYPTION_KEY)
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
            const hash = await HASH.sha256Async(JSON.stringify({
                jobTime,
                jobName,
                amount,
                repeatJobKey,
                ZERO_ENCRYPTION_KEY
            }))

            const verify = await RSA.verify(hash, signature, ZERO_SIGN_PRIVATE_KEY)
            if (verify) {
                const decryptedData = await AES.decryptAsync(data, ZERO_ENCRYPTION_KEY)
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
            const decryptedData = await AES.decryptAsync(JSON.parse(data), ZERO_ENCRYPTION_KEY)
            const { transactionId } = JSON.parse(decryptedData)

            const transaction = await TransactionsModel.findOne({
                where: {
                    transactionId
                }
            })

            if (!transaction)
                throw "transaction not found";

            const transactionJSON = transaction.toJSON()

            const geoLocation = await fetchGeoLocation(transaction.toJSON().location)

            if (newStatus !== transaction.toJSON().status) {
                await transaction.update({
                    status: newStatus,
                    location: geoLocation
                })
            }

            const senderAccount = await AccountModel.findOne({
                where: {
                    id: transactionJSON.fromAccount
                }
            })

            const receiverAccount = await AccountModel.findOne({
                where: {
                    id: transactionJSON.toAccount
                }
            })

            if (!senderAccount)
                throw "sender account not found";

            if (!receiverAccount)
                throw "receiver account not found";

            const ledgerData = {
                sender: {
                    amount: transactionJSON.amount,
                    currency: transactionJSON.currency,
                    accountId: transactionJSON.fromAccount,
                    transactionId: transactionJSON.transactionId,
                    type: "debit".toUpperCase(),
                    status: "completed".toUpperCase(),
                    beforeBalance: senderAccount.dataValues.pendingBalance || 0.00,
                    afterBalance: senderAccount.dataValues.balance - transactionJSON.amount || 0.00,
                    latitude: transactionJSON.location.latitude,
                    longitude: transactionJSON.location.longitude,
                },
                receiver: {
                    amount: transactionJSON.amount,
                    currency: transactionJSON.currency,
                    accountId: transactionJSON.fromAccount,
                    transactionId: transactionJSON.transactionId,
                    type: "credit".toUpperCase(),
                    status: "executed".toUpperCase(),
                    beforeBalance: receiverAccount.dataValues.balance || 0.00,
                    afterBalance: receiverAccount.dataValues.balance + transactionJSON.amount || 0.00,
                    latitude: transactionJSON.location.latitude,
                    longitude: transactionJSON.location.longitude,
                }
            }

            await insertLadger(ledgerData)
            return newStatus

        } catch (error) {
            console.log({ prosessTransaction: error });
            throw error
        }
    }

    static createQueuedTransaction = async ({ sender, receiverUsername, transaction, device }: CreateRequestQueueedTransactionType) => {
        try {
            const senderAccount = await AccountModel.findOne({
                where: { username: sender.username },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                        attributes: { exclude: ['createdAt', 'dniNumber', 'updatedAt', 'faceVideoUrl', 'idBackUrl', 'idFrontUrl', 'profileImageUrl', 'password'] },
                    }
                ]
            })

            if (!senderAccount) {
                throw "Sender account not found";
            }

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

            const messageToSign = `${receiverUsername}&${sender.username}@${transaction.amount}@${ZERO_ENCRYPTION_KEY}`
            const hash = await HASH.sha256Async(messageToSign)
            const verify = await ECC.verifyAsync(hash, transaction.signature, ZERO_SIGN_PUBLIC_KEY)

            if (!verify)
                throw "error signing transaction"

            const senderAccountJSON = senderAccount.toJSON();
            const receiverAccountJSON = receiverAccount.toJSON();
            if (senderAccountJSON.balance < transaction.amount)
                throw "insufficient balance";

            if (!senderAccountJSON.allowSend)
                throw "sender account is not allowed to send money";


            if (!senderAccountJSON.allowReceive)
                throw "receiver account is not allowed to receive money";


            const lastTransaction = await TransactionsModel.findOne({
                limit: 100,
                order: [['createdAt', 'DESC']], // get the last transaction
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

            const lastTransactionJSON = lastTransaction?.toJSON()

            const distance = !lastTransactionJSON ? 0 : calculateDistance(
                lastTransactionJSON.location.latitude,
                lastTransactionJSON.location.longitude,
                transaction.location.latitude,
                transaction.location.longitude
            );

            const timeDifference = !lastTransactionJSON ? 0 : new Date().getTime() - new Date(lastTransactionJSON.createdAt).getTime()
            const speed = calculateSpeed(distance, timeDifference)

            const newTransactionData = {
                transactionId: transaction.transactionId,
                fromAccount: senderAccountJSON.id,
                toAccount: receiverAccount.toJSON().id,
                senderFullName: senderAccountJSON.user.fullName,
                receiverFullName: receiverAccount.toJSON().user.fullName,
                amount: transaction.amount,
                deliveredAmount: transaction.amount,
                transactionType: transaction.transactionType,
                currency: transaction.currency,
                location: transaction.location,

                signature: transaction.signature,
                deviceId: device.deviceId,
                ipAddress: device.ipAddress,
                isRecurring: transaction.isRecurring,
                platform: device.platform,
                sessionId: device.sessionId,
                previousBalance: senderAccount.toJSON().balance,
                fraudScore: 0,
                speed,
                distance
            }


            const features = await TransactionJoiSchema.transactionFeatures.parseAsync({
                speed: lastTransactionJSON?.status === "audited" ? 0 : +Number(speed).toFixed(2),
                distance: lastTransactionJSON?.status === "audited" ? 0 : +Number(distance).toFixed(2),
                amount: +Number(transaction.amount).toFixed(2),
                currency: ["dop", "usd"].indexOf(transaction.currency.toLowerCase()),
                transactionType: ["transfer", "request", "withdrawal", "deposit"].indexOf(transaction.transactionType.toLowerCase()),
                platform: ["ios", "android", "web"].indexOf(device.platform.toLowerCase()),
                isRecurring: transaction.isRecurring ? 1 : 0,
            })

            const detectedFraudulentTransaction = await anomalyRpcClient("detect_fraudulent_transaction", {
                features: Object.values(features)
            })

            const transactionCreated = await TransactionsModel.create(newTransactionData)
            const transactionData = await transactionCreated.reload({
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

            if (detectedFraudulentTransaction.last_transaction_features)
                await transactionsQueue.createJobs({
                    jobId: `trainTransactionFraudDetectionModel@${shortUUID.generate()}${shortUUID.generate()}`,
                    jobName: "trainTransactionFraudDetectionModel",
                    jobTime: "trainTransactionFraudDetectionModel",
                    referenceData: null,
                    userId: senderAccount.toJSON().user.id,
                    amount: +Number(transaction.amount).toFixed(4),
                    data: {
                        last_transaction_features: JSON.stringify(detectedFraudulentTransaction.last_transaction_features)
                    }
                })

            if (detectedFraudulentTransaction.is_fraud) {
                await Promise.all([
                    senderAccount.update({
                        status: "flagged"
                    }),
                    transactionCreated.update({
                        status: "suspicious",
                        features: JSON.stringify(detectedFraudulentTransaction.features),
                        fraudScore: detectedFraudulentTransaction.fraud_score
                    })
                ])

                await notificationServer("socketEventEmitter", {
                    data: transactionData.toJSON(),
                    channel: NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL.NOTIFICATION_TRANSACTION_CREATED,
                    senderSocketRoom: senderAccount.toJSON().user.username,
                    recipientSocketRoom: senderAccount.toJSON().user.username
                })

                return Object.assign({}, transactionData.toJSON(), {
                    status: "suspicious",
                    features: JSON.stringify(detectedFraudulentTransaction.features),
                    fraudScore: detectedFraudulentTransaction.fraud_score
                })

            } else {
                if (senderAccountJSON.pendingBalance < transaction.amount) {
                    throw new Error('Pending balance insufficient');
                }

                await transactionCreated.update({
                    features: JSON.stringify(detectedFraudulentTransaction.features),
                    fraudScore: detectedFraudulentTransaction.fraud_score
                })

                const newSenderPendingBalance = Number((senderAccountJSON.pendingBalance - transaction.amount).toFixed(4))
                await senderAccount.update({
                    pendingBalance: newSenderPendingBalance
                });

                const newReceiverBalance = Number((receiverAccountJSON.balance + transaction.amount).toFixed(4))
                await receiverAccount.update({
                    balance: newReceiverBalance
                });

                const ledgerData = {
                    sender: {
                        amount: transaction.amount,
                        currency: transaction.currency,
                        accountId: senderAccount.dataValues.id || null,
                        transactionId: transaction.transactionId,
                        type: "debit".toUpperCase(),
                        status: "executed".toUpperCase(),
                        beforeBalance: senderAccount.dataValues.pendingBalance || 0.00,
                        afterBalance: newReceiverBalance,
                        latitude: transaction.location.latitude,
                        longitude: transaction.location.longitude,
                        anomalies: detectedFraudulentTransaction,
                    },
                    receiver: {
                        amount: transaction.amount,
                        currency: transaction.currency,
                        accountId: receiverAccount.dataValues.id || null,
                        transactionId: transaction.transactionId,
                        type: "credit".toUpperCase(),
                        status: "executed".toUpperCase(),
                        beforeBalance: receiverAccount.dataValues.balance || 0.00,
                        afterBalance: newReceiverBalance || 0.00,
                        latitude: transaction.location.latitude,
                        longitude: transaction.location.longitude
                    }
                }

                await insertLadger(ledgerData)

                const encryptedData = await AES.encryptAsync(JSON.stringify({ transactionId: transactionData.toJSON().transactionId }), ZERO_ENCRYPTION_KEY);
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
                        amount: transaction.amount,
                        data: encryptedData,
                    }),
                    insertLadger(Object.assign({}, ledgerData, {
                        sender: {
                            ...ledgerData.sender,
                            status: "pending".toUpperCase()
                        },
                        receiver: {
                            ...ledgerData.receiver,
                            status: "pending".toUpperCase()
                        }
                    }))
                ])

                if (transaction.recurrenceData.time !== "oneTime") {
                    const jobId = `${transaction.recurrenceData.title}@${transaction.recurrenceData.time}@${shortUUID.generate()}${shortUUID.generate()}`
                    const transactionResponse = {
                        jobId,
                        isRecurrence: transaction.isRecurring,
                        userId: senderAccount.toJSON().user.id,
                        jobName: transaction.recurrenceData.title,
                        jobTime: transaction.recurrenceData.time,
                        "amount": newTransactionData.amount,
                        "status": "waiting",
                        queueType: "transaction",
                        referenceData: {
                            fullName: receiverAccount.toJSON().user.fullName,
                            logo: receiverAccount.toJSON().user.profileImageUrl
                        },
                        signature: newTransactionData.signature,
                        user: senderAccount.toJSON().user,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                    }
                    const recurrenceQueueData = Object.assign(newTransactionData, {
                        transactionId: `${shortUUID.generate()}${shortUUID.generate()}`,
                        recurrenceData: transaction.recurrenceData,
                        location: {},
                        response: transactionResponse
                    })

                    const encryptedData = await AES.encryptAsync(JSON.stringify(recurrenceQueueData), ZERO_ENCRYPTION_KEY);
                    await Promise.all([
                        transactionsQueue.createJobs({
                            jobId,
                            userId: senderAccount.toJSON().user.id,
                            jobName: transaction.recurrenceData.title,
                            jobTime: transaction.recurrenceData.time,
                            amount: transaction.amount,
                            data: encryptedData,
                            referenceData: {
                                fullName: receiverAccount.toJSON().user.fullName,
                                logo: receiverAccount.toJSON().user.profileImageUrl
                            }
                        }),
                        insertLadger(Object.assign({}, ledgerData, {
                            sender: {
                                ...ledgerData.sender,
                                status: "RECURRING".toUpperCase()
                            },
                            receiver: {
                                ...ledgerData.receiver,
                                status: "RECURRING".toUpperCase()
                            }
                        }))
                    ])
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

                const expoNotificationTokens: { token: string, message: string }[] = receiverSession.map((obj: any) => ({ token: obj.dataValues.expoNotificationToken, message: `${MAKE_FULL_NAME_SHORTEN(receiverAccount.toJSON().user.fullName)} te ha enviado ${FORMAT_CURRENCY(transaction.amount)} pesos` }));
                await notificationServer("newTransactionNotification", {
                    data: expoNotificationTokens
                })
            }

        } catch (error: any) {
            console.log({ createTransaction: error });
            throw error
        }
    }

    static createRequestQueueedTransaction = async ({ sender, receiverUsername, transaction, device }: CreateRequestQueueedTransactionType) => {
        try {
            const message = `${transaction.transactionId}&${transaction.amount}@${ZERO_ENCRYPTION_KEY}`
            const hash = await HASH.sha256Async(message)
            const verify = await RSA.verify(hash, transaction.signature, ZERO_SIGN_PUBLIC_KEY)

            if (!verify)
                throw "Transaction signature verification failed"

            const receiver = await AccountModel.findOne({
                where: {
                    username: receiverUsername
                },
                include: [
                    {
                        model: UsersModel,
                        as: 'user'
                    }
                ]
            })

            if (!receiver)
                throw "Receiver not found"

            if (!receiver.toJSON().allowRequestMe)
                throw `${receiver.toJSON().username} account does not receive request payment`

            const receiverData = receiver.toJSON()
            const features = `[[0.0, 0.0, ${Number(transaction.amount).toFixed(1)}, ${Number(0).toFixed(1)}, 0.0, 1.0, 0.0]]`
            const transactionCreated = await TransactionsModel.create({
                transactionId: transaction.transactionId,
                senderFullName: sender.fullName,
                receiverFullName: receiverData.user.fullName,
                fromAccount: sender.accountId,
                toAccount: receiverData.id,
                amount: transaction.amount,
                deliveredAmount: transaction.amount,
                transactionType: transaction.transactionType,
                currency: transaction.currency,
                location: transaction.location,
                status: "requested",
                signature: transaction.signature,

                deviceId: device.deviceId,
                ipAddress: device.ipAddress,
                isRecurring: transaction.isRecurring,
                platform: device.platform,
                sessionId: device.sessionId,
                previousBalance: sender.balance,
                fraudScore: 0,
                speed: 0,
                distance: 0,
                features
            })

            const receiverSession = await SessionModel.findAll({
                attributes: ["expoNotificationToken"],
                where: {
                    [Op.and]: [
                        { userId: receiverData.user.id },
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

            const expoNotificationTokens: { token: string, message: string }[] = receiverSession.map((obj: any) => ({ token: obj.dataValues.expoNotificationToken, message: `${MAKE_FULL_NAME_SHORTEN(receiverData.user.fullName)} te ha solicitado ${FORMAT_CURRENCY(transaction.amount)} pesos` }));
            await Promise.all([
                notificationServer("newTransactionNotification", {
                    data: expoNotificationTokens
                }),
                notificationServer("socketEventEmitter", {
                    data: transactionCreated.toJSON(),
                    channel: NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL.NOTIFICATION_QUEUE_TRANSACTION_CREATED,
                    senderSocketRoom: sender.username,
                    recipientSocketRoom: receiverData.user.username,
                })
            ])

        } catch (error: any) {
            throw error
        }
    }

    static cancelRequestedTransaction = async ({ transactionId, fromAccount, senderUsername }: CancelRequestedTransactionType) => {
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

            if (transaction.toJSON().status !== "requested") {
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


            const message = `${transactionId}&${transaction.toJSON().amount}@${ZERO_ENCRYPTION_KEY}`
            const hash = await HASH.sha256Async(message)

            const verify = await RSA.verify(hash, transaction.toJSON().signature, ZERO_SIGN_PUBLIC_KEY)
            if (!verify)
                throw "error verificando transacción"


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

                return transactionData.toJSON()

            } else {
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

                const encryptedData = await AES.encryptAsync(JSON.stringify({ transactionId: transactionData.toJSON().transactionId }), ZERO_ENCRYPTION_KEY);

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
                        data: encryptedData
                    })
                ])

                return transactionData.toJSON()
            }

        } catch (error: any) {
            throw error
        }
    }

    static createBankingTransaction = async (transactionData: CreateBankingTransactionType) => {
        try {
            const validatedData = await TransactionJoiSchema.bankingCreateTransaction.parseAsync(transactionData)
            const account = await AccountModel.findOne({
                where: {
                    id: validatedData.accountId
                }
            })

            if (!account)
                throw "account not found"

            // const card = await CardsModel.findOne({
            //     where: {
            //         [Op.and]: [
            //             { userId: transactionData.userId },
            //             { id: transactionData.cardId }
            //         ]
            //     }
            // })

            // if (!card)
            //     throw 'The given card is not linked to the user account'

            // const decryptedCardData = await AES.decryptAsync(card.toJSON().data, ZERO_ENCRYPTION_KEY)
            // const cardData = Object.assign({}, card.toJSON(), JSON.parse(decryptedCardData))

            //[TODO]: Need Payment Gateway Integration
            console.error("createBankingTransaction: Need Payment Gateway Integration");

            const messageToSign = `${validatedData.accountId}&${validatedData.userId}@${validatedData.amount}@${ZERO_ENCRYPTION_KEY}`
            const hash = await HASH.sha256Async(messageToSign)

            const verifySignature = await RSA.verify(hash, validatedData.signature, ZERO_SIGN_PUBLIC_KEY)
            if (!verifySignature)
                throw "invalid signature"

            await BankingTransactionsModel.create(validatedData)

            const accountData = account.toJSON()
            const newBalance: number = validatedData.transactionType === "deposit" ? accountData.balance + validatedData.amount : accountData.balance - validatedData.amount

            if (!account.toJSON().allowDeposit)
                throw "account is not allowed to deposit"

            await account.update({
                balance: newBalance
            })


        } catch (error: any) {
            console.error(error);

            throw error.message
        }
    }

    static trainTransactionFraudDetectionModel = async (job: JobJson) => {
        try {
            const data = JSON.parse(job.data)
            const transaction = await TransactionsModel.findOne({
                attributes: ["id", 'features', 'createdAt'],
                order: [["id", "ASC"]],
                where: {
                    features: data.last_transaction_features
                }
            })

            if (!transaction) {
                const transactions = await TransactionsModel.findAll({
                    attributes: ["id", 'features', "status"],
                    limit: 1000,
                    order: [["id", "ASC"]],
                    where: {
                        status: { [Op.or]: ["completed", "suspicious"] }
                    }
                })

                const transactionsFeatures = transactions.map((trx: any) => {
                    if (trx.toJSON().features)
                        return JSON.parse(trx.toJSON().features)
                })

                await anomalyRpcClient("retrain_model", {
                    features: transactionsFeatures
                })

            } else {
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

                if (transactions.count > 1000) {
                    const transactionsFeatures = transactions.rows.map((trx: any) => {
                        if (trx.toJSON().features)
                            return JSON.parse(trx.toJSON().features)
                    })

                    await anomalyRpcClient("retrain_model", {
                        features: transactionsFeatures
                    })
                }
            }


        } catch (error) {
            console.log({ trainTransactionFraudDetectionModel: error });
            throw error
        }
    }
}