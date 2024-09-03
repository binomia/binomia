import userGQL from "./userGQL";
import accountGQL from "./accountGQL";
import cardGQL from "./cardGQL";
import transactionGQL from "./transactionGQL";



export const typeDefs = `
    ${userGQL.type()}
    ${accountGQL.type()}
    ${cardGQL.type()}
    ${transactionGQL.type()}
    


    type Query {
        ${userGQL.query()}
        ${accountGQL.query()}
        ${cardGQL.query()}
        ${transactionGQL.query()}
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
        ...accountGQL.resolvers.query,
        ...cardGQL.resolvers.query,
        ...transactionGQL.resolvers.query

    },

    Mutation: {
        ...userGQL.resolvers.mutation,
        ...accountGQL.resolvers.mutation,
        ...cardGQL.resolvers.mutation,
        ...transactionGQL.resolvers.mutation

    },

    Subscription: {
        ...userGQL.resolvers.subscription,
        ...accountGQL.resolvers.subscription,
        ...cardGQL.resolvers.subscription,
        ...transactionGQL.resolvers.subscription
    }
}

