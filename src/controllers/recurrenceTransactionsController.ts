import { ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from "@/constants";
import { Cryptography } from "@/helpers/cryptography";
import { RecurrenceTransactionsModel } from "@/models";
import { Job } from "bullmq";
import { Op } from "sequelize";
import TransactionController from "./transactionController";
import { TransactionJoiSchema } from "@/auth/transactionJoiSchema";


export class RecurrenceTransactionsController {
    static createTransaction = async (transactionData: any) => {
        const { repeatJobKey, accountId, id, name, timestamp, data, opts: { repeat } } = transactionData
        const hash = await Cryptography.hash(JSON.stringify({
            jobId: id,
            accountId,
            repeatJobKey,
            jobName: name,
            ZERO_ENCRYPTION_KEY
        }))

        const signature = await Cryptography.sign(hash, ZERO_SIGN_PRIVATE_KEY)
        const transaction = await RecurrenceTransactionsModel.create({
            jobId: id,
            accountId,
            repeatJobKey,
            jobName: name,
            timestamp,
            status: "active",
            repeatedCount: 0,
            data,
            signature
        })

        return transaction
    }

    static prosessTransaction = async (job: Job) => {
        try {
            const { repeatJobKey } = job.asJSON()

            const transaction = await RecurrenceTransactionsModel.findOne({
                where: {
                    [Op.and]: [
                        { repeatJobKey },
                        { status: "active" }
                    ]
                }
            })

            if (!transaction)
                throw "transaction not found";

            const { jobId, jobName, signature, accountId, data } = transaction.toJSON()
            const hash = await Cryptography.hash(JSON.stringify({
                jobId,
                accountId,
                repeatJobKey,
                jobName,
                ZERO_ENCRYPTION_KEY
            }))



            const verify = await Cryptography.verify(hash, signature, ZERO_SIGN_PRIVATE_KEY)

            if (verify) {
                const decryptedData = await Cryptography.decrypt(data)
                const validatedData = await TransactionJoiSchema.createTransaction.parseAsync(JSON.parse(decryptedData))

                await TransactionController.createTransaction(validatedData)

                await transaction.update({
                    repeatedCount: transaction.toJSON().repeatedCount + 1
                })
            }

            return (await transaction.reload()).toJSON()

        } catch (error) {
            console.log({ prosessTransaction: error });

        }
    }
    static inactiveTransaction = async (repeatJobKey: string) => {
        const transaction = await RecurrenceTransactionsModel.findOne({
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
            status: "inactive"
        })

        return (await transaction.reload()).toJSON()
    }
}