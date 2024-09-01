import { AccountModel, UsersModel } from '@/models'
import { getQueryResponseFields } from '@/helpers'
import { GraphQLError } from 'graphql';

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
}