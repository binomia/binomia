import { AccountModel, kycModel, BankingTransactionsModel, TransactionsModel, UsersModel, CardsModel, SessionModel, QueuesModel } from '@/models'
import { checkForProtectedRequests, getQueryResponseFields, } from '@/helpers'
import { GraphQLError } from 'graphql';
import { TransactionJoiSchema } from '@/auth/transactionJoiSchema';
import { Cryptography } from '@/helpers/cryptography';
import { QUEUE_JOBS_NAME, REDIS_SUBSCRIPTION_CHANNEL, ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from '@/constants';
import { Op } from 'sequelize';
import { queueServer } from '@/rpc/queueRPC';
import redis from '@/redis';
import shortUUID from 'short-uuid';

export class TransactionsController {
    static createTransaction = async (_: unknown, { data, recurrence }: { data: any, recurrence: any }, context: any) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const validatedData = await TransactionJoiSchema.createTransaction.parseAsync(data)
            const recurrenceData = await TransactionJoiSchema.recurrenceTransaction.parseAsync(recurrence)

            const { user: sender } = session
            const senderAccount = await AccountModel.findOne({
                where: { username: sender.username },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                        attributes: { exclude: ['createdAt', 'dniNumber', 'updatedAt', 'faceVideoUrl', 'idBackUrl', 'idFrontUrl', 'profileImageUrl', 'password'] },
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

            const receiverAccount = await AccountModel.findOne({
                attributes: { exclude: ['username'] },
                where: {
                    username: validatedData.receiver
                },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                        attributes: { exclude: ['createdAt', 'dniNumber', 'updatedAt', 'faceVideoUrl', 'idBackUrl', 'idFrontUrl', 'profileImageUrl', 'password'] },
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

            const hash = await Cryptography.hash(JSON.stringify({
                hash: {
                    sender: senderAccount.toJSON().username,
                    receiver: validatedData.receiver,
                    amount: validatedData.amount,
                    transactionType: validatedData.transactionType,
                    currency: validatedData.currency,
                    location: validatedData.location
                },
                ZERO_ENCRYPTION_KEY,
                ZERO_SIGN_PRIVATE_KEY,
            }))

            if (senderAccount.toJSON().balance < validatedData.amount)
                throw new GraphQLError("insufficient balance");

            if (!senderAccount.toJSON().allowSend)
                throw new GraphQLError("sender account is not allowed to send money");


            if (!receiverAccount.toJSON().allowReceive)
                throw new GraphQLError("receiver account is not allowed to receive money");


            const signature = await Cryptography.sign(hash, ZERO_SIGN_PRIVATE_KEY)

            // [TODO]: Authorization need to be implemented

            const transaction = await TransactionsModel.create({
                fromAccount: senderAccount.toJSON().id,
                toAccount: receiverAccount.toJSON().id,
                senderFullName: senderAccount.toJSON().user.fullName,
                receiverFullName: receiverAccount.toJSON().user.fullName,
                amount: validatedData.amount,
                deliveredAmount: validatedData.amount,
                transactionType: validatedData.transactionType,
                currency: validatedData.currency,
                location: validatedData.location,
                signature
            })

            const newSenderBalance = Number(senderAccount.toJSON().balance - validatedData.amount).toFixed(4)
            await senderAccount.update({
                balance: Number(newSenderBalance)
            })

            const newReceiverBalance = Number(receiverAccount.toJSON().balance + validatedData.amount).toFixed(4)
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

            const expoNotificationTokens: string[] = receiverSession.map(obj => obj.dataValues.expoNotificationToken);
            await Promise.all([
                redis.publish(REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED, JSON.stringify({
                    data: transactionData.toJSON(),
                    senderSocketRoom: senderAccount.toJSON().user.username,
                    recipientSocketRoom: receiverAccount.toJSON().user.username,
                    expoNotificationTokens
                })),

                redis.publish(QUEUE_JOBS_NAME.PENDING_TRANSACTION, JSON.stringify({
                    jobId: `pendingTransaction@${shortUUID.generate()}${shortUUID.generate()}`,
                    jobName: "pendingTransaction",
                    jobTime: "everyThirtyMinutes",
                    senderId: senderAccount.toJSON().id,
                    receiverId: receiverAccount.toJSON().id,
                    amount: validatedData.amount,
                    data: { transactionId: transactionData.toJSON().transactionId },
                }))
            ])

            if (recurrenceData.time !== "oneTime") {
                const recurrenceQueueData = await TransactionJoiSchema.recurrenceQueueTransaction.parseAsync(Object.assign(transactionData.toJSON(), {
                    amount: validatedData.amount,
                    receiver: validatedData.receiver,
                    sender: senderAccount.toJSON().username
                }))

                await redis.publish(QUEUE_JOBS_NAME.CREATE_TRANSACTION, JSON.stringify({
                    jobId: `${recurrenceData.title}@${recurrenceData.time}@${shortUUID.generate()}${shortUUID.generate()}`,
                    jobName: recurrenceData.title,
                    jobTime: recurrenceData.time,
                    senderId: senderAccount.toJSON().id,
                    receiverId: receiverAccount.toJSON().id,
                    amount: validatedData.amount,
                    data: recurrenceQueueData
                }))
            }

            await redis.del(`sugestedUsers:${session.userId}`)

            return transactionData.toJSON()

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static createRequestTransaction = async (_: unknown, { data, recurrence }: { data: any, recurrence: any }, context: any) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const validatedData = await TransactionJoiSchema.createTransaction.parseAsync(data)
            const recurrenceData = await TransactionJoiSchema.recurrenceTransaction.parseAsync(recurrence)

            const { user: sender } = session
            const senderAccount = await AccountModel.findOne({
                where: { username: sender.username },
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

            const receiverAccount = await AccountModel.findOne({
                where: {
                    username: validatedData.receiver
                },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                        attributes: { exclude: ['createdAt', 'dniNumber', 'updatedAt', 'faceVideoUrl', 'idBackUrl', 'idFrontUrl', 'profileImageUrl', 'password'] },
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


            if (!senderAccount.toJSON().allowRequestMe)
                throw new GraphQLError(`${receiverAccount.toJSON().username} account does not receive request payment`);

            const message = `${receiverAccount.toJSON().username}&${senderAccount.toJSON().username}@${validatedData.amount}@${ZERO_ENCRYPTION_KEY}&${ZERO_SIGN_PRIVATE_KEY}`
            const signature = await Cryptography.sign(message, ZERO_SIGN_PRIVATE_KEY)

            // Authorization NOT IMPLEMENTED

            const transaction = await TransactionsModel.create({
                senderFullName: senderAccount.toJSON().user.fullName,
                receiverFullName: receiverAccount.toJSON().user.fullName,
                fromAccount: senderAccount.toJSON().id,
                toAccount: receiverAccount.toJSON().id,
                amount: validatedData.amount,
                deliveredAmount: validatedData.amount,
                transactionType: validatedData.transactionType,
                currency: validatedData.currency,
                location: validatedData.location,
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

            await redis.publish(REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED, JSON.stringify({
                data: transactionData.toJSON(),
                senderSocketRoom: senderAccount.toJSON().user.username,
                recipientSocketRoom: receiverAccount.toJSON().user.username
            }))

            if (recurrenceData.time !== "oneTime") {
                const recurrenceQueueData = await TransactionJoiSchema.recurrenceQueueTransaction.parseAsync(Object.assign(transactionData.toJSON(), {
                    amount: validatedData.amount,
                    receiver: validatedData.receiver,
                    sender: senderAccount.toJSON().username
                }))

                await redis.publish(QUEUE_JOBS_NAME.CREATE_TRANSACTION, JSON.stringify({
                    jobId: `${recurrenceData.title}@${shortUUID.generate()}${shortUUID.generate()}`,
                    jobName: recurrenceData.title,
                    jobTime: recurrenceData.time,
                    senderId: senderAccount.toJSON().id,
                    receiverId: receiverAccount.toJSON().id,
                    amount: validatedData.amount,
                    data: recurrenceQueueData
                }))
            }

            return transactionData.toJSON()

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
                        { status: "requested" },
                        { transactionType: "request" },
                        { fromAccount: user.account.id }
                    ]
                }
            })

            if (!transaction)
                throw new GraphQLError("transaction not found");

            await transaction.update({ status: "cancelled" })

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

            await redis.publish(REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_REQUEST_CANCELED, JSON.stringify({
                data: transaction.toJSON(),
                senderSocketRoom: user.username,
                recipientSocketRoom: transactionData.toJSON().to.user.username
            }))
            

            return transactionData.toJSON()

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

                await redis.publish(REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_REQUEST_CANCELED, JSON.stringify({
                    data: transaction.toJSON(),
                    senderSocketRoom: senderAccount.toJSON().user.username,
                    recipientSocketRoom: receiverAccount.toJSON().user.username
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

            await redis.publish(REDIS_SUBSCRIPTION_CHANNEL.BANKING_TRANSACTION_CREATED, JSON.stringify(transaction.toJSON()))

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
                }
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