import "dotenv/config"
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import session, { } from 'express-session';
import SequelizeStore from 'connect-session-sequelize';

import { typeDefs } from './src/gql'
import { resolvers } from './src/gql'
import { db } from './src/config';

import cluster from "cluster";
import os from "os";
import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
import { errorCode } from './src/errors';
import { GraphQLError } from "graphql";
import { SessionModel, UsersModel } from './src/models';
import { SESSION_SECRET_SECRET_KEY } from "./src/constants";



export const app: express.Express = express();
const httpServer = createServer(app);


const formatError = (formattedError: any, error: unknown) => {
    throw new GraphQLError(formattedError.message, {
        extensions: {
            code: formattedError.extensions.code || 'INTERNAL_SERVER_ERROR',
            http: {
                status: errorCode[formattedError.extensions.code] || 500
            }
        }
    })
}


(async () => {
    await db.authenticate().then(() => {
        console.log('\nDatabase connection has been established successfully.');
        db.sync()

    }).catch((err) => {
        console.log('\nUnable to connect to the database:', err);
    })

    // Define the session model
    const Store = SequelizeStore(session.Store)
    const SessionStore = new Store({
        db,
        table: "sessions",
        tableName: 'sessions',
        extendDefaultFields(_defaults, session) {
            return {
                sid: session.id || null,
                jwtToken: session.jwtToken,
                userId: session.userId || null,
                expires: session.expires,
                data: session.cookie,
            };
        },
    });

    app.use(
        session({
            secret: SESSION_SECRET_SECRET_KEY, // Replace with your own secret
            store: SessionStore,
            resave: false, // Don't resave session if unmodified
            saveUninitialized: false, // Don't create session until something stored
            cookie: {
                secure: false
            }
        })
    );



    app.get('/seed', async (_, res) => {
        await UsersModel.findAll({
            include: [{
                model: SessionModel,
                as: 'sessions',
            }]
        }).then((users) => {
            res.json({ users })
        }).catch((err) => {
            console.log(err);
        })
    })


    const schema = makeExecutableSchema({ typeDefs, resolvers })
    const wsServer: WebSocketServer = new WebSocketServer({
        server: httpServer,
        path: '/'
    })

    const serverCleanup = useServer({ schema }, wsServer)
    const server: ApolloServer = new ApolloServer({
        schema,
        formatError,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose()
                        }
                    }
                }
            },
        ],

    })

    await server.start()

    app.use(
        cors(),
        bodyParser.json(),
        expressMiddleware(server, {
            context: async ({ req, res }) => {
                console.log(req.baseUrl);
                
                return { req, res }
            }
        })
    )

    const PORT = process.env.PORT || 3000
    if (process.env.PRODUCTION_OR_DEVELOPMENT_MODE === "development") {
        httpServer.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`)
        })

    } else {
        if (cluster.isPrimary) {
            os.cpus().forEach(() => {
                cluster.fork()
            })

        } else {
            httpServer.listen(PORT, () => {
                console.log(`worker: ${cluster.worker?.id} Server is running on http://localhost:${PORT}`)
            })
        }
    }
})()



