import { AccountModel, kycModel, TransactionsModel, UsersModel } from '@/models'
import { checkForProtectedRequests, getQueryResponseFields, } from '@/helpers'
import { GraphQLError } from 'graphql';
import { TransactionJoiSchema } from '@/joi/transactionJoiSchema';
import { TransactionCreateType, TransactionAuthorizationType } from '@/types';
import { authServer } from '@/rpc';
import { Cryptography } from '@/helpers/cryptography';
import { ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from '@/constants';
import { Op } from 'sequelize';


export class TransactionsController {
    static createTransaction = async (_: unknown, { data }: { data: any }, context: any) => {
        try {
            await checkForProtectedRequests(context.req);
            const validatedData: TransactionCreateType = await TransactionJoiSchema.createTransaction.validateAsync(data)

            const { user: sender } = context.req.session
            const senderAccount = await AccountModel.findOne({
                where: { username: sender.username },
                include: [
                    {
                        model: TransactionsModel,
                        as: 'incomingTransactions',
                        limit: 1,
                        order: [['createdAt', 'DESC']],
                        attributes: ['id', 'createdAt', 'updatedAt', 'amount', 'fromAccount', 'toAccount', 'status']
                    },
                    {
                        model: TransactionsModel,
                        as: 'outgoingTransactions',
                        limit: 1,
                        order: [['createdAt', 'DESC']],
                        attributes: ['id', 'createdAt', 'updatedAt', 'amount', 'fromAccount', 'toAccount', 'status']
                    },
                    {
                        model: TransactionsModel,
                        as: 'incomingTransactions',
                        limit: 1,
                        order: [['createdAt', 'DESC']],
                        attributes: ['id', 'createdAt', 'updatedAt', 'amount', 'fromAccount', 'toAccount', 'status']
                    },
                    {
                        model: TransactionsModel,
                        as: 'outgoingTransactions',
                        limit: 1,
                        order: [['createdAt', 'DESC']],
                        attributes: ['id', 'createdAt', 'updatedAt', 'amount', 'fromAccount', 'toAccount', 'status']
                    },
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
                    },
                    {
                        model: TransactionsModel,
                        as: 'incomingTransactions',
                        limit: 1,
                        order: [['createdAt', 'DESC']],
                        attributes: ['id', 'createdAt', 'updatedAt', 'amount', 'fromAccount', 'toAccount', 'status']
                    },
                    {
                        model: TransactionsModel,
                        as: 'outgoingTransactions',
                        limit: 1,
                        order: [['createdAt', 'DESC']],
                        attributes: ['id', 'createdAt', 'updatedAt', 'amount', 'fromAccount', 'toAccount', 'status']
                    }
                ]
            })


            if (!receiverAccount)
                throw new GraphQLError("receiver account not found");

            const dataToHash = await Cryptography.hash(JSON.stringify({
                receiverUsername: validatedData.receiver,
                receiver: validatedData.receiver,
                amount: validatedData.amount,
                transactionType: validatedData.transactionType,
                currency: validatedData.currency,
                location: validatedData.location
            }))

            const hash = await Cryptography.hash(JSON.stringify({
                hash: dataToHash,
                ZERO_ENCRYPTION_KEY,
                ZERO_SIGN_PRIVATE_KEY,
            }))

            const signature = await Cryptography.sign(hash, ZERO_SIGN_PRIVATE_KEY)
            // const transactionAuthorization: TransactionAuthorizationType = await authServer("authorizeTransaction", {
            //     amount: validatedData.amount,
            //     currency: validatedData.currency,
            //     transactionType: validatedData.transactionType,
            //     location: validatedData.location,
            //     userId: sender.id,
            //     sender,
            //     receiver: receiverAccount.toJSON(),
            //     signature
            // });


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

            return Object.assign(transaction.toJSON(), {}, {
                receiver: receiverAccount.toJSON().user
            })

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static accountTransactions = async (_: unknown, { page, pageSize, accountId }: { page: number, pageSize: number, accountId: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'transactions')
            const { user } = context.req.session

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
            console.error(error);
            throw new GraphQLError(error.message);
        }
    }
}