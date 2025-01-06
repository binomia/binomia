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

        type TopUpsGQL {
            id: ID
            fullName: String
            phone: String
            status: String
            amount: Float
            referenceId: String
            user: OnlyUserType
            createdAt: String
            updatedAt: String
            company: TopUpCompany
        }

    `
}


const query = () => {
    return `
        userTopUps(page: Int!, pageSize: Int!): [TopUpsGQL]
        phoneTopUps(phone: String!, page: Int!, pageSize: Int!): [TopUpsGQL]
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

const { userTopUps, phoneTopUps, createTopUp } = TopUpController
const resolvers = {
    query: {
        userTopUps,
        phoneTopUps
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