import { ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from "@/constants";
import { Cryptography } from "@/helpers/cryptography";
import { QueueTransactionsModel, TransactionsModel } from "@/models";
import { Job, JobJson } from "bullmq";
import { Op } from "sequelize";
import TransactionController from "./transactionController";
import { TransactionJoiSchema } from "@/auth/transactionJoiSchema";
import { WeeklyQueueTitleType } from "@/types";

interface RecurrenceTransactionsParams extends JobJson {
    receiverId: number,
    senderId: number,
    amount: number,
    jobName: string
    jobTime: WeeklyQueueTitleType
}

export class QueueTransactionsController {
    static createTransaction = async (transactionData: RecurrenceTransactionsParams) => {
        const { repeatJobKey, receiverId, senderId, jobTime, jobName, amount, id, timestamp, data } = transactionData
        const hash = await Cryptography.hash(JSON.stringify({
            jobId: id,
            receiverId,
            senderId,
            amount,
            repeatJobKey,
            jobTime,
            jobName,
            ZERO_ENCRYPTION_KEY
        }))

        const signature = await Cryptography.sign(hash, ZERO_SIGN_PRIVATE_KEY)
        const transaction = await QueueTransactionsModel.create({
            jobId: id,
            receiverId,
            senderId,
            amount,
            repeatJobKey,
            jobName,
            jobTime,
            timestamp,
            status: "active",
            repeatedCount: 0,
            data,
            signature
        })

        return transaction.toJSON()
    }

    static prosessTransaction = async ({ repeatJobKey }: JobJson): Promise<string> => {
        try {
            const queueTransaction = await QueueTransactionsModel.findOne({
                where: {
                    [Op.and]: [
                        { repeatJobKey },
                        { status: "active" }
                    ]
                }
            })

            if (!queueTransaction)
                throw "transaction not found";

            if (queueTransaction.toJSON().jobName === "pendingTransaction") {
                // [TODO]: implement pending transaction
                const isTrue = true
                if (isTrue) {
                    const decryptedData = await Cryptography.decrypt(queueTransaction.toJSON().data)
                    const { transactionId } = JSON.parse(decryptedData)

                    const transaction = await TransactionsModel.findOne({
                        where: {
                            transactionId
                        }
                    })

                    if (!transaction)
                        throw "transaction not found";

                    await transaction.update({
                        status: "completed"
                    })

                    return "transactionStatusCompleted"
                }

                await queueTransaction.update({
                    repeatedCount: queueTransaction.toJSON().repeatedCount + 1
                })

                return queueTransaction.toJSON().jobName

            } else {
                const { jobId, jobName, jobTime, receiverId, senderId, amount, signature, data } = queueTransaction.toJSON()
                const hash = await Cryptography.hash(JSON.stringify({
                    jobId,
                    receiverId,
                    senderId,
                    amount,
                    repeatJobKey,
                    jobTime,
                    jobName,
                    ZERO_ENCRYPTION_KEY
                }))


                const verify = await Cryptography.verify(hash, signature, ZERO_SIGN_PRIVATE_KEY)
                if (verify) {
                    const decryptedData = await Cryptography.decrypt(data)
                    const validatedData = await TransactionJoiSchema.createTransaction.parseAsync(JSON.parse(decryptedData))

                    await TransactionController.createTransaction(validatedData)
                    await queueTransaction.update({
                        repeatedCount: queueTransaction.toJSON().repeatedCount + 1
                    })
                }

                return "createTransaction"
            }

        } catch (error) {
            console.log({ prosessTransaction: error });
            throw error
        }
    }

    static inactiveTransaction = async (repeatJobKey: string) => {
        const transaction = await QueueTransactionsModel.findOne({
            where: {
                [Op.and]: [
                    { repeatJobKey },
                    { status: "active" }
                ]
            }
        })

        if (!transaction)
            throw "transaction not found";

        await transaction.update({
            status: "inactive",
            repeatedCount: transaction.toJSON().repeatedCount + 1
        })

        return (await transaction.reload()).toJSON()
    }
}