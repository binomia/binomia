// npm install @apollo/server graphql
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs, resolvers } from './src/gql';
import { CustomError } from './src/errors';

interface MyContext {
    token?: String;
}


const formatError = (formattedError: any, error: unknown) => {
    throw new CustomError(formattedError.message, formattedError.extensions.code);
}

const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    formatError
});

(async () => {
    const { url } = await startStandaloneServer(server, {
        context: async ({ req }) => ({ token: req.headers.token }),
        listen: { port: 4000 },
    });

    console.log(`🚀  Server ready at ${url}`);
})()
