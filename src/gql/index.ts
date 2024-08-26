import userGQL from "./userGQL";



export const typeDefs = `
    ${userGQL.type()}


    type Query {
        ${userGQL.query()}
        hello: String
    }


    type Mutation {
        ${userGQL.mutation()}
    }


    type Subscription {
        ${userGQL.subscription()}
    }
`;


export const resolvers = {
    Query: {
        ...userGQL.resolvers.query
    },

    Mutation: {
        ...userGQL.resolvers.mutation
    },

    Subscription: {
        ...userGQL.resolvers.subscription
    }
}

