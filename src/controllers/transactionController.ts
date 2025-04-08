import shortUUID from 'short-uuid';
import PrometheusMetrics from '@/metrics/PrometheusMetrics';
import { AccountModel, BankingTransactionsModel, TransactionsModel, UsersModel, CardsModel, QueuesModel } from '@/models'
import { checkForProtectedRequests, getQueryResponseFields, } from '@/helpers'
import { GraphQLError } from 'graphql';
import { TransactionJoiSchema } from '@/auth/transactionJoiSchema';
import { Cryptography } from '@/helpers/cryptography';
import { ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from '@/constants';
import { Op } from 'sequelize';
import { queueServer } from '@/rpc/queueRPC';
import { Span, SpanStatusCode, Tracer } from '@opentelemetry/api';
import { AES, HASH, RSA } from 'cryptografia';
import redis, { connection } from '@/redis';
import { Queue } from 'bullmq';


const queue = new Queue("transactions", { connection });


export class TransactionsController {
    static transaction = async (_: unknown, { transactionId }: { transactionId: string }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const { user } = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'transaction')

            const transaction = await TransactionsModel.findOne({
                attributes: fields['transaction'],
                where: {
                    [Op.and]: [
                        { transactionId },
                        {
                            [Op.or]: [
                                {
                                    fromAccount: user.account.id
                                },
                                {
                                    toAccount: user.account.id,
                                }
                            ]
                        }
                    ]
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'from',
                        attributes: fields['from'],
                        include: [{
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        }]
                    },
                    {
                        model: AccountModel,
                        as: 'to',
                        attributes: fields['to'],
                        include: [{
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        }]
                    }
                ]
            })

            return transaction

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static createTransaction = async (_: unknown, { message }: { message: string }, { req, tracer }: { req: any, metrics: PrometheusMetrics, tracer: Tracer }) => {
        const span: Span = tracer.startSpan("createTransaction");
        try {
            span.addEvent("Starting transaction creation");
            span.setAttribute("graphql.mutation.data", JSON.stringify(message));

            const { user, account, sid, userId, privateKey } = await checkForProtectedRequests(req);

            const decryptedPrivateKey = await AES.decrypt(privateKey, ZERO_ENCRYPTION_KEY)
            const decryptedMessage = await RSA.decryptAsync(message, decryptedPrivateKey)
            const { data, recurrence } = JSON.parse(decryptedMessage)

            const validatedData = await TransactionJoiSchema.createTransaction.parseAsync(data)
            const recurrenceData = await TransactionJoiSchema.recurrenceTransaction.parseAsync(recurrence)

            const messageToSign = `${validatedData.receiver}&${user.username}@${validatedData.amount}`
            const hash = await HASH.sha256Async(messageToSign)
            const signature = await RSA.sign(hash, ZERO_SIGN_PRIVATE_KEY)
           
            const transactionId = `${shortUUID.generate()}${shortUUID.generate()}`
            const { deviceid, ipaddress, platform } = req.headers

            const receiverAccount = await AccountModel.findOne({
                attributes: { exclude: ['username'] },
                where: {
                    username: validatedData.receiver
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

            span.addEvent("queueServer is queuing the transaction");

            const jobId = `queueTransaction@${transactionId}`
            const queueData = {
                receiverUsername: validatedData.receiver,
                sender: {
                    id: userId,
                    fullName: user.fullName,
                    username: user.username,
                    accountId: user.account.id,
                    balance: user.account.balance
                },
                transaction: {
                    transactionId,
                    amount: validatedData.amount,
                    location: validatedData.location,
                    currency: validatedData.currency,
                    transactionType: validatedData.transactionType,
                    signature,
                    recurrenceData,
                    status: "pending",
                    isRecurring: recurrenceData.time !== "oneTime",
                },
                device: {
                    deviceId: deviceid,
                    sessionId: sid,
                    ipAddress: ipaddress,
                    platform,
                }
            }

            await queue.add(jobId, queueData, {
                jobId,
                removeOnComplete: {
                    age: 20 // 30 minutes
                },
                removeOnFail: {
                    age: 60 * 30 // 24 hours
                }
            })

            const transactionResponse = {
                transactionId,
                "amount": validatedData.amount,
                "deliveredAmount": validatedData.amount,
                "voidedAmount": validatedData.amount,
                "transactionType": validatedData.transactionType,
                "currency": "DOP",
                "status": "pending",
                "location": validatedData.location,
                "createdAt": Date.now().toString(),
                "updatedAt": Date.now().toString(),
                "from": {
                    ...account,
                    user
                },
                "to": {
                    ...receiverAccount.toJSON()
                }
            }



            span.addEvent("queueServer is saving the transaction in cache");
            const transactionResponseCached = await redis.get(`transactionQueue:${user.account.id}`)
            if (transactionResponseCached)
                await redis.set(`transactionQueue:${user.account.id}`, JSON.stringify([...JSON.parse(transactionResponseCached), transactionResponse]))
            else
                await redis.set(`transactionQueue:${user.account.id}`, JSON.stringify([transactionResponse]))

            span.setAttribute("queueServer.response", JSON.stringify(jobId));
            span.setStatus({ code: SpanStatusCode.OK });

            return transactionResponse

        } catch (error: any) {
            throw new GraphQLError(error.message);
        } finally {
            span.end();
        }
    }

    static createRequestTransaction = async (_: unknown, { message }: { message: string }, context: any) => {
        try {
            const { user, userId, sid: sessionId } = await checkForProtectedRequests(context.req);
            const { deviceid, ipaddress, platform } = context.req.headers

            const decryptedMessage = await AES.decrypt(message, ZERO_ENCRYPTION_KEY)
            const { data, recurrence } = JSON.parse(decryptedMessage)

            const validatedData = await TransactionJoiSchema.createTransaction.parseAsync(data)
            const recurrenceData = await TransactionJoiSchema.recurrenceTransaction.parseAsync(recurrence)

            const messageToSign = `${validatedData.receiver}&${user.username}@${validatedData.amount}@${ZERO_ENCRYPTION_KEY}&${ZERO_SIGN_PRIVATE_KEY}`
            const signature = await Cryptography.sign(messageToSign, ZERO_SIGN_PRIVATE_KEY)
            const transactionId = `${shortUUID.generate()}${shortUUID.generate()}`

            const queueData = {
                receiverUsername: validatedData.receiver,
                sender: {
                    id: userId,
                    fullName: user.fullName,
                    username: user.username,
                    accountId: user.account.id,
                    balance: user.account.balance
                },
                transaction: {
                    transactionId,
                    amount: validatedData.amount,
                    location: validatedData.location,
                    currency: validatedData.currency,
                    transactionType: validatedData.transactionType,
                    signature,
                    recurrenceData,
                    status: "pending",
                    isRecurring: recurrenceData.time !== "oneTime",
                },
                device: {
                    deviceId: deviceid,
                    sessionId,
                    ipAddress: ipaddress,
                    platform,
                }
            }

            const jobId = `queueRequestTransaction@${transactionId}`
            await queue.add(jobId, queueData, {
                jobId,
                removeOnComplete: {
                    age: 20 // 30 minutes
                },
                removeOnFail: {
                    age: 60 * 30 // 24 hours
                }
            })

            const transactionResponse = {
                transactionId,
                "amount": validatedData.amount,
                "deliveredAmount": validatedData.amount,
                "voidedAmount": validatedData.amount,
                "transactionType": validatedData.transactionType,
                "currency": "DOP",
                "status": "pending",
                "location": validatedData.location,
                "createdAt": Date.now().toString(),
                "updatedAt": Date.now().toString(),
                "from": {
                    ...user.account,
                    user
                }
            }

            return transactionResponse

        } catch (error: any) {
            console.log({ error });

            throw new GraphQLError(error.message);
        }
    }

    static cancelRequestedTransaction = async (_: unknown, { transactionId }: { transactionId: string }, context: any) => {
        try {
            const { user } = await checkForProtectedRequests(context.req);
            const transaction = await queueServer("cancelRequestedTransaction", {
                transactionId,
                fromAccount: user.account.id,
                senderUsername: user.username
            })

            return transaction

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static payRequestTransaction = async (_: unknown, { transactionId, paymentApproved }: { transactionId: string, paymentApproved: boolean }, context: any) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const jobId = `payRequestTransaction@${transactionId}`
            const queueData = {
                transactionId,
                paymentApproved,
                toAccount: session.user.account.id,
            }

            await queue.add(jobId, queueData, {
                jobId,
                removeOnComplete: {
                    age: 20 // 30 minutes
                },
                removeOnFail: {
                    age: 60 * 30 // 24 hours
                }
            })

            return { status: "pending", transactionId }

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static createBankingTransaction = async (_: unknown, { cardId, data }: { cardId: number, data: any }, context: any) => {
        try {
            const { user } = await checkForProtectedRequests(context.req);
            const validatedData = await TransactionJoiSchema.bankingCreateTransaction.parseAsync(data)

            const transaction = await queueServer("createBankingTransaction", {
                cardId,
                accountId: user.account.id,
                userId: user.id,
                data: validatedData
            })

            return transaction

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static accountBankingTransactions = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'transactions')

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const limit = _pageSize;
            const offset = (page - 1) * _pageSize;

            const transactions = await BankingTransactionsModel.findAll({
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                attributes: [...fields['transactions']],
                where: {
                    accountId: session.user.account.id
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'account',
                        attributes: fields['account'],
                        include: [{
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        }]
                    },
                    {
                        model: CardsModel,
                        as: 'card',
                        attributes: fields['card']
                    }
                ]
            })

            if (!transactions)
                throw new GraphQLError('No transactions found');

            return transactions

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static accountTransactions = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'transactions')
            const { user } = session

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const limit = _pageSize;
            const offset = (page - 1) * _pageSize;

            const transactions = await TransactionsModel.findAll({
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                attributes: [...fields['transactions'], "fromAccount", "toAccount"],
                where: {
                    [Op.or]: [
                        {
                            fromAccount: user.account.id,

                        },
                        {
                            toAccount: user.account.id,
                            status: { [Op.ne]: "suspicious" }
                        }
                    ]
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'from',
                        attributes: fields['from'],
                        include: [{
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        }]
                    },
                    {
                        model: AccountModel,
                        as: 'to',
                        attributes: fields['to'],
                        include: [{
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        }]
                    }
                ]
            });

            const transactionQueued = await redis.get(`transactionQueue:${user.account.id}`)
            const parsedTransactions: any[] = transactionQueued ? JSON.parse(transactionQueued) : []

            return [...transactions, ...parsedTransactions]

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static searchAccountTransactions = async (_: unknown, { page, pageSize, fullName }: { page: number, pageSize: number, fullName: string }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const { user } = session

            const fields = getQueryResponseFields(fieldNodes, 'transactions')

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const limit = _pageSize;
            const offset = (page - 1) * _pageSize;

            const transactions = await TransactionsModel.findAll({
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                attributes: [...fields['transactions'], "fromAccount", "toAccount"],
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                {
                                    [Op.and]: [
                                        {
                                            senderFullName: { [Op.iLike]: `%${fullName}%` },
                                        },
                                        {
                                            fromAccount: { [Op.ne]: user.account.id }
                                        }
                                    ]
                                },
                                {
                                    [Op.and]: [
                                        {
                                            receiverFullName: { [Op.iLike]: `%${fullName}%` },
                                        },
                                        {
                                            fromAccount: user.account.id
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            [Op.or]: [
                                {
                                    fromAccount: user.account.id
                                },
                                {
                                    toAccount: user.account.id,
                                }
                            ]
                        }
                    ]
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'from',
                        attributes: fields['from'],

                        include: [{
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        }]
                    },
                    {
                        model: AccountModel,
                        as: 'to',
                        attributes: fields['to'],
                        include: [{
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        }]
                    }
                ]
            })

            if (!transactions)
                throw new GraphQLError('No transactions found');

            return transactions

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static accountRecurrentTransactions = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'transactions')

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const limit = _pageSize;
            const offset = (page - 1) * _pageSize;

            const transactions = await QueuesModel.findAll({
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                attributes: fields['transactions'],
                where: {
                    [Op.and]: [
                        { userId: session.userId },
                        { status: "active" },
                        { jobName: { [Op.notIn]: ["pendingTopUp", "pendingTransaction"] } }
                    ]
                },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                        attributes: fields['user']
                    }
                ]
            })


            if (!transactions)
                throw new GraphQLError('No transactions found');

            return transactions

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static deleteRecurrentTransactions = async (_: unknown, { repeatJobKey, queueType }: { repeatJobKey: string, queueType: string }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(context.req);
            const job = await queueServer("deleteRecurrentTransactions", { jobKey: repeatJobKey, queueType })
            return job

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static updateRecurrentTransactions = async (_: unknown, { data: { repeatJobKey, queueType, jobName, jobTime } }: { data: { repeatJobKey: string, queueType: string, jobName: string, jobTime: string } }, context: any) => {
        try {
            await checkForProtectedRequests(context.req);
            const job = await queueServer("updateRecurrentTransactions", {
                jobKey: repeatJobKey,
                jobName,
                queueType,
                jobTime
            })
            return job

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }
}