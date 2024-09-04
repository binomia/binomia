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
        type AccountTypeWithTransactions {
            id:  Int
            balance: Float
            status: String
            sendLimit: Float
            receiveLimit: Float
            withdrawLimit: Float
            hash: String
            transactions: [OnlyTransactionType]
            currency: String
            createdAt: String
            updatedAt: String
        }

        type AccountTypeWithUser {
            id:  Int
            balance: Float
            status: String
            sendLimit: Float
            receiveLimit: Float
            withdrawLimit: Float
            hash: String
            user: OnlyUserType
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
            transactions: [TransactionType]
        }
    `
}

const query = () => {
    return `
        accounts(page: Int!, pageSize: Int!): [AccountType]
        account(hash: String!): AccountType
        searchAccounts(search: AccountInput!, limit: Int): [AccountType]
        accountTransactions(page: Int!, pageSize: Int!, accountId: Int!): [TransactionType]
    `
}

const mutation = () => {
    
 }
const subscription = () => { }

const { accounts, account, accountTransactions } = AccountController
const resolvers = {
    query: {
        accounts,
        account,
        accountTransactions
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