import { checkForProtectedRequests, getQueryResponseFields } from '@/helpers'
import { GraphQLError } from 'graphql';
import { TopUpsModel, UsersModel, TopUpCompanyModel, TopUpPhonesModel } from '@/models';
import { Op } from 'sequelize';
import { TopUpSchema } from '@/auth';
import shortUUID from 'short-uuid';


export class TopUpController {
    static userTopUps = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'topups', false, true)

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const offset = (page - 1) * _pageSize;
            const limit = _pageSize;

            const tupups = await TopUpsModel.findAll({
                limit,
                offset,
                attributes: fields['topups'],
                where: { userId: session.userId },
                include: [
                    {
                        model: TopUpCompanyModel,
                        as: 'company',
                        attributes: fields['company']
                    },
                    {
                        model: UsersModel,
                        as: 'user',
                        attributes: fields['user']
                    },
                ]
            })

            console.log(JSON.stringify(tupups, null, 2));


            const filterByUniquePhone = (data: any[]): any[] => {
                const uniquePhones = new Set();
                const filteredData = [];
                for (const item of data) {
                    if (!uniquePhones.has(item.phone)) {
                        uniquePhones.add(item.phone);
                        filteredData.push(item);
                    }
                }
                return filteredData;
            }

            const filteredData = filterByUniquePhone(tupups)
            return filteredData

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static phoneTopUps = async (_: unknown, { phone, page, pageSize }: { phone: string, page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'phones', false, true)

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const offset = (page - 1) * _pageSize;
            const limit = _pageSize;

            const phones = await TopUpPhonesModel.findAll({
                limit,
                offset,
                attributes: fields['phones'],
                where: {
                    [Op.and]: [
                        { userId: session.userId },
                        { phone }
                    ]
                },
                include: [
                    {
                        model: TopUpCompanyModel,
                        as: 'company',
                        attributes: fields['company']
                    }
                ]
            })

            console.log(JSON.stringify(phones, null, 2));

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