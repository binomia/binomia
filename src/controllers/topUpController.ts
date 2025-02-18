import { checkForProtectedRequests, getQueryResponseFields } from '@/helpers'
import { GraphQLError } from 'graphql';
import { TopUpsModel, UsersModel, TopUpCompanyModel, TopUpPhonesModel } from '@/models';
import { Op } from 'sequelize';
import { TopUpSchema } from '@/auth';
import { queueServer } from '@/rpc/queueRPC';


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

    static recentTopUps = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
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
                    where: { userId: session.userId },
                    include: [
                        {
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        },
                        {
                            model: TopUpCompanyModel,
                            as: 'company',
                            attributes: fields['company']
                        },
                        {
                            model: TopUpPhonesModel,
                            as: 'phone'
                        }
                    ]
                })

                return tupups

            } catch (error: any) {
                throw new GraphQLError(error.message);
            }

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
                order: [['updatedAt', 'DESC']],
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

            await queueServer("createTopUp", {
                amount: topUpData.amount,
                userId: session.userId,
                data: {
                    ...topUpData,
                    phoneNumber: topUpData.phone,
                    senderUsername: session.user.username,
                    recurrenceData,
                    userId: session.userId
                }
            })

            return null

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

    static searchTopUps = async (_: unknown, { page, pageSize, search }: { page: number, pageSize: number, search: string }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const { user } = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'phones')

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const limit = _pageSize;
            const offset = (page - 1) * _pageSize;

            const phones = await TopUpPhonesModel.findAll({
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                attributes: ["id", "fullName", "phone", "createdAt", "userId"],
                where: {
                    [Op.and]: [
                        {
                            userId: user.id
                        },
                        {
                            [Op.or]: [
                                {
                                    fullName: { [Op.iLike]: `%${search}%` },
                                },
                                {
                                    phone: { [Op.iLike]: `%${search}%` },
                                }
                            ]
                        }
                    ]
                },
                include: [
                    {
                        model: TopUpsModel,
                        as: 'topups',
                        include: [
                            {
                                model: TopUpCompanyModel,
                                as: 'company',
                                attributes: fields['company']
                            },
                            {
                                model: TopUpPhonesModel,
                                as: 'phone',
                                attributes: fields['phone']
                            }
                        ]
                    }
                ]
            })

            if (!phones)
                throw new GraphQLError('No transactions found');


            const filteredTopups = phones.map((phone) => phone.toJSON()?.topups?.map((topup: any) => ({
                type: "topups",
                timestamp: topup?.createdAt,
                data: topup
            }))).flat()

            return filteredTopups

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }
}