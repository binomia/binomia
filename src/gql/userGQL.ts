import { UsersController } from '@/controllers'


const type = () => {
    return `
        input UserInput {
            fullName: String
            username: String
            password: String
            imageUrl: String
            email: String
            dni: String
            sex: String
            address: String
            dob: String
            dniExpiration: String
        }

        type UserType {
            id: Int
            fullName: String
            username: String
            imageUrl: String
            email: String
            password: String
            dni: String
            sex: String
            address: String
            dob: String
            dniExpiration: String
            createdAt: String
            updatedAt: String
            accounts: [OnlyAccountType]
            transactions: [OnlyTransactionType]
            cards: OnlyCardType
        }

        type OnlyUserType {
            id: Int
            fullName: String
            username: String
            imageUrl: String
            email: String
            dni: String
            sex: String
            address: String
            dob: String
            dniExpiration: String
            createdAt: String
            updatedAt: String
        }
    `
}

const query = () => {
    return `
        users(page: Int!, pageSize: Int!): [UserType]
        user(uuid: String!): UserType
        searchUsers(search: UserInput!, limit: Int): [UserType]
    `
}

const mutation = () => {
    return `            
        createUser(data: UserInput!): UserType 
        updateUser(uuid: String!, data: UserInput!): UserType
        sendMessage(message: String): String
        login(email: String!, password: String!): String
    `
}

const subscription = () => {
    return `
        userCreated: UserType
        userUpdated: UserType
        messageReceived: String
    `
}

const { users, user, createUser, searchUsers, login } = UsersController
const resolvers = {
    query: {
        users,
        user,
        searchUsers
    },

    mutation: {
        createUser,
        login
    },

    subscription: {
        // userCreated: {
        //     subscribe: async (_: unknown) => {
        //         return pubsub.asyncIterator(REDIS_TRIGGER.USER_CREATED);
        //     }
        // },
        // userUpdated: {
        //     subscribe: async (_: unknown) => {
        //         return pubsub.asyncIterator(REDIS_TRIGGER.USER_UPDATED);
        //     }
        // }
    }
}

export default {
    type,
    query,
    mutation,
    subscription,
    resolvers
}