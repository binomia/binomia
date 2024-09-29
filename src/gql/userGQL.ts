import { UsersController } from '@/controllers'


const type = () => {
    return `
        input UserInput {
            fullName: String
            username: String
            password: String
            phone: String
            addressAgreementSigned: Boolean
            userAgreementSigned: Boolean
            profileImageUrl: String
            idFrontUrl: String
            idBackUrl: String
            faceVideoUrl: String
            bloodType: String
            occupation: String
            email: String
            dniNumber: String
            gender: String
            maritalStatus: String
            address: String
            dob: String
            dniExpiration: String
        }

        input TokenAngSignInput {
            token: String
            signature: String
        }

        type UserType {
            id:  Int
            fullName: String
            username: String
            phone: String
            email: String
            password: String
            dniNumber: String
            profileImageUrl: String
            addressAgreementSigned: Boolean
            userAgreementSigned: Boolean
            idFrontUrl: String
            status: String
            idBackUrl: String
            faceVideoUrl: String
            address: String
            accounts: [AccountTypeWithTransactions]
            cards: [OnlyCardType]
            kyc: OnlyKYCType
            createdAt: String
            updatedAt: String
        }

        type OnlyUserType {
            id:  Int
            fullName: String
            username: String
            phone: String
            email: String
            dniNumber: String
            password: String
            profileImageUrl: String
            addressAgreementSigned: Boolean
            userAgreementSigned: Boolean
            idFrontUrl: String
            status: String
            idBackUrl: String
            faceVideoUrl: String
            address: String
            createdAt: String
            updatedAt: String
        }
    `
}

const query = () => {
    return `
        user: UserType
        userByEmail(email: String!): Boolean
        searchUsers(search: UserInput!, limit: Int): [UserType]
    `
}

const mutation = () => {
    return `            
        createUser(data: UserInput!): UserType 
        updateUser(uuid:  Int!, data: UserInput!): UserType
        sendMessage(message: String): String
        login(email: String!, password: String!): String
        updateUserPassword(email: String!, password: String!, data: TokenAngSignInput!): OnlyUserType
    `
}

const subscription = () => {
    return `
        userCreated: UserType
        userUpdated: UserType
        messageReceived: String
    `
}

const { userByEmail, updateUserPassword, user, createUser, searchUsers, login } = UsersController
const resolvers = {
    query: {
        user,
        searchUsers,
        userByEmail
    },

    mutation: {
        createUser,
        updateUserPassword,
        login
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