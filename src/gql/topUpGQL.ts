import { TopUpController } from '@/controllers'


const type = () => {
    return `
        input TopUpInput {
            fullName: String
            phone: String
            amount: Float
            companyId: Int
        }

        input TopUpRecurrenceInput {
            title: String
            time: String
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

        type TopUpsType {
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

        type OnlyTopUpsType {
            id: ID
            status: String
            amount: Float
            referenceId: String
            createdAt: String
            updatedAt: String            
        }
    `
}


const query = () => {
    return `
        topUps(phoneId: Int!, page: Int!, pageSize: Int!): [OnlyTopUpsType]
        recentTopUps(page: Int!, pageSize: Int!): [TopUpsType]
        topUpPhones(page: Int!, pageSize: Int!): [PhoneWithCompanyTopUpType]
        topUpCompanies: [TopUpCompany]
    `
}

const mutation = () => {
    return `
        createTopUp(data: TopUpInput!, recurrence: TopUpRecurrenceInput!): TopUpsType
    `
}

const subscription = () => {
    return ``
}

const { topUps, recentTopUps, topUpPhones, createTopUp, topUpCompanies } = TopUpController
const resolvers = {
    query: {
        topUps,
        recentTopUps,
        topUpPhones,
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