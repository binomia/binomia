import { AccountModel, UsersModel, TransactionsModel } from '@/models'
import { checkForProtectedRequests, getQueryResponseFields } from '@/helpers'
import { GraphQLError } from 'graphql';
import { Op } from 'sequelize';
import { TransactionJoiSchema } from '@/joi/transactionJoiSchema';
import { TransactionCreateType, TransactionModelType, TransactionAuthorizationType } from '@/types';
import { authServer } from '@/rpc';
import { Cryptography } from '@/helpers/cryptography';
import { ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from '@/constants';

export class TransactionsController {
    static createTransaction = async (_: unknown, { data }: { data: any }, context: any) => {
        try {
            await checkForProtectedRequests(context.req);
            const validatedData: TransactionCreateType = await TransactionJoiSchema.createTransaction.validateAsync(data)

            const dataToHash = await Cryptography.hash(JSON.stringify({
                receiver: validatedData.receiver,
                amount: validatedData.amount,
                transactionType: validatedData.transactionType,
                currency: validatedData.currency,
                description: validatedData.description,
                location: validatedData.location
            }))

            const hash = await Cryptography.hash(JSON.stringify({
                hash: dataToHash,
                ZERO_ENCRYPTION_KEY,
                ZERO_SIGN_PRIVATE_KEY,
            }))

            const signature = await Cryptography.sign(hash, ZERO_SIGN_PRIVATE_KEY)
            const transactionAuthorization: TransactionAuthorizationType = await authServer("authorizeTransaction", Object.assign(validatedData, {
                userId: context.req.jwtData.userId,
                signature
            }));

            console.log({ transactionAuthorization });


            const senderAccount = await AccountModel.findOne({
                where: { id: transactionAuthorization.senderId }
            })

            const recieverAccount = await AccountModel.findOne({
                where: { id: transactionAuthorization.receiverId }
            })


            if (!senderAccount || !recieverAccount)
                throw new GraphQLError("sender or reciever account not found");


            const transaction = await TransactionsModel.create({ ...transactionAuthorization })


            await senderAccount.update({
                balance: senderAccount.dataValues.balance - transactionAuthorization.amount
            })

            await recieverAccount.update({
                balance: recieverAccount.dataValues.balance + transactionAuthorization.amount
            })

            return transaction

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }
}