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
        query Query($search: UserInput!, $limit: Int, $allowRequestMe: Boolean) {
            searchUsers(search: $search, limit: $limit, allowRequestMe: $allowRequestMe) {
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

    static searchSingleUser = () => {
        return gql`
        query SearchSingleUser($search: UserInput!) {
            searchSingleUser(search: $search) {
                id
                fullName
                username
                phone
                email
                dniNumber
                profileImageUrl                
                userAgreementSigned
                status 
                faceVideoUrl
                address              
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
                    signingKey
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
                    createdAt
                    updatedAt
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
                            createdAt
                            updatedAt
                            location {
                                latitude
                                longitude
                                neighbourhood
                                sublocality
                                municipality
                                fullArea
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

    static sugestedUsers = () => {
        return gql`
            query SugestedUsers($allowRequestMe: Boolean) {
                sugestedUsers(allowRequestMe: $allowRequestMe) {
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
        `
    }

    static singleUser = () => {
        return gql`
            query SingleUser($username: String!) {
                singleUser(username: $username) {
                    fullName
                    account {
                        allowReceive   
                        allowRequestMe                     
                        status                            
                    }
                }
            }
        `
    }
}