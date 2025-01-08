import { checkForProtectedRequests, getQueryResponseFields } from '@/helpers'
import { GraphQLError } from 'graphql';
import { TopUpsModel, UsersModel, TopUpCompanyModel, TopUpPhonesModel } from '@/models';
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

    static createTopUp = async (_: unknown, { data }: { data: any }, context: any) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const topUpData = await TopUpSchema.createTopUp.parseAsync(data)

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

            // [TODO]: Implement topup externally
            const topUp = await TopUpsModel.create({
                companyId: topUpData.companyId,
                userId: session.userId,
                phoneId: phone.toJSON().id,
                amount: topUpData.amount,
                status: 'pending',
                referenceId: `${shortUUID().uuid()}`, // [TODO]: Implement topup externally 
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
                amount: topUp.toJSON().amount,
                data: {
                    id: topUp.toJSON().id,
                    referenceId: topUp.toJSON().referenceId
                },
            }))

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