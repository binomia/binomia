import "dotenv/config"
import cluster from "cluster";
import os from "os";
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import { typeDefs } from './src/gql'
import { resolvers } from './src/gql'
import { db } from './src/config';
import { keyvRedis } from "@/redis";
import { formatError } from "@/helpers";
import { PORT } from "@/constants";

export const app: express.Express = express();
const httpServer = createServer(app);


(async () => {
    if (cluster.isPrimary) {
        os.cpus().forEach(() => {
            cluster.fork()
        })

    } else {
        await db.authenticate().then(() => {
            console.log('\nDatabase connection has been established successfully.');
            db.sync()

        }).catch((err) => {
            console.log('\nUnable to connect to the database:', err);
        })


        app.get('/seed', async (_, res) => {
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
            csrfPrevention: true,
            cache: new KeyvAdapter(keyvRedis),
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

        app.use(cors({}))
        app.use(express.json())
        app.use(
            expressMiddleware(server, {
                context: async ({ req, res }) => {                    
                    return { req, res }
                }
            })
        )

        httpServer.listen(PORT, () => {
            console.log(`[Main-Server]: worker ${cluster.worker?.id} is running on http://localhost:${PORT}`)
        })
    }
})()



