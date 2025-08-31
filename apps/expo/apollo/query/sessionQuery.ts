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
                    signingKey
                    needVerification
                }
            }
        `
    }
    static verifySession = () => {
        return gql`
            mutation VerifySession($sid: String!, $signature: String!, $code: String!) {
                verifySession(sid: $sid, signature: $signature, code: $code) {
                    id
                    fullName
                    username
                    phone
                    email
                    password
                    dniNumber
                    profileImageUrl                    
                    userAgreementSigned
                    idFrontUrl
                    status
                    idBackUrl
                    faceVideoUrl
                    address
                    account {
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
                        last4Number
                        isPrimary
                        hash
                        brand
                        alias
                        data
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
                    createdAt
                    updatedAt
                }
            }
        `
    }
}