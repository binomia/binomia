import { checkForProtectedRequests, getQueryResponseFields } from '@/helpers'
import { GraphQLError } from 'graphql';
import { TopUpsModel, UsersModel, TopUpCompanyModel, TopUpPhonesModel, AccountModel, kycModel } from '@/models';
import { Op } from 'sequelize';
import { TopUpSchema } from '@/auth';
import shortUUID from 'short-uuid';
import redis from '@/redis';
import { QUEUE_JOBS_NAME } from '@/constants';


export class TopUpController {
    static topUps = async (_: unknown, { phoneId, page, pageSize }: { phoneId: string, page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'topups')

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const offset = (page - 1) * _pageSize;
            const limit = _pageSize;

            const tupups = await TopUpsModel.findAll({
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                attributes: fields['topups'],
                where: {
                    [Op.and]: [
                        { userId: session.userId },
                        { phoneId: phoneId }
                    ]
                }
            })

            return tupups

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static topUpPhones = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'topUpPhones')

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const offset = (page - 1) * _pageSize;
            const limit = _pageSize;

            const phones = await TopUpPhonesModel.findAll({
                limit,
                offset,
                attributes: [...fields['topUpPhones'], "phone"],
                where: {
                    userId: session.userId
                },
                include: [
                    {
                        model: TopUpCompanyModel,
                        as: 'company',
                        attributes: fields['company']
                    }
                ]
            })

            return phones

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static createTopUp = async (_: unknown, { data, recurrence }: { data: any, recurrence: any }, context: any) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const topUpData = await TopUpSchema.createTopUp.parseAsync(data)
            const recurrenceData = await TopUpSchema.recurrenceTopUp.parseAsync(recurrence)


            const [phone] = await TopUpPhonesModel.findOrCreate({
                limit: 1,
                where: {
                    [Op.and]: [
                        { phone: topUpData.phone },
                        { userId: session.userId }
                    ]
                },
                defaults: {
                    fullName: topUpData.fullName,
                    phone: topUpData.phone,
                    userId: session.userId,
                    companyId: topUpData.companyId
                }
            })

            const { user: sender } = session
            const senderAccount = await AccountModel.findOne({
                where: { username: sender.username },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                        attributes: { exclude: ['createdAt', 'dniNumber', 'updatedAt', 'faceVideoUrl', 'idBackUrl', 'idFrontUrl', 'profileImageUrl', 'password'] },
                        include: [
                            {
                                model: kycModel,
                                as: 'kyc',
                                attributes: ['id', 'dniNumber', 'dob', 'status', 'expiration']
                            }
                        ]
                    }
                ]
            })

            if (!senderAccount)
                throw new GraphQLError('Sender account not found')


            const receiverAccount = await AccountModel.findOne({
                attributes: { exclude: ['username'] },
                where: {
                    username: "$binomia"
                },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                        attributes: { exclude: ['createdAt', 'dniNumber', 'updatedAt', 'faceVideoUrl', 'idBackUrl', 'idFrontUrl', 'profileImageUrl', 'password'] },
                        include: [
                            {
                                model: kycModel,
                                as: 'kyc',
                                attributes: ['id', 'dniNumber', 'dob', 'status', 'expiration']
                            }
                        ]
                    }
                ]
            })

            if (!receiverAccount)
                throw new GraphQLError('Receiver account not found')


            if (senderAccount.toJSON().balance < topUpData.amount)
                throw new GraphQLError("insufficient balance");

            if (!senderAccount.toJSON().allowSend)
                throw new GraphQLError("sender account is not allowed to send money");

            if (!receiverAccount.toJSON().allowReceive)
                throw new GraphQLError("receiver account is not allowed to receive money");


            // [TODO]: Implement topup externally
            const topUp = await TopUpsModel.create({
                companyId: topUpData.companyId,
                userId: session.userId,
                phoneId: phone.toJSON().id,
                amount: topUpData.amount,
                status: 'pending',
                referenceId: `${shortUUID().uuid()}`, // [TODO]: Implement topup externally 
            })


            const newSenderBalance = Number(senderAccount.toJSON().balance - topUpData.amount).toFixed(4)
            await senderAccount.update({
                balance: Number(newSenderBalance)
            })

            const newReceiverBalance = Number(receiverAccount.toJSON().balance + topUpData.amount).toFixed(4)
            await receiverAccount.update({
                balance: Number(newReceiverBalance)
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

            redis.publish(QUEUE_JOBS_NAME.PENDING_TOPUP, JSON.stringify({
                jobId: `pendingTopUp@${shortUUID.generate()}${shortUUID.generate()}`,
                jobName: "pendingTopUp",
                jobTime: "everyThirtyMinutes",
                userId: session.userId,
                amount: topUpData.amount,
                data: {
                    id: topUp.toJSON().id,
                    phone: topUpData.phone,
                    amount: topUpData.amount,
                    referenceId: topUp.toJSON().referenceId
                },
            }))

            if (recurrenceData.time !== "oneTime") {
                await redis.publish(QUEUE_JOBS_NAME.CREATE_TOPUP, JSON.stringify({
                    jobId: `${recurrenceData.title}@${recurrenceData.time}@${shortUUID.generate()}${shortUUID.generate()}`,
                    jobName: recurrenceData.title,
                    jobTime: recurrenceData.time,
                    userId: session.userId,
                    amount: topUpData.amount,
                    data: {
                        id: topUp.toJSON().id,
                        phone: topUpData.phone,
                        amount: topUpData.amount,
                        referenceId: topUp.toJSON().referenceId
                    }
                }))
            }

            return Object.assign({}, topUp.toJSON(), { user: session.user })

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static topUpCompanies = async (_: unknown, __: unknown, context: any) => {
        try {
            await checkForProtectedRequests(context.req);

            const companies = await TopUpCompanyModel.findAll({
                where: {
                    status: 'active'
                }
            })

            return companies

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }
}