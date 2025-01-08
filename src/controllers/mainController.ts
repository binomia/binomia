import { QUEUE_JOBS_NAME, ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from "@/constants";
import { Cryptography } from "@/helpers/cryptography";
import { QueuesModel } from "@/models";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { JobJson, Queue } from "bullmq";
import { Op } from "sequelize";


interface RecurrenceTransactionsParams extends JobJson {
    userId: number,
    amount: number,
    jobName: string
    jobTime: string
    status?: string
}


export default class MainController {
    static createQueue = async (transactionData: RecurrenceTransactionsParams) => {
        const { repeatJobKey, userId, jobTime, status = "active", jobName, amount, id, timestamp, data } = transactionData
        const hash = await Cryptography.hash(JSON.stringify({
            jobId: id,
            userId,
            amount,
            repeatJobKey,
            jobTime,
            jobName,
            ZERO_ENCRYPTION_KEY
        }))

        const signature = await Cryptography.sign(hash, ZERO_SIGN_PRIVATE_KEY)
        const transaction = await QueuesModel.create({
            jobId: id,
            userId,
            amount,
            repeatJobKey,
            jobName,
            jobTime,
            timestamp,
            status,
            repeatedCount: 0,
            data,
            signature
        })

        return transaction.toJSON()
    }

    static inactiveTransaction = async (repeatJobKey: string, status: string = "completed") => {
        const queue = await QueuesModel.findOne({
            where: {
                [Op.and]: [
                    { repeatJobKey },
                    { status: "active" }
                ]
            }
        })

        if (!queue)
            throw "queue not found";

        await queue.update({
            status,
            repeatedCount: queue.toJSON().repeatedCount + 1
        })

        return (await queue.reload()).toJSON()
    }

    static listenToRedisEvent = async ({ channel, payload, bullDashboard }: { channel: string, payload: string, bullDashboard: ReturnType<typeof createBullBoard> }) => {
        switch (channel) {
            case QUEUE_JOBS_NAME.CREATE_NEW_QUEUE: {
                const queue = new Queue(payload, { connection: { host: "redis", port: 6379 } });
                const adapter = new BullMQAdapter(queue);

                bullDashboard.addQueue(adapter);
                break;
            }

            default: {
                break;
            }
        }
    }

}