import "dotenv/config"
import { Client } from "cromio";
import { ZERO_ENCRYPTION_KEY } from "./src/constants";
import Fastify from 'fastify'

const client = new Client({
    servers: [
        {
            url: "http://localhost:8003",
            secretKey: ZERO_ENCRYPTION_KEY
        }
    ]
})


const fastify = Fastify()


fastify.get('/', async (request, reply) => {    
    const result = await client.trigger("predictTransaction", [100, 4, 5, 6, 7])
    reply.send(result)

})

// Run the server!
fastify.listen({ port: 6000 }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    // Server is now listening on ${address}
    console.log(`Server listening at ${address}`);
})
