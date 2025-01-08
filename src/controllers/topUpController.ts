import shortUUID from "short-uuid";
import { QUEUE_JOBS_NAME, ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from "@/constants";
import { Cryptography } from "@/helpers/cryptography";
import { QueuesModel, TopUpsModel } from "@/models";
import { JobJson } from "bullmq";
import { Op } from "sequelize";
import { TopUpSchema } from "@/auth/topUpSchema";
import { topUpQueue } from "@/queues";


export class TopUpController {
    static prosessTopUp = async ({ repeatJobKey }: JobJson): Promise<string> => {
        try {
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

            if (queue.toJSON().jobName === "pendingTopUp") {
                const decryptedData = await Cryptography.decrypt(queue.toJSON().data)
                const { id, referenceId } = JSON.parse(decryptedData)

                // [TODO]: implement pending transaction
                const isTrue = true
                if (isTrue) {

                    console.log(JSON.parse(decryptedData));
                    

                    const toptup = await TopUpsModel.findOne({
                        where: {
                            id
                        }
                    })

                    if (!toptup)
                        throw "toptup not found";

                    await toptup.update({
                        status: "completed"
                    })

                    return "toptupStatusCompleted"
                }

                await queue.update({
                    repeatedCount: queue.toJSON().repeatedCount + 1
                })

                return queue.toJSON().jobName

            } else {
                const { jobId, jobName, jobTime, receiverId, senderId, amount, signature, data } = queue.toJSON()
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
                    const topUpData = await TopUpSchema.createFromQueueTopUp.parseAsync(decryptedData)

                    await TopUpsModel.create({
                        ...topUpData,
                        status: "pending",
                        referenceId: `${shortUUID().uuid()}`, // [TODO]: Implement topup externally 
                    })

                    await queue.update({
                        repeatedCount: queue.toJSON().repeatedCount + 1
                    })
                }

                return "createTopUp"
            }

        } catch (error) {
            console.log({ prosessTransaction: error });
            throw error
        }
    }

    static listenToRedisEvent = async ({ channel, payload }: { channel: string, payload: string }) => {
        switch (channel) {
            case QUEUE_JOBS_NAME.PENDING_TOPUP: {
                const { jobName, jobTime, jobId, amount, userId, data } = JSON.parse(payload);
                const encryptedData = await Cryptography.encrypt(JSON.stringify(data));

                await topUpQueue.createJobs({ jobId, jobName, jobTime, amount, userId, data: encryptedData });
            }

            default: {
                break;
            }
        }
    }
}