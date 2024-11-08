import { CardsController } from '@/controllers'
import { TransactionsController } from '@/controllers'


const type = () => {
    return `
        input TransactionLocationInput {
            latitude: Float
            longitude: Float
        }
            
        input TransactionInput {
            receiver: String
            signature: String
            amount: Float
            transactionType: String
            currency: String
            location: TransactionLocationInput
        }

        type TransactionType {
            transactionId: String
            amount: Float
            deliveredAmount: Float         
            voidedAmount: Float
            transactionType: String
            currency: String
            status: String
            location: TransactionLocationType
            createdAt: String
            updatedAt: String
            from: AccountTypeWithUser
            to: AccountTypeWithUser
        }

        type TransactionLocationType {
            latitude: Float
            longitude: Float
        } 

        type TransactionCreatedType {
            transactionId: String
            amount: Float
            deliveredAmount: Float
            voidedAmount: Float
            transactionType: String
            currency: String
            status: String
            location: TransactionLocationType
            createdAt: String
            updatedAt: String
            receiver: OnlyUserType
        }   

        type OnlyTransactionType {
            transactionId: String
            amount: Float
            deliveredAmount: Float
            voidedAmount: Float
            transactionType: String
            currency: String
            status: String
            location: TransactionLocationType
            createdAt: String
            updatedAt: String
        }

        type TransactionsWithAccountType {
            transactionId: String
            amount: Float
            deliveredAmount: Float
            voidedAmount: Float
            transactionType: String
            currency: String
            status: String
            location: TransactionLocationType
            fromAccount: OnlyAccountType
            toAccount: OnlyAccountType
            createdAt: String
            updatedAt: String            
        }
    `
}


const query = () => {
    return `
        transaction: TransactionType
        accountTransactions(page: Int!, pageSize: Int!): [TransactionType]

    `
}

const mutation = () => {
    return `
        createTransaction(data: TransactionInput!): TransactionCreatedType
    `
}

const subscription = () => {
    return ``
}

const { createTransaction, accountTransactions } = TransactionsController
const resolvers = {
    query: {
        accountTransactions
    },
    mutation: {
        createTransaction
    },
    subscription: {
        // 
    }
}

export default {
    type,
    query,
    mutation,
    subscription,
    resolvers
}