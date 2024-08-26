import { UsersController } from '../controllers'


const type = () => {
    return `
        input UserInput {
            full_name: String
            username: String
            email: String
            dni: String
            sex: String
            address: String
            dob: String
            dni_expire_date: String
        }

        type Users {
            id: Int
            full_name: String
            username: String
            email: String
            dni: String
            sex: String
            address: String
            dob: String
            dni_expire_date: String
            created_at: String
            updated_at: String
        }

        type OnlyUsers {
            id: Int
            full_name: String
            username: String
            email: String
            dni: String
            sex: String
            address: String
            dob: String
            dni_expire_date: String
            created_at: String
            updated_at: String
        }

        type SingleUserType {
            error: Boolean
            message: String
            data: Users
        }

        type MultipleUsersType {
            error: Boolean
            message: String
            data: [Users]
        }
    `
}

const query = () => {
    return `
        users(page: Int!, pageSize: Int!): [Users]
        user(uuid: String!): SingleUserType
        searchUsers(search: UserInput!, limit: Int): MultipleUsersType
    `
}

const mutation = () => {
    return `            
        createUser(data: UserInput!): SingleUserType 
        updateUser(uuid: String!, data: UserInput!): SingleUserType
        sendMessage(message: String): String
    `
}

const subscription = () => {
    return `
        userCreated: SingleUserType
        userUpdated: SingleUserType
        messageReceived: String
    `
}

const { users, user } = UsersController
const resolvers = {
    query: {
        users,
        user,
        // searchUsers
    },

    mutation: {
        // createUser,
        // updateUser
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