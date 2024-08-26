import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { typeDefs } from './gql'
import { resolvers } from './gql'
import cluster from "cluster";
import os from "os";
import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
import { dbConnection } from './config';
import { ApolloServerErrorCode } from '@apollo/server/errors'



const formatError = (formattedError: any, error: any) => {
    return {
        ...formattedError,
        message: formattedError.message,
        extensions: {
            stacktrace: null
        }
    }
}


export const app: express.Express = express();
export const httpServer = createServer(app);

(async () => {
    app.get('/seed', async (_, res) => {
        res.json({
            status: 'success',
            message: 'Hello World!'
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
                serverWillStart: async () => {
                    return {
                        drainServer: async () => {
                            await serverCleanup.dispose()
                        }
                    }
                }
            }
        ]
    });

    await server.start()

    app.use(
        cors(),
        bodyParser.json(),
        expressMiddleware(server)
    )

    const PORT = process.env.PORT || 3000
    if (process.env.PRODUCTION_OR_DEVELOPMENT_MODE === "development") {
        httpServer.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`)
        })

    } else {
        if (cluster.isPrimary) {
            dbConnection()
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

