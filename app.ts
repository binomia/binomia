import "dotenv/config"
import cluster from "cluster";
import os from "os";
import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import { typeDefs } from './src/gql'
import { resolvers } from './src/gql'
import { db } from './src/config';
import { keyvRedis } from "@/redis";
import { formatError } from "@/helpers";
import { PORT } from "@/constants";
import { startStandaloneServer } from '@apollo/server/standalone';


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

        const schema = makeExecutableSchema({ typeDefs, resolvers })    
        const server: ApolloServer = new ApolloServer({
            schema,
            csrfPrevention: true,
            cache: new KeyvAdapter(keyvRedis),
            formatError,           
        })

        const { url } = await startStandaloneServer(server, {
            listen: { port: Number(PORT) },
            context: async ({ req, res }: { req: any, res: any }) => {
                return { req, res }
            }
        });

        console.log(`[Main-Server]: worker ${cluster.worker?.id} is running at: ${url}`)
    }
})()



