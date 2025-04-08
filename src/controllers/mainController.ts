import { QUEUE_JOBS_NAME, ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from "@/constants";
import { QueuesModel } from "@/models";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { JobJson, Queue } from "bullmq";
import { HASH, RSA } from "cryptografia";
import { Op } from "sequelize";


interface RecurrenceTransactionsParams extends JobJson {
    userId: number,
    amount: number,
    queueType: string
    referenceData: any
    jobName: string
    jobTime: string
    status?: string
}


export default class MainController {
    static createQueue = async (transactionData: RecurrenceTransactionsParams) => {
        try {
            const { repeatJobKey, referenceData, userId, queueType, jobTime, status = "active", jobName, amount, id, timestamp, data } = transactionData
            const queue = await QueuesModel.findOne({
                where: { repeatJobKey }
            })

            if (queue) return

            const hash = await HASH.sha256Async(JSON.stringify({
                jobTime,
                jobName,
                amount,
                repeatJobKey,
                ZERO_ENCRYPTION_KEY
            }))

            const signature = await RSA.sign(hash, ZERO_SIGN_PRIVATE_KEY)
            const transaction = await QueuesModel.create({
                jobId: id,
                userId,
                amount,
                repeatJobKey,
                queueType,
                jobName,
                jobTime,
                timestamp,
                status,
                repeatedCount: 0,
                data,
                referenceData: referenceData ?? null,
                signature
            })

            return transaction.toJSON()

        } catch (error) {
            throw error
        }
    }

    static inactiveTransaction = async (repeatJobKey: string, status: string = "completed") => {
        try {
            const queue = await QueuesModel.findOne({
                where: {
                    repeatJobKey
                }
            })

            if (!queue)
                throw "queue not found";

            const filter = {
                status,
                repeatedCount: queue.toJSON().repeatedCount + 1
            }

            await queue.update(status !== "cancelled" ? filter : { status })

            return (await queue.reload()).toJSON()

        } catch (error) {
            throw error
        }
    }

    static updateQueue = async (repeatJobKey: string, newData: any) => {
        try {
            const queue = await QueuesModel.findOne({
                where: {
                    repeatJobKey
                }
            })

            if (!queue)
                throw "queue not found";

            await queue.update({
                ...newData
            })

            return (await queue.reload()).toJSON()

        } catch (error) {
            throw error
        }
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