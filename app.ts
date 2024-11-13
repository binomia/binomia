import cluster from "cluster";
import os from "os";
import redis, { initRedisEventSubcription } from "@/redis";
import { JSONRPCServer } from "json-rpc-2.0";
import { QUEUE_JOBS_NAME, REDIS_SUBSCRIPTION_CHANNEL } from "@/constants";
import { initQueues } from "@/queues";
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { unAuthorizedResponse } from "@/helpers";
import { initMethods } from "@/rpc";


const app: Express = express();
app.use(express.json());
app.use(cors({
    methods: ["POST"],
    origin: "*",
}));

const server = new JSONRPCServer();
initMethods(server);

if (cluster.isPrimary) {
    console.log(`[Queue-Server]: Master(${process.pid}) started`);

    for (let i = 0; i < os.cpus().length; i++)
        cluster.fork();

    redis.subscribe(QUEUE_JOBS_NAME.CREATE_TRANSACTION)
    redis.on("message", async (channel, payload) => {
        if (!cluster.workers) return;

        const workerIds = Object.keys(cluster.workers);
        const randomWorkerId = workerIds[Math.floor(Math.random() * workerIds.length)];
        const selectedWorker = cluster.workers[randomWorkerId];

        if (selectedWorker) {
            selectedWorker.send({ payload, channel }); // Send task to selected worker
            console.log(`Master dispatched task to worker ${selectedWorker.process.pid}`);
        }
    })

    initQueues();
    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });

} else {
    app.get("*", unAuthorizedResponse);
    app.patch("*", unAuthorizedResponse);
    app.put("*", unAuthorizedResponse);
    app.delete("*", unAuthorizedResponse);

    app.post("/", async (req: Request, res: Response) => {
        try {
            const jsonRPCResponse = await server.receive(req.body);
            res.status(200).json(jsonRPCResponse);

        } catch (error) {
            res.status(400).json({
                jsonrpc: "2.0",
                error
            });
        }
    });

    const PORT = process.env.PORT || 8002
    app.listen(PORT, () => {
        console.log(`[Queue-Server]: worker ${process.pid} is running at http://localhost:${PORT}`);
    });

    initRedisEventSubcription()
}