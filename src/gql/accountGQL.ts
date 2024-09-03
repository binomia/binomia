import { AccountController } from '@/controllers'


const type = () => {
    return `
        input AccountInput {
            balance: Float
            status: String
            sendLimit: Float
            receiveLimit: Float
            withdrawLimit: Float
            hash: String
            currency: String
        }

        type OnlyAccountType {
            id:  Int
            balance: Float
            status: String
            sendLimit: Float
            receiveLimit: Float
            withdrawLimit: Float
            hash: String
            currency: String
            createdAt: String
            updatedAt: String
        }

        type AccountType {
            id:  Int
            balance: Float
            status: String
            sendLimit: Float
            receiveLimit: Float
            withdrawLimit: Float
            hash: String
            currency: String
            createdAt: String
            updatedAt: String
            user: OnlyUserType
        }
    `
}

const query = () => {
    return `
        accounts(page: Int!, pageSize: Int!): [AccountType]
        account(hash: String!): AccountType
        searchAccounts(search: AccountInput!, limit: Int): [AccountType]
    `
}

const mutation = () => {
    
 }
const subscription = () => { }

const { accounts, account } = AccountController
const resolvers = {
    query: {
        accounts,
        account
    },

    mutation: {

    },

    subscription: {

    }
}

export default {
    type,
    query,
    mutation,
    subscription,
    resolvers
}