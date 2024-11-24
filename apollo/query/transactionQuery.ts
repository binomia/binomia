import { gql } from "@apollo/client"

export class TransactionApolloQueries {
    static createTransaction = () => {
        return gql`
            mutation CreateTransaction($data: TransactionInput!, $recurrence: TransactionRecurrenceInput!) {
                createTransaction(data: $data, recurrence: $recurrence) {
                    transactionId
                    amount
                    deliveredAmount
                    voidedAmount
                    transactionType
                    currency
                    status
                    createdAt
                    updatedAt
                    location {
                        latitude
                        longitude
                    }                
                    receiver {
                        id
                        fullName
                        username
                        email
                        dniNumber
                        profileImageUrl
                        status                        
                    }
                }
            }
        `
    }

    static accountBankingTransactions = () => {
        return gql`
            query AccountBankingTransactions($page: Int!, $pageSize: Int!) {
                accountBankingTransactions(page: $page, pageSize: $pageSize) {
                    transactionId
                    amount
                    deliveredAmount
                    voidedAmount
                    transactionType
                    currency
                    status
                    data
                    card {
                        id
                        last4Number
                        isPrimary
                        hash
                        brand
                        alias
                        data
                        createdAt
                        updatedAt
                    }
                    currency
                    createdAt
                    updatedAt
                    location {
                        latitude
                        longitude
                    }
                    createdAt
                    updatedAt                    
                }
            }
        `
    }

    static accountTransactions = () => {
        return gql`
            query AccountTransactions($page: Int!, $pageSize: Int!) {
                accountTransactions(page: $page, pageSize: $pageSize) {
                    transactionId
                    amount
                    deliveredAmount
                    voidedAmount
                    transactionType
                    currency
                    status
                    location {
                        latitude
                        longitude
                    }
                    createdAt
                    updatedAt
                    from {
                        id
                        balance
                        status
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        hash
                        currency
                        createdAt
                        updatedAt
                        user {
                            id
                            fullName
                            username
                            phone
                            email
                            dniNumber
                            password
                            profileImageUrl
                            addressAgreementSigned
                            userAgreementSigned
                            idFrontUrl
                            status
                            idBackUrl
                            faceVideoUrl
                            address
                            createdAt
                            updatedAt
                        }
                    }
                    to {
                        id
                        balance
                        status
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        hash
                        currency
                        createdAt
                        updatedAt
                        user {
                            id
                            fullName
                            username
                            phone
                            email
                            dniNumber
                            password
                            profileImageUrl
                            addressAgreementSigned
                            userAgreementSigned
                            idFrontUrl
                            status
                            idBackUrl
                            faceVideoUrl
                            address
                            createdAt
                            updatedAt
                        }
                    }
                }
            }
        `
    }

    static createBankingTransaction = () => {
        return gql`
            mutation CreateBankingTransaction($data: BankingTransactionInput!, $cardId: Int!) {
                createBankingTransaction(data: $data, cardId: $cardId) {
                    transactionId
                    amount
                    deliveredAmount
                    voidedAmount
                    transactionType
                    currency
                    status
                    data
                    card {
                        id
                        last4Number
                        isPrimary
                        hash
                        brand
                        alias
                        data
                        createdAt
                        updatedAt
                    }
                    location {
                        latitude
                        longitude
                    }
                    createdAt
                    updatedAt                    
                }
            }
        `
    }

    static accountRecurrentTransactions = () => {
        return gql`
            query AccountRecurrentTransactions($page: Int!, $pageSize: Int!) {
                accountRecurrentTransactions(page: $page, pageSize: $pageSize) {
                    amount
                    jobTime
                    jobName
                    repeatJobKey
                    status
                    repeatedCount
                    createdAt
                    updatedAt
                    receiver {
                        id
                        balance
                        status
                        hash
                        currency
                        user {
                            id
                            fullName
                            username
                            profileImageUrl
                            status
                        }
                    }
                }
            }
        `
    }

    static deleteRecurrentTransactions = () => {
        return gql`
            mutation DeleteRecurrentTransactions($repeatJobKey: String!) {
                deleteRecurrentTransactions(repeatJobKey: $repeatJobKey) {
                    jobId
                    repeatJobKey
                    jobName
                    status
                    repeatedCount
                    amount
                    data
                    signature
                    createdAt
                    updatedAt
                }
            }
        `
    }
    static updateRecurrentTransactions = () => {
        return gql`
            mutation UpdateRecurrentTransactions($data: UpdateQueuedTransactionInput!) {
                updateRecurrentTransactions(data: $data) {
                    jobId
                    repeatJobKey
                    jobName
                    status
                    repeatedCount
                    amount
                    data
                    signature
                    createdAt
                    updatedAt
                }
            }
        `
    }
}