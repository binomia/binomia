import { TopUpController } from '@/controllers'


const type = () => {
    return `
        input TopUpInput {
            fullName: String
            phone: String
            amount: Float
            companyId: Int
        }

        type TopUpCompany {
            id: ID
            uuid: String
            status: String
            name: String
            logo: String
            createdAt: String
            updatedAt: String
        }

        type PhoneTopUpType {
            id: ID
            fullName: String
            phone: String
            createdAt: String
            updatedAt: String
        }

        type PhoneWithCompanyTopUpType {
            id: ID
            fullName: String
            phone: String
            createdAt: String
            updatedAt: String
            company: TopUpCompany
        }

        type TopUpsGQL {
            id: ID
            status: String
            amount: Float
            referenceId: String
            createdAt: String
            updatedAt: String
            phone: PhoneTopUpType
            user: OnlyUserType
            company: TopUpCompany
        }

    `
}


const query = () => {
    return `
        userTopUps(page: Int!, pageSize: Int!): [TopUpsGQL]
        phoneTopUps(phone: String!, page: Int!, pageSize: Int!): [PhoneWithCompanyTopUpType]
        topUpCompanies: [TopUpCompany]
    `
}

const mutation = () => {
    return `
        createTopUp(data: TopUpInput!): TopUpsGQL
    `
}

const subscription = () => {
    return ``
}

const { userTopUps, phoneTopUps, createTopUp, topUpCompanies } = TopUpController
const resolvers = {
    query: {
        userTopUps,
        phoneTopUps,
        topUpCompanies
    },
    mutation: {
        createTopUp
    },
    subscription: {}
}

export default {
    type,
    query,
    mutation,
    subscription,
    resolvers
}