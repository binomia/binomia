import userGQL from "./userGQL";
import accountGQL from "./accountGQL";
import cardGQL from "./cardGQL";



export const typeDefs = `
    ${userGQL.type()}
    ${accountGQL.type()}
    ${cardGQL.type()}


    type Query {
        ${userGQL.query()}
        ${accountGQL.query()}
    }


    type Mutation {
        ${userGQL.mutation()}
        ${cardGQL.mutation()}
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

