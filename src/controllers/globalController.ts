import { checkForProtectedRequests } from '@/helpers'
import { GraphQLError } from 'graphql';
import { Cryptography } from '@/helpers/cryptography';
import { ZERO_SIGN_PRIVATE_KEY, ZERO_ENCRYPTION_KEY } from '@/constants';
import { AccountModel, TransactionsModel, UsersModel } from '@/models';
import { Op } from 'sequelize';


export class GlobalController {
    static signData = async (_: unknown, { hash }: { hash: string }, context: any) => {
        try {
            await checkForProtectedRequests(context.req);

            const hashData = await Cryptography.hash(JSON.stringify({
                hash,
                ZERO_ENCRYPTION_KEY,
                ZERO_SIGN_PRIVATE_KEY
            }))

            console.log({ hashData, ZERO_ENCRYPTION_KEY, hash });

            const signature = Cryptography.sign(hashData, ZERO_SIGN_PRIVATE_KEY)
            return signature

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }
    static test = async (_: unknown, { hash }: { hash: string }, { req }: { req: any }) => {
        try {
            await checkForProtectedRequests(req);
            const transactions = await TransactionsModel.findAll({
                where: {
                    [Op.or]: [
                        { fromAccount: req.session.user.account.id },
                        { toAccount: req.session.user.account.id }
                    ]
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'from',
                        attributes: ["id"],
                        include: [
                            {
                                model: UsersModel,
                                as: 'user',
                                // attributes: ["id"]
                            }
                        ]
                    },
                    {
                        model: AccountModel,
                        as: 'to',
                        attributes: ["id"],
                        include: [
                            {
                                model: UsersModel,
                                as: 'user',
                                // attributes: []
                            }
                        ]
                    }
                ]
            })

            const users = transactions.reduce((acc: any[], item: any) => {
                // Check if the 'from' user is not the current user and is not already in the array
                if (item.from && item.from.user.id !== req.session.user.id &&
                    !acc.some((user) => user.id === item.from.user.id)) {
                    acc.push(item.from.user.toJSON());
                }

                // Check if the 'to' user is not the current user and is not already in the array
                if (item.to && item.to.user.id !== req.session.user.id &&
                    !acc.some((user) => user.id === item.to.user.id)) {
                    acc.push(item.to.user.toJSON());
                }

                return acc;
            }, []);

            return null

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

}