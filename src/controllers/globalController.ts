import { checkForProtectedRequests } from '@/helpers'
import { GraphQLError } from 'graphql';
import { Cryptography } from '@/helpers/cryptography';
import { ZERO_SIGN_PRIVATE_KEY, ZERO_ENCRYPTION_KEY, REDIS_SUBSCRIPTION_CHANNEL, QUEUE_JOBS_NAME } from '@/constants';
import redis from '@/redis';
import shortUUID from 'short-uuid';
import { AccountModel, BankingTransactionsModel, TransactionsModel, UsersModel } from '@/models';
import { fn, literal, Op } from 'sequelize';
import { AccountZodSchema } from '@/auth';


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
            const session = await checkForProtectedRequests(req);
            const { user } = session
            const transactions = await TransactionsModel.findAll({
                limit: 1,
                order: [['createdAt', 'DESC']],
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

                        include: [{
                            model: UsersModel,
                            as: 'user',
                            where: {
                                fullName: {
                                    [Op.iLike]: `%${"yopi"}%`
                                }
                            }
                        }]
                    },
                    {
                        model: AccountModel,
                        as: 'to',
                        include: [{
                            model: UsersModel,
                            as: 'user',
                            where: {
                                fullName: {
                                    [Op.iLike]: `%${"yopi"}%`
                                }
                            }
                        }]
                    }
                ]
            })



            console.log(JSON.stringify(transactions, null, 2));

            return null;

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

}