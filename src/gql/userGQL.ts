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

        input UpdateUserDataInput {
            fullName: String
            username: String
            phone: String
            addressAgreementSigned: Boolean
            userAgreementSigned: Boolean
            profileImageUrl: String
            idFrontUrl: String
            idBackUrl: String
            faceVideoUrl: String
            occupation: String
            dniNumber: String
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
            id: Int
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
            account: AccountTypeWithTransactions
            cards: [OnlyCardType]
            kyc: OnlyKYCType
            createdAt: String
            updatedAt: String
        }

        type UserCreatedType {
            id: Int
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
            token: String
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
        sessionUser: UserType
        userByEmail(email: String!): Boolean
        searchUsers(search: UserInput!, limit: Int): [UserType]
        sugestedUsers: [OnlyUserType]
    `
}

const mutation = () => {
    return `            
        createUser(data: UserInput!): UserCreatedType 
        updateUser(data: UpdateUserDataInput!): OnlyUserType
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

const { userByEmail, sessionUser, updateUserPassword, updateUser, sugestedUsers, user, createUser, searchUsers, login } = UsersController
const resolvers = {
    query: {
        user,
        sessionUser,
        searchUsers,
        userByEmail,
        sugestedUsers
    },

    mutation: {
        createUser,
        updateUser,
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