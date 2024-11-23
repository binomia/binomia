import { gql } from "@apollo/client"

export class SessionApolloQueries {
    static login = () => {
        return gql`
            mutation Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                    token
                    sid
                    code
                    signature
                    needVerification
                    user {
                        id
                        fullName
                        username
                        phone
                        email
                        password
                        dniNumber
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
                        account {
                            id
                            balance
                            status
                            sentAmount
                            receivedAmount
                            withdrawAmount
                            allowReceive
                            allowWithdraw
                            allowSend
                            allowAsk
                            sendLimit
                            receiveLimit
                            withdrawLimit
                            hash
                            currency
                            createdAt
                            updatedAt
                            transactions {
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
                            }                        
                        }
                        cards {
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
                        kyc {
                            id
                            dniNumber
                            dob
                            status
                            expiration
                            occupation
                            gender
                            maritalStatus
                            bloodType
                            createdAt
                            updatedAt
                        }
                    
                    }
                }
            }
        `
    }
    static verifySession = () => {
        return gql`
            mutation VerifySession($sid: String!, $code: String!, $signature: String!) {
                verifySession(sid: $sid, code: $code, signature: $signature) {
                    id
                    fullName
                    username
                    phone
                    email
                    password
                    dniNumber
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
                    account {
                        id
                        balance
                        status
                        sentAmount
                        receivedAmount
                        withdrawAmount
                        allowReceive
                        allowWithdraw
                        allowSend
                        allowAsk
                        sendLimit
                        receiveLimit
                        withdrawLimit
                        hash
                        currency
                        createdAt
                        updatedAt
                        transactions {
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
                        }                
                    }
                    cards {
                        id
                        hash,
                        brand
                        last4Number
                        alias
                        isPrimary
                        data
                        createdAt
                        updatedAt
                    }
                    kyc {
                        id
                        dniNumber
                        dob
                        status
                        expiration
                        occupation
                        gender
                        maritalStatus
                        bloodType
                        createdAt
                        updatedAt
                    }                   
                }
            }
        `
    }
}