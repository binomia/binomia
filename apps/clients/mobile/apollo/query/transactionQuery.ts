import { gql } from "@apollo/client"

export class TransactionApolloQueries {
    static createTransaction = () => {
        return gql`
            mutation CreateTransaction($message: String!) {
                createTransaction(message: $message) {
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
                        uri
                        latitude
                        longitude
                        neighbourhood
                        sublocality
                        municipality
                        fullArea
                    }
                    from {
                        id
                        balance
                        allowReceive
                        allowWithdraw
                        allowSend
                        allowRequestMe
                        allowDeposit
                        status
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        depositLimit
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
                        allowReceive
                        allowWithdraw
                        allowSend
                        allowRequestMe
                        allowDeposit
                        status
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        depositLimit
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

    static createRequestTransaction = () => {
        return gql`
            mutation CreateRequestTransaction($message: String!) {
                createRequestTransaction(message: $message) {
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
                        uri
                        latitude
                        longitude
                        neighbourhood
                        sublocality
                        municipality
                        fullArea
                    }
                    from {
                        id
                        balance
                        allowReceive
                        allowWithdraw
                        allowSend
                        allowRequestMe
                        allowDeposit
                        status
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        depositLimit
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
                        allowReceive
                        allowWithdraw
                        allowSend
                        allowRequestMe
                        allowDeposit
                        status
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        depositLimit
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

    static transaction = () => {
        return gql`
            query Transaction($transactionId: String!) {
                transaction(transactionId: $transactionId) {
                    transactionId
                    amount
                    deliveredAmount
                    voidedAmount
                    transactionType
                    currency
                    status
                    location {
                        uri
                        latitude
                        longitude
                        neighbourhood
                        sublocality
                        municipality
                        fullArea
                    }
                    createdAt
                    updatedAt
                    from {
                        id
                        balance
                        allowReceive
                        allowWithdraw
                        allowSend
                        allowRequestMe
                        allowDeposit
                        status
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        depositLimit
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
                        allowReceive
                        allowWithdraw
                        allowSend
                        allowRequestMe
                        allowDeposit
                        status
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        depositLimit
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
                        uri
                        latitude
                        longitude
                        neighbourhood
                        sublocality
                        municipality
                        fullArea
                    }
                    createdAt
                    updatedAt                    
                }
            }
        `
    }

    static searchAccountTransactions = () => {
        return gql`
            query SearchAccountTransactions($page: Int!, $pageSize: Int!, $fullName: String!) {
                searchAccountTransactions(page: $page, pageSize: $pageSize, fullName: $fullName) {
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
                        uri
                        latitude
                        longitude
                        neighbourhood
                        sublocality
                        municipality
                        fullArea
                    }                    
                    from {
                        id
                        balance
                        allowReceive
                        allowWithdraw
                        allowSend
                        allowRequestMe
                        allowDeposit
                        status
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        depositLimit
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
                        allowReceive
                        allowWithdraw
                        allowSend
                        allowRequestMe
                        allowDeposit
                        status
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        depositLimit
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
                        uri
                        latitude
                        longitude
                        neighbourhood
                        sublocality
                        municipality
                        fullArea
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
                        uri
                        latitude
                        longitude
                        neighbourhood
                        sublocality
                        municipality
                        fullArea
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
                    jobId
                    repeatJobKey
                    status
                    repeatedCount
                    createdAt
                    updatedAt
                    referenceData
                    queueType
                    signature
                    user {
                        id
                        fullName
                        username
                        phone   
                        profileImageUrl                    
                    }
                }
            }
        `
    }

    static deleteRecurrentTransactions = () => {
        return gql`
            mutation DeleteRecurrentTransactions($repeatJobKey: String!, $queueType: String) {
                deleteRecurrentTransactions(repeatJobKey: $repeatJobKey, queueType: $queueType) {
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
                    queueType
                    jobTime
                    referenceData
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
                    queueType
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

    static recentTransactions = () => {
        return gql`
            query RecentTransactions {
                recentTransactions {
                    type
                    data
                }
            }
        `
    }

    static cancelRequestedTransaction = () => {
        return gql`
            mutation CancelRequestedTransaction($transactionId: String!) {
                cancelRequestedTransaction(transactionId: $transactionId) {
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
                        uri
                        latitude
                        longitude
                        neighbourhood
                        sublocality
                        municipality
                        fullArea
                    }                    
                    from {
                        id
                        balance
                        allowReceive
                        allowWithdraw
                        allowSend
                        allowRequestMe
                        allowDeposit
                        status
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        depositLimit
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
                        allowReceive
                        allowWithdraw
                        allowSend
                        allowRequestMe
                        allowDeposit
                        status
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        depositLimit
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

    static payRequestTransaction = () => {
        return gql`
            mutation PayRequestTransaction($transactionId: String!, $paymentApproved: Boolean!) {
                payRequestTransaction(transactionId: $transactionId, paymentApproved: $paymentApproved) {
                    transactionId
                    amount
                    deliveredAmount
                    voidedAmount
                    transactionType
                    currency
                    status
                    location {
                        uri
                        latitude
                        longitude
                        neighbourhood
                        sublocality
                        municipality
                        fullArea
                    }
                    createdAt
                    updatedAt
                    from {
                        id
                        balance
                        allowReceive
                        allowWithdraw
                        allowSend
                        allowRequestMe
                        allowDeposit
                        status
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        depositLimit
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
                        allowReceive
                        allowWithdraw
                        allowSend
                        allowRequestMe
                        allowDeposit
                        status
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        depositLimit
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
}