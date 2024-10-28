import "dotenv/config"
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { typeDefs } from './src/gql'
import { resolvers } from './src/gql'
import { db } from './src/config';

import cluster from "cluster";
import os from "os";
import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';



export const app: express.Express = express();
const httpServer = createServer(app);


const formatError = (formattedError: any, _: any) => {
    console.log({ formattedError });

    return {
        message: formattedError.message
    }
}


(async () => {
    await db.authenticate().then(() => {
        console.log('\nDatabase connection has been established successfully.');
        db.sync()

    }).catch((err) => {
        console.log('\nUnable to connect to the database:', err);
    })


    app.get('/seed', async (_, res) => {
        // await UsersModel.findOne({
        //     where: {
        //         id: 14
        //     },
        //     include: [
        //         {
        //             model: SessionModel,
        //             as: 'sessions',
        //         }
        //     ]
        // }).then((users) => {

        //     res.json(users)
        // }).catch((err) => {
        //     console.log(err);
        //     res.json({err})
        // })

        // await seedDatabase()
        res.json({ success: true })
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
        cors({
            origin: '*',
            credentials: true
        }),
        bodyParser.json(),
        expressMiddleware(server, {
            context: async ({ req, res }) => {
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



