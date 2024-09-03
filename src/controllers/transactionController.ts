import { AccountModel, UsersModel, TransactionsModel } from '@/models'
import { checkForProtectedRequests, getQueryResponseFields } from '@/helpers'
import { GraphQLError } from 'graphql';
import { Op } from 'sequelize';

export class TransactionsController {
    static transactions = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'transactions')

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const offset = (page - 1) * _pageSize;
            const limit = _pageSize;

            const transactions = await TransactionsModel.findAll({
                limit,
                offset,
                attributes: fields['transactions'],
                where: {
                    [Op.or]: [
                        { senderId: context.req.jwtData.userId },
                        { receiverId: context.req.jwtData.userId }
                    ]
                },
                include: [
                    {
                        model: UsersModel,
                        as: "receiver",
                        attributes: fields['receiver']
                    }
                ]
            })

            return transactions

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }
}