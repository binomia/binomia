import { CardsController } from '@/controllers'
import { TransactionsController } from '@/controllers'


const type = () => {
    return `
        input TransactionLocationInput {
            lat: Float
            lng: Float
        }
        input TransactionInput {
            amount: Float
            deliveredAmount: Float
            balanceAfterTransaction: Float
            balanceBeforeTransaction: Float
            voidedAmount: Float
            refundedAmount: Float
            transactionType: String
            currency: String
            description: String
            status: String
            location: TransactionLocationInput
        }

        type TransactionType {
            transactionId: String
            amount: Float
            deliveredAmount: Float
            balanceAfterTransaction: Float
            balanceBeforeTransaction: Float
            voidedAmount: Float
            refundedAmount: Float
            transactionType: String
            currency: String
            description: String
            status: String
            sender: OnlyUserType
            receiver: OnlyUserType
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
            refundedAmount: Float
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
        transactions(page: Int!, pageSize: Int!): [TransactionType]
        transaction: TransactionType
    `
}

const mutation = () => {
    return ``
}

const subscription = () => {
    return ``
}

const {  transactions } = TransactionsController
const resolvers = {
    query: {
        transactions
    },
    mutation: {
        //
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