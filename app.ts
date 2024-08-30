// npm install @apollo/server graphql
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs, resolvers } from './src/gql';
import { CustomError } from './src/errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import session, { } from 'express-session';
import SequelizeStore from 'connect-session-sequelize';
import { db } from './src/config';

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


// Define the session model
const Store = SequelizeStore(session.Store)
const SessionStore = new Store({ db });
SessionStore.sync();

(async () => {
    const { url } = await startStandaloneServer(server, {
        context: async ({ req, res }) => {
            const token = req.headers.authorization || '';
            console.log(token);

            return { res, req }
        },
        listen: { port: 4000 },
    });

    console.log(`🚀  Server ready at ${url}`);
})()
