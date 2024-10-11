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
        input AccountPermissionsInput {
            allowReceive: Boolean
            allowWithdraw: Boolean
            allowSend: Boolean
            allowAsk: Boolean
        }

        type OnlyAccountType {
            id:  Int
            balance: Float
            sentAmount: Float
            receivedAmount: Float
            withdrawAmount: Float
            allowReceive: Boolean
            allowWithdraw: Boolean
            allowSend: Boolean
            allowAsk: Boolean
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
            sentAmount: Float
            receivedAmount: Float
            withdrawAmount: Float
            allowReceive: Boolean
            allowWithdraw: Boolean
            allowSend: Boolean
            allowAsk: Boolean
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
            sentAmount: Float
            receivedAmount: Float
            withdrawAmount: Float
            allowReceive: Boolean
            allowWithdraw: Boolean
            allowSend: Boolean
            allowAsk: Boolean
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
            sentAmount: Float
            receivedAmount: Float
            withdrawAmount: Float
            sendLimit: Float
            receiveLimit: Float
            withdrawLimit: Float
            allowReceive: Boolean
            allowWithdraw: Boolean
            allowSend: Boolean
            allowAsk: Boolean
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
        accountLimit: TransactionsWithAccountType
    `
}

const mutation = () => {
    return `
        updateAccountPermissions(data: AccountPermissionsInput): OnlyAccountType
    `
}
const subscription = () => { }

const { accounts, account, updateAccountPermissions, accountLimit } = AccountController
const resolvers = {
    query: {
        accounts,
        account,
        accountLimit
    },

    mutation: {
        updateAccountPermissions
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