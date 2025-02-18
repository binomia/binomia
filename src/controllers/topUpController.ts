import shortUUID from "short-uuid";
import { QUEUE_JOBS_NAME, ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from "@/constants";
import { Cryptography } from "@/helpers/cryptography";
import { AccountModel, QueuesModel, TopUpCompanyModel, TopUpPhonesModel, TopUpsModel, UsersModel } from "@/models";
import { JobJson } from "bullmq";
import { Op } from "sequelize";
import { TopUpSchema } from "@/auth/topUpSchema";
import { topUpQueue } from "@/queues";


export default class TopUpController {
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

    static createTopUp = async (job: JobJson) => {
        try {
            const { fullName, amount, companyId, phoneNumber, location, senderUsername, recurrenceData, userId } = JSON.parse(job.data)
            console.log(location);

            const [phone] = await TopUpPhonesModel.findOrCreate({
                limit: 1,
                where: {
                    [Op.and]: [
                        { phone: phoneNumber },
                        { userId }
                    ]
                },
                defaults: {
                    fullName: fullName,
                    phone: phoneNumber,
                    userId,
                    companyId: companyId
                }
            })

            const senderAccount = await AccountModel.findOne({
                where: {
                    username: senderUsername
                }
            })

            if (!senderAccount)
                throw 'Sender account not found'

            const receiverAccount = await AccountModel.findOne({
                attributes: { exclude: ['username'] },
                where: {
                    username: "$binomia"
                }
            })

            if (!receiverAccount)
                throw 'Receiver account not found'

            if (senderAccount.toJSON().balance < amount)
                throw "insufficient balance";

            if (!senderAccount.toJSON().allowSend)
                throw "sender account is not allowed to send money";

            if (!receiverAccount.toJSON().allowReceive)
                throw "receiver account is not allowed to receive money"


            // [TODO]: Implement topup externally
            const topUp = await TopUpsModel.create({
                companyId: companyId,
                userId,
                location,
                phoneId: phone.toJSON().id,
                amount: amount,
                status: 'pending',
                referenceId: `${shortUUID().uuid()}`, // [TODO]: Implement topup externally 
            })

            const newSenderBalance = Number(senderAccount.toJSON().balance - amount).toFixed(4)
            await senderAccount.update({
                balance: Number(newSenderBalance)
            })

            const newReceiverBalance = Number(receiverAccount.toJSON().balance + amount).toFixed(4)
            await receiverAccount.update({
                balance: Number(newReceiverBalance)
            })

            await phone.update({
                lastUpdated: Date.now()
            })

            await topUp.reload({
                include: [
                    {
                        model: TopUpCompanyModel,
                        as: 'company',
                    },
                    {
                        model: UsersModel,
                        as: 'user',
                    },
                    {
                        model: TopUpPhonesModel,
                        as: 'phone',
                    }
                ]
            })

            const encryptedData = await Cryptography.encrypt(JSON.stringify({
                id: topUp.toJSON().id,
                phone: phoneNumber,
                amount: amount,
                referenceId: topUp.toJSON().referenceId
            }))

            await topUpQueue.createJobs({
                jobId: `pendingTopUp@${shortUUID.generate()}${shortUUID.generate()}`,
                jobName: "pendingTopUp",
                jobTime: "everyThirtyMinutes",
                referenceData: {
                    fullName: fullName,
                    logo: topUp.toJSON().company.logo,
                },
                amount,
                userId,
                data: encryptedData
            });

            if (recurrenceData.time !== "oneTime") {
                await topUpQueue.createJobs({
                    jobId: `${recurrenceData.title}@${recurrenceData.time}@${shortUUID.generate()}${shortUUID.generate()}`,
                    jobName: recurrenceData.title,
                    jobTime: recurrenceData.time,

                    referenceData: {
                        fullName,
                        logo: topUp.toJSON().company.logo,
                    },
                    amount,
                    userId,
                    data: encryptedData
                });
            }

            return null

        } catch (error: any) {
            throw error
        }
    }

    static listenToRedisEvent = async ({ channel, payload }: { channel: string, payload: string }) => {
        switch (channel) {
            case QUEUE_JOBS_NAME.PENDING_TOPUP: {
                const { jobName, jobTime, referenceData, jobId, amount, userId, data } = JSON.parse(payload);
                const encryptedData = await Cryptography.encrypt(JSON.stringify(data));

                await topUpQueue.createJobs({ jobId, referenceData, jobName, jobTime, amount, userId, data: encryptedData });
                break;
            }
            case QUEUE_JOBS_NAME.CREATE_TOPUP: {
                const { jobName, jobTime, jobId, referenceData, amount, userId, data } = JSON.parse(payload);
                const encryptedData = await Cryptography.encrypt(JSON.stringify(data));

                await topUpQueue.createJobs({ jobId, referenceData, jobName, jobTime, amount, userId, data: encryptedData });
                break;
            }
            case QUEUE_JOBS_NAME.QUEUE_TOPUP: {
                const { jobName, jobTime, jobId, amount, userId, data } = JSON.parse(payload);
                await topUpQueue.createJobs({
                    jobId,
                    jobName,
                    jobTime,
                    referenceData: null,
                    amount,
                    userId,
                    data: JSON.parse(data)
                });
                break;
            }

            default: {
                break;
            }
        }
    }
} 