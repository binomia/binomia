import { AccountModel, BankingTransactionsModel, TransactionsModel, UsersModel } from '@/models'
import { checkForProtectedRequests, GET_LAST_SUNDAY_DATE, getQueryResponseFields } from '@/helpers'
import { GraphQLError } from 'graphql';
import { AccountZodSchema } from '@/auth';
import { Op } from 'sequelize';
import redis from '@/redis';

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

    static account = async (_: unknown, { hash }: { hash: string }, { __, req }: { __: any, req: any }, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(req);

            const fields = getQueryResponseFields(fieldNodes, 'account', false, true)
            const user = await AccountModel.findOne({
                where: {
                    hash: session.user.account.hash
                },
                attributes: fields['account']
            })

            return user

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }
    static accountPermissions = async (_: unknown, ___: unknown, { __, req }: { __: any, req: any }, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(req);

            const fields = getQueryResponseFields(fieldNodes, 'account', false, true)
            const user = await AccountModel.findOne({
                where: {
                    hash: session.user.account.hash
                },
                attributes: fields['account']
            })

            return user

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static updateAccountPermissions = async (_: unknown, { data }: { data: any }, { __, req }: { __: any, req: any }, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(req);

            const accountPermissions = await AccountZodSchema.updateAccountPermissions.parseAsync(data)
            const fields = getQueryResponseFields(fieldNodes, 'account', false, true)

            const account = await AccountModel.findOne({
                where: {
                    id: session.user.account.id
                },
                attributes: fields['updateAccount'],
                include: [{
                    model: UsersModel,
                    as: 'user',
                    attributes: fields['user']
                }]
            })

            if (!account) {
                throw new GraphQLError('Account not found');
            }

            const updatedAccount = await account.update(accountPermissions)
            return updatedAccount

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static accountLimit = async (_: unknown, { data }: { data: any }, { __, req }: { __: any, req: any }, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(req);

            const accountLimit = await redis.get(`accountLimit@${session.user.account.id}`)

            if (accountLimit)
                return JSON.parse(accountLimit)

            const now: Date = new Date();
            const dayOfWeek: number = now.getDay();
            const daysSinceMonday: number = (dayOfWeek + 6) % 7;
            const lastMonday: Date = new Date(now);

            lastMonday.setDate(now.getDate() - daysSinceMonday);
            lastMonday.setHours(0, 0, 0, 0);

            const sentAmount = await TransactionsModel.sum('deliveredAmount', {
                where: {
                    [Op.and]: {
                        createdAt: {
                            [Op.gte]: lastMonday
                        },
                        fromAccount: session.user.account.id
                    }
                }
            });

            const receivedAmount = await TransactionsModel.sum('deliveredAmount', {
                where: {
                    [Op.and]: {
                        createdAt: {
                            [Op.gte]: lastMonday
                        },
                        toAccount: session.user.account.id,
                    }
                }
            });

            const depositAmount = await BankingTransactionsModel.sum('deliveredAmount', {
                where: {
                    [Op.and]: {
                        createdAt: {
                            [Op.gte]: lastMonday
                        },
                        accountId: session.user.account.id,
                        transactionType: 'deposit'
                    }
                }
            });

            const withdrawAmount = await BankingTransactionsModel.sum('deliveredAmount', {
                where: {
                    [Op.and]: {
                        createdAt: {
                            [Op.gte]: lastMonday
                        },
                        accountId: session.user.account.id,
                        transactionType: 'withdraw'
                    }
                }
            });

            const limits = await AccountZodSchema.accountLimits.parseAsync({
                receivedAmount,
                sentAmount,
                depositAmount,
                withdrawAmount
            });

            await redis.set(`accountLimit@${session.user.account.id}`, JSON.stringify(limits), 'EX', 10)

            return limits;

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }
}