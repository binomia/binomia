import { TransactionsController } from '@/controllers'


const type = () => {
    return `
        input TransactionLocationInput {
            latitude: Float
            longitude: Float
        }  

        input TransactionInput {
            receiver: String
            amount: Float
            transactionType: String
            currency: String
            location: TransactionLocationInput
        }
        input TransactionRecurrenceInput {
            title: String
            time: String
        }

        input BankingTransactionInput {
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

        type BankingTransactionType {
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
            account: AccountTypeWithUser
            data: JSON
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

        type BankingTransactionCreatedType {
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
            data: JSON
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
        accountBankingTransactions(page: Int!, pageSize: Int!): [BankingTransactionType]
    `
}

const mutation = () => {
    return `
        createTransaction(data: TransactionInput!, recurrence: TransactionRecurrenceInput!): TransactionCreatedType
        createBankingTransaction(cardId: Int!, data: BankingTransactionInput!): BankingTransactionCreatedType
    `
}

const subscription = () => {
    return ``
}

const { createTransaction, accountBankingTransactions, accountTransactions, createBankingTransaction } = TransactionsController
const resolvers = {
    query: {
        accountTransactions,
        accountBankingTransactions
    },
    mutation: {
        createTransaction,
        createBankingTransaction
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