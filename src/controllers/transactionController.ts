import { TransactionJoiSchema } from "@/auth/transactionJoiSchema"
import { QUEUE_JOBS_NAME, REDIS_SUBSCRIPTION_CHANNEL, ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from "@/constants"
import { Cryptography } from "@/helpers/cryptography"
import { AccountModel, TransactionsModel, UsersModel } from "@/models"
import { redis } from "@/redis"
import { CreateTransactionType } from "@/types"
import { Job } from "bullmq"

export default class TransactionController {
    static createTransaction = async (data: CreateTransactionType) => {
        try {
            const validatedData = await TransactionJoiSchema.createTransaction.parseAsync(data)
            const senderAccount = await AccountModel.findOne({
                where: { username: validatedData.sender },
                include: [
                    {
                        model: UsersModel,
                        as: 'user'
                    }
                ]
            })

            if (!senderAccount)
                throw "sender account not found";

            const receiverAccount = await AccountModel.findOne({
                where: {
                    username: validatedData.receiver
                },
                include: [
                    {
                        model: UsersModel,
                        as: 'user'
                    }
                ]
            })

            if (!receiverAccount)
                throw "receiver account not found";

            const hash = await Cryptography.hash(JSON.stringify({
                ZERO_ENCRYPTION_KEY,
                ZERO_SIGN_PRIVATE_KEY,
                hash: {
                    receiverUsername: validatedData.receiver,
                    receiver: validatedData.receiver,
                    amount: validatedData.amount,
                    transactionType: validatedData.transactionType,
                    currency: validatedData.currency,
                    location: validatedData.location
                }
            }))


            const signature = await Cryptography.sign(hash, ZERO_SIGN_PRIVATE_KEY)
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

            const transactionData = await transaction.reload({
                include: [
                    {
                        model: AccountModel,
                        as: 'from',
                        include: [{
                            model: UsersModel,
                            as: 'user',
                        }]
                    },
                    {
                        model: AccountModel,
                        as: 'to',
                        include: [{
                            model: UsersModel,
                            as: 'user',
                        }]
                    }
                ]
            })

            await Promise.all([
                redis.publish(REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED, JSON.stringify({
                    data: transactionData.toJSON(),
                    senderSocketRoom: senderAccount.toJSON().username,
                    recipientSocketRoom: receiverAccount.toJSON().username
                })),
                redis.publish(REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED_FROM_QUEUE, JSON.stringify({
                    data: transactionData.toJSON(),
                    senderSocketRoom: senderAccount.toJSON().username,
                    recipientSocketRoom: receiverAccount.toJSON().username,
                }))
            ])

            return transactionData.toJSON()

        } catch (error: any) {
            throw error.message
        }
    }

    static updateTransactionStatus = async (job: Job) => {
        try {
            const decryptedData = await Cryptography.decrypt(job.data)
            const { transactionId } = JSON.parse(decryptedData)

            const transaction = await TransactionsModel.findOne({
                where: { transactionId }
            })

            if (!transaction)
                throw "transaction not found";

            if (transaction.toJSON().status !== "completed") {
                const updatedTransaction = await transaction.update({ status: "completed" })
                return updatedTransaction.toJSON()
            }

            return transaction.toJSON()

        } catch (error: any) {
            throw error.message
        }
    }
}