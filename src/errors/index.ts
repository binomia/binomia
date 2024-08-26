import { GraphQLError } from "graphql";
import { ApolloServerErrorCode } from '@apollo/server/errors'

export const graphQLError = (callBack: Function) => {
    const { GRAPHQL_VALIDATION_FAILED } = ApolloServerErrorCode
    console.log({GRAPHQL_VALIDATION_FAILED});
    
    if (GRAPHQL_VALIDATION_FAILED) {
        throw new GraphQLError('You are not authorized to perform this action.', );
    }

    return callBack
}


