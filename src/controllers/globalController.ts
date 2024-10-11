import { checkForProtectedRequests } from '@/helpers'
import { GraphQLError } from 'graphql';
import { Cryptography } from '@/helpers/cryptography';
import { ZERO_SIGN_PRIVATE_KEY, ZERO_ENCRYPTION_KEY } from '@/constants';
import { AccountModel, TransactionsModel, UsersModel } from '@/models';


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
            // console.log(context.req.session);
            const account = await AccountModel.findOne({
                where: {
                    username: req.session.user.username
                },
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
                ]
            })

            console.log(account?.toJSON());

            return null

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

}