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
            description: String
            location: TransactionLocationInput
        }

        type TransactionType {
            transactionId: String
            amount: Float
            deliveredAmount: Float
            balanceAfterTransaction: Float
            balanceBeforeTransaction: Float
            voidedAmount: Float
            transactionType: String
            currency: String
            description: String
            status: String
            sender: AccountTypeWithUser
            receiver: AccountTypeWithUser
            location: TransactionLocationType
            createdAt: String
            updatedAt: String
        }

        type TransactionLocationType {
            latitude: Float
            longitude: Float
        }   


        type OnlyTransactionType {
            transactionId: String
            amount: Float
            deliveredAmount: Float
            balanceAfterTransaction: Float
            balanceBeforeTransaction: Float
            voidedAmount: Float
            transactionType: String
            currency: String
            description: String
            status: String
            location: TransactionLocationType
            createdAt: String
            updatedAt: String
        }
    `
}


const query = () => {
    return `
        transaction: TransactionType
    `
}

const mutation = () => {
    return `
        createTransaction(data: TransactionInput!): TransactionType
    `
}

const subscription = () => {
    return ``
}

const {  createTransaction } = TransactionsController
const resolvers = {
    query: {
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