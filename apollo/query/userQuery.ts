import { gql } from "@apollo/client"

export class UserApolloQueries {
    static user = () => {
        return gql`
            query User {
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
                    accounts {
                        id
                    }
                }
            }
        `
    }

    static searchUser = () => {
        return gql`
        query Query($search: UserInput!, $limit: Int) {
            searchUsers(search: $search, limit: $limit) {
                id
                fullName
                username
                email
                dniNumber
                profileImageUrl
                status
            }
        }
        `
    }

    static sessionUser = () => {
        return gql`
            query SessionUser {
                sessionUser {
                    id
                    fullName
                    username
                    phone
                    email
                    dniNumber
                    profileImageUrl
                    addressAgreementSigned
                    userAgreementSigned
                    idFrontUrl
                    status
                    idBackUrl
                    faceVideoUrl
                    address
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
                    account {
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
                        withdrawAmount
                        receivedAmount
                        sentAmount
                        allowWithdraw
                        allowSend
                        allowReceive
                        allowAsk
                    }
                }
            }
        `
    }

    static userByEmail = () => {
        return gql`
            query UserByEmail($email: String!) {
                userByEmail(email: $email)
            }
        `
    }

    static updateUserPassword = () => {
        return gql`
            mutation UpdateUserPassword($email: String!, $password: String!, $data: TokenAngSignInput!) {
                updateUserPassword(email: $email, password: $password, data: $data) {
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
                }
            }
        `
    }

    static updateUser = () => {
        return gql`
            mutation UpdateUser($data: UpdateUserDataInput!) {
                updateUser(data: $data) {
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
        `
    }

    static createUser = () => {
        return gql`
            mutation CreateUser($data: UserInput!) {
                createUser(data: $data) {                    
                    token
                }
            }
        `
    }
}