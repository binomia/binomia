import userGQL from "./userGQL";
import accountGQL from "./accountGQL";



export const typeDefs = `
    ${userGQL.type()}
    ${accountGQL.type()}


    type Query {
        ${userGQL.query()}
        ${accountGQL.query()}
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
        ...userGQL.resolvers.query,
        ...accountGQL.resolvers.query
    },

    Mutation: {
        ...userGQL.resolvers.mutation,
        ...accountGQL.resolvers.mutation
    },

    Subscription: {
        ...userGQL.resolvers.subscription,
        ...accountGQL.resolvers.subscription
    }
}

