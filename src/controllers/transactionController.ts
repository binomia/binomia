import { AccountModel, kycModel, BankingTransactionsModel, TransactionsModel, UsersModel, CardsModel, QueuesModel } from '@/models'
import { checkForProtectedRequests, getQueryResponseFields, } from '@/helpers'
import { GraphQLError } from 'graphql';
import { TransactionJoiSchema } from '@/auth/transactionJoiSchema';
import { Cryptography } from '@/helpers/cryptography';
import { NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL, QUEUE_JOBS_NAME, REDIS_SUBSCRIPTION_CHANNEL, ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from '@/constants';
import { Op } from 'sequelize';
import { queueServer } from '@/rpc/queueRPC';
import redis from '@/redis';
import shortUUID from 'short-uuid';

export class TransactionsController {
    static transaction = async (_: unknown, { transactionId }: { transactionId: string }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'transaction')

            const transaction = await TransactionsModel.findOne({
                attributes: fields['transaction'],
                where: { transactionId: transactionId }
            })

            return transaction

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static createTransaction = async (_: unknown, { data, recurrence }: { data: any, recurrence: any }, context: any) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const validatedData = await TransactionJoiSchema.createTransaction.parseAsync(data)
            const recurrenceData = await TransactionJoiSchema.recurrenceTransaction.parseAsync(recurrence)
            const { user } = session

            const transactionId = `${shortUUID.generate()}${shortUUID.generate()}`
            await redis.publish(QUEUE_JOBS_NAME.QUEUE_TRANSACTION, JSON.stringify({
                jobId: `queueTransaction@${transactionId}`,
                jobName: "queueTransaction",
                jobTime: "queueTransaction",
                userId: session.userId,
                amount: validatedData.amount,
                data: JSON.stringify({
                    transactionId,
                    senderUsername: user.username,
                    receiverUsername: validatedData.receiver,
                    amount: validatedData.amount,
                    recurrenceData,
                    senderFullName: user.fullName,
                    location: validatedData.location,
                    currency: validatedData.currency,
                    transactionType: validatedData.transactionType
                })
            }))

            return {
                transactionId,
                status: "queued",
                jobId: `queueRequestTransaction@${transactionId}`,
                jobName: "queueRequestTransaction",
                jobTime: "queueRequestTransaction"
            }

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static createRequestTransaction = async (_: unknown, { data, recurrence }: { data: any, recurrence: any }, context: any) => {
        try {
            const { user, userId } = await checkForProtectedRequests(context.req);
            const validatedData = await TransactionJoiSchema.createTransaction.parseAsync(data)
            const recurrenceData = await TransactionJoiSchema.recurrenceTransaction.parseAsync(recurrence)

            const message = `${validatedData.receiver}&${user.username}@${validatedData.amount}@${ZERO_ENCRYPTION_KEY}&${ZERO_SIGN_PRIVATE_KEY}`
            const signature = await Cryptography.sign(message, ZERO_SIGN_PRIVATE_KEY)

            const transactionId = `${shortUUID.generate()}${shortUUID.generate()}`
            await redis.publish(QUEUE_JOBS_NAME.QUEUE_REQUEST_TRANSACTION, JSON.stringify({
                jobId: `queueRequestTransaction@${transactionId}`,
                jobName: "queueRequestTransaction",
                jobTime: "queueRequestTransaction",
                userId: userId,
                amount: validatedData.amount,
                data: JSON.stringify({
                    senderUsername: user.username,
                    receiverUsername: validatedData.receiver,
                    amount: validatedData.amount,
                    transactionType: validatedData.transactionType,
                    senderFullName: user.fullName,
                    recurrenceData,
                    transactionId,
                    location: validatedData.location,
                    currency: validatedData.currency,
                    signature
                })
            }))

            return {
                transactionId,
                status: "queued",
                jobId: `queueRequestTransaction@${transactionId}`,
                jobName: "queueRequestTransaction",
                jobTime: "queueRequestTransaction"
            }

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static cancelRequestedTransaction = async (_: unknown, { transactionId }: { transactionId: string }, context: any) => {
        try {
            const { user } = await checkForProtectedRequests(context.req);

            const transaction = await TransactionsModel.findOne({
                where: {
                    [Op.and]: [
                        { transactionId },
                        { transactionType: "request" },
                        { fromAccount: user.account.id }
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
                throw new GraphQLError("transaction not found");

            if (transaction.toJSON().status === "cancelled") {
                await redis.publish(REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_REQUEST_CANCELED, JSON.stringify({
                    data: transaction.toJSON(),
                    senderSocketRoom: user.username,
                    recipientSocketRoom: transaction.toJSON().to.user.username,
                }))

                return transaction.toJSON()
            }

            await transaction.update({ status: "cancelled" })
            await redis.publish(REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_REQUEST_CANCELED, JSON.stringify({
                data: transaction.toJSON(),
                senderSocketRoom: user.username,
                recipientSocketRoom: transaction.toJSON().to.user.username,
            }))

            return transaction.toJSON()

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static payRequestTransaction = async (_: unknown, { transactionId, paymentApproved }: { transactionId: string, paymentApproved: boolean }, context: any) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const transaction = await TransactionsModel.findOne({
                where: {
                    [Op.and]: [
                        { transactionId },
                        { status: "requested" },
                        { transactionType: "request" },
                        { toAccount: session.user.account.id }
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
                throw new GraphQLError("transaction not found");


            const senderAccount = await AccountModel.findOne({
                where: { id: transaction.toJSON().toAccount },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                        include: [
                            {
                                model: kycModel,
                                as: 'kyc',
                                attributes: ['id', 'dniNumber', 'dob', 'status', 'expiration']
                            }
                        ]
                    }
                ]
            })

            if (!senderAccount)
                throw new GraphQLError("sender account not found");


            if (senderAccount.toJSON().balance < transaction.toJSON().amount)
                throw new GraphQLError("no tiene suficiente saldo para realizar esta transacción");

            const receiverAccount = await AccountModel.findOne({
                where: {
                    id: transaction.toJSON().fromAccount
                },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                        include: [
                            {
                                model: kycModel,
                                as: 'kyc',
                                attributes: ['id', 'dniNumber', 'dob', 'status', 'expiration']
                            }
                        ]
                    }
                ]
            })

            if (!receiverAccount)
                throw new GraphQLError("receiver account not found");


            if (!paymentApproved) {
                await transaction.update({
                    status: "cancelled"
                })

                await redis.publish(NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL.NOTIFICATION_TRANSACTION_REQUEST_CANCELED, JSON.stringify({
                    data: transaction.toJSON(),
                    senderSocketRoom: senderAccount.toJSON().user.username,
                    recipientSocketRoom: receiverAccount.toJSON().user.username,

                }))

                const transactionData = await transaction.reload()
                return transactionData.toJSON()

            } else {
                const message = `${senderAccount.toJSON().username}&${receiverAccount.toJSON().username}@${transaction.toJSON().amount}@${ZERO_ENCRYPTION_KEY}&${ZERO_SIGN_PRIVATE_KEY}`

                // [TODO] Verify signature
                const verify = await Cryptography.verify(message, transaction.toJSON().signature, ZERO_SIGN_PRIVATE_KEY)
                if (!verify)
                    throw new GraphQLError("error verificando transacción");


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
                    redis.publish(REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_REQUEST_PAIED, JSON.stringify({
                        data: transactionData.toJSON(),
                        senderSocketRoom: senderAccount.toJSON().user.username,
                        recipientSocketRoom: receiverAccount.toJSON().user.username
                    })),

                    redis.publish(QUEUE_JOBS_NAME.PENDING_TRANSACTION, JSON.stringify({
                        jobId: `pendingTransaction@${shortUUID.generate()}${shortUUID.generate()}`,
                        jobName: "pendingTransaction",
                        jobTime: "everyThirtyMinutes",
                        senderId: senderAccount.toJSON().id,
                        receiverId: receiverAccount.toJSON().id,
                        amount: transactionData.toJSON().amount,
                        data: { transactionId: transactionData.toJSON().transactionId },

                    }))
                ])

                return transactionData.toJSON()

            }

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static createBankingTransaction = async (_: unknown, { cardId, data }: { cardId: number, data: any }, context: any) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const validatedData = await TransactionJoiSchema.bankingCreateTransaction.parseAsync(data)

            const card = await CardsModel.findOne({
                where: {
                    [Op.and]: [
                        { userId: session.user.id },
                        { id: cardId }
                    ]
                }
            })

            if (!card)
                throw new GraphQLError('The given card is not linked to the user account');


            const decryptedCardData = await Cryptography.decrypt(card.toJSON().data)
            const cardData = Object.assign({}, card.toJSON(), JSON.parse(decryptedCardData))

            // Need Payment Gateway Integration
            console.error("createBankingTransaction: Need Payment Gateway Integration");


            const hash = await Cryptography.hash(JSON.stringify({
                data: {
                    ...validatedData,
                    deliveredAmount: validatedData.amount,
                    accountId: session.user.account.id,
                    data: {}
                },
                ZERO_ENCRYPTION_KEY,
                ZERO_SIGN_PRIVATE_KEY,
            }))

            const signature = await Cryptography.sign(hash, ZERO_SIGN_PRIVATE_KEY)
            const transaction = await BankingTransactionsModel.create({
                ...validatedData,
                deliveredAmount: validatedData.amount,
                accountId: session.user.account.id,
                cardId: cardData.id,
                signature,
                data: {}
            })


            const newBalance = {
                deposit: session.user.account.balance + validatedData.amount,
                withdraw: session.user.account.balance - validatedData.amount
            }

            const account = await AccountModel.findOne({
                where: {
                    id: session.user.account.id
                }
            })

            if (!account)
                throw new GraphQLError("account not found");

            if (!account.toJSON().allowDeposit)
                throw new GraphQLError("account is not allowed to deposit");


            await account.update({
                balance: newBalance[validatedData.transactionType]
            })

            await redis.publish(REDIS_SUBSCRIPTION_CHANNEL.BANKING_TRANSACTION_CREATED, JSON.stringify({
                ...transaction.toJSON(),

            }))

            return Object.assign({}, transaction.toJSON(), { card: cardData })

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
                            fromAccount: user.account.id
                        },
                        {
                            toAccount: user.account.id,
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
            const job = await queueServer("removeJob", { jobKey: repeatJobKey, queueType })
            return job

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static updateRecurrentTransactions = async (_: unknown, { data: { repeatJobKey, queueType, jobName, jobTime } }: { data: { repeatJobKey: string, queueType: string, jobName: string, jobTime: string } }, context: any) => {
        try {
            await checkForProtectedRequests(context.req);
            const job = await queueServer("updateJob", {
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