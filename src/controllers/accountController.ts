import { AccountModel, TransactionsModel, UsersModel } from '@/models'
import { checkForProtectedRequests, getQueryResponseFields } from '@/helpers'
import { GraphQLError } from 'graphql';
import { Op } from 'sequelize';

export class AccountController {
    static accounts = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, _context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const fields = getQueryResponseFields(fieldNodes, 'accounts', false, true)

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const offset = (page - 1) * _pageSize;
            const limit = _pageSize;

            const users = await AccountModel.findAll({
                limit,
                offset,
                attributes: fields['accounts'],
                include: [{
                    model: UsersModel,
                    as: 'user',
                    attributes: fields['user']
                }]
            })

            return users

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static account = async (_: unknown, { hash }: { hash: string }, __: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const fields = getQueryResponseFields(fieldNodes, 'account', false, true)
            const user = await AccountModel.findOne({
                where: {
                    hash
                },
                attributes: fields['accounts'],
                include: [{
                    model: UsersModel,
                    as: 'user',
                    attributes: fields['user']
                }]
            })

            return user

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }


    static accountTransactions = async (_: unknown, { page, pageSize, accountId }: { page: number, pageSize: number, accountId: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'transactions')

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const limit = _pageSize;
            const offset = (page - 1) * _pageSize;


            const transactions = await TransactionsModel.findAll({
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                attributes: fields['transactions'],
                where: {
                    [Op.or]: [
                        {
                            senderId: accountId
                        },
                        {
                            receiverId: accountId
                        }
                    ]
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'sender',
                        attributes: fields['sender'],
                        include: [
                            {
                                model: UsersModel,
                                as: 'user',
                                attributes: fields['user']
                            }
                        ]
                    },
                    {
                        model: AccountModel,
                        as: 'receiver',
                        attributes: fields['receiver'],
                        include: [
                            {
                                model: UsersModel,
                                as: 'user',
                                attributes: fields['user']
                            }
                        ]
                    }
                ]
            })

            if (!transactions) return []

            console.log(transactions);

            return transactions

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }
}