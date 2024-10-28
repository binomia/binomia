import { AccountModel, TransactionsModel, UsersModel } from '@/models'
import { checkForProtectedRequests, GET_LAST_SUNDAY_DATE, getQueryResponseFields } from '@/helpers'
import { GraphQLError } from 'graphql';
import { AccountZodSchema } from '@/joi';
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

    static account = async (_: unknown, { hash }: { hash: string }, { __, req }: { __: any, req: any }, { fieldNodes }: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(req);

            const fields = getQueryResponseFields(fieldNodes, 'account', false, true)
            const user = await AccountModel.findOne({
                where: {
                    hash: req.session.user.account.hash
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
            await checkForProtectedRequests(req);

            const accountPermissions = await AccountZodSchema.updateAccountPermissions.parseAsync(data)
            const fields = getQueryResponseFields(fieldNodes, 'account', false, true)


            const account = await AccountModel.findOne({
                where: {
                    id: req.session.user.account.id
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
            await checkForProtectedRequests(req);
            const fields = getQueryResponseFields(fieldNodes, 'account', false, true)

            const account = await TransactionsModel.findAll({
                where: {
                    [Op.or]: [
                        {
                            [Op.and]: [
                                { fromAccount: req.session.user.account.id },
                                { createdAt: { [Op.gte]: GET_LAST_SUNDAY_DATE() } }
                            ]
                        },
                        {
                            [Op.and]: [
                                { toAccount: req.session.user.account.id },
                                { createdAt: { [Op.gte]: GET_LAST_SUNDAY_DATE() } }
                            ]
                        }
                    ]
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'from',
                        attributes: ["id"]
                    },
                    {
                        model: AccountModel,
                        as: 'to',
                        attributes: ["id"]
                    }
                ]
            })

            console.log(account);

            return account

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }
}