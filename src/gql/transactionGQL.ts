import { TransactionsController } from '@/controllers'


const type = () => {
    return `
        input TransactionLocationInput {
            latitude: Float
            longitude: Float
            neighbourhood: String
            road: String
            town: String
            county: String
            state: String
            postcode: String
            country: String
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

        input UpdateQueuedTransactionInput {
            repeatJobKey: String
            queueType: String
            jobName: String
            jobTime: String
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

        type TransactionLocationType {
            latitude: Float
            longitude: Float
            neighbourhood: String
            road: String
            town: String
            county: String
            state: String
            postcode: String
            country: String
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
            card: OnlyCardType
            data: JSON
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
            account: AccountTypeWithUser
            card: OnlyCardType
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

        type RecurrentTransactionType {
            jobId: String
            repeatJobKey: String
            jobTime: String
            jobName: String
            status: String
            repeatedCount: Int
            amount: Int
            data: JSON
            referenceData: JSON
            signature: String
            receiver: AccountTypeWithUser
            sender: AccountTypeWithUser
            createdAt: String
            updatedAt: String
        }
       
        type OnlyRecurrentTransactionType {
            jobId: String
            repeatJobKey: String
            jobTime: String
            queueType: String
            jobName: String
            status: String
            repeatedCount: Int
            amount: Int
            data: JSON
            referenceData: JSON
            signature: String          
            createdAt: String
            updatedAt: String
        }

        type RecentTransactionsType {
            type: String
            data: JSON
        }
    `
}


const query = () => {
    return `
        transaction: TransactionType
        accountTransactions(page: Int!, pageSize: Int!): [TransactionType]
        searchAccountTransactions(page: Int!, pageSize: Int!, fullName: String!): [TransactionType]
        accountRecurrentTransactions(page: Int!, pageSize: Int!): [OnlyRecurrentTransactionType]
        accountBankingTransactions(page: Int!, pageSize: Int!): [BankingTransactionType]
    `
}

const mutation = () => {
    return `
        deleteRecurrentTransactions(repeatJobKey: String!, queueType: String): OnlyRecurrentTransactionType
        updateRecurrentTransactions(data: UpdateQueuedTransactionInput!): OnlyRecurrentTransactionType
        createTransaction(data: TransactionInput!, recurrence: TransactionRecurrenceInput!): TransactionType
        payRequestTransaction(transactionId: String!, paymentApproved: Boolean!): TransactionType
        createRequestTransaction(data: TransactionInput!, recurrence: TransactionRecurrenceInput!): TransactionType
        cancelRequestedTransaction(transactionId: String!): TransactionType
        createBankingTransaction(cardId: Int!, data: BankingTransactionInput!): BankingTransactionCreatedType
    `
}

const subscription = () => {
    return ``
}

const { createTransaction,cancelRequestedTransaction, searchAccountTransactions, updateRecurrentTransactions, payRequestTransaction, createRequestTransaction, deleteRecurrentTransactions, accountBankingTransactions, accountRecurrentTransactions, accountTransactions, createBankingTransaction } = TransactionsController
const resolvers = {
    query: {
        accountTransactions,
        searchAccountTransactions,
        accountBankingTransactions,
        accountRecurrentTransactions
    },
    mutation: {
        createTransaction,
        createRequestTransaction,
        cancelRequestedTransaction,
        payRequestTransaction,
        createBankingTransaction,
        deleteRecurrentTransactions,
        updateRecurrentTransactions
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