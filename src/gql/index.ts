import userGQL from "./userGQL";
import accountGQL from "./accountGQL";
import { checkForProtectedRequests } from "../helpers";



export const typeDefs = `
    ${userGQL.type()}
    ${accountGQL.type()}


    type Query {
        ${userGQL.query()}
        ${accountGQL.query()}
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
        ...userGQL.resolvers.query,
        ...accountGQL.resolvers.query,
        hello: (_: any, args: any, { req }: { req: any }, info: any, path: any, error: any, dir: any) => {
            try {
                checkForProtectedRequests(req);

                console.log(req.jwtData);
                
                return 'hello'
            } catch (error: any) {
                throw new Error(error)
            }
        }
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

