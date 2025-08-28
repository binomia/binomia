import "dotenv/config"
import express, { Express, Request, Response } from 'express';
import cluster from "cluster";
import os from "os";
import http from "http";
import { initSocket } from "@/sockets";
import { Server } from "socket.io";
import { subscriber } from "@/redis";
import { setupMaster, setupWorker } from "@socket.io/sticky";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";
import { NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL } from "@/constants";
import { ip } from "address"
import { initMethods } from "@/rpc";
import { JSONRPCServer } from "json-rpc-2.0";
import { collectDefaultMetrics, register } from 'prom-client';

const PORT = process.env.PORT || 8001;
const app: Express = express();
const server = new JSONRPCServer();
const httpServer = http.createServer(app);

collectDefaultMetrics();

if (cluster.isPrimary) {
    console.log(`Master ${process.pid} started on http://localhost:${PORT}`);

    const httpServer = http.createServer();
    httpServer.listen(PORT);

    setupMaster(httpServer, {
        loadBalancingMethod: "least-connection"
    });

    setupPrimary();
    cluster.setupPrimary({
        serialization: "advanced"
    });

    for (let i = 0; i < os.cpus().length; i++)
        cluster.fork();

    subscriber.subscribe(...[
        ...Object.values(NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL)
    ])

    subscriber.on("message", async (channel, payload) => {
        if (!cluster.workers) return;

        const workerIds = Object.keys(cluster.workers);
        const randomWorkerId = workerIds[Math.floor(Math.random() * workerIds.length)];
        const selectedWorker = cluster.workers[randomWorkerId];

        if (selectedWorker) {
            selectedWorker.send({ payload, channel }); // Send task to selected worker
            console.log(`Master dispatched task to worker ${selectedWorker.process.pid}`);
        }
    })

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });

} else {
    const io = new Server(httpServer);

    app.use(express.json());

    app.get('/metrics', async (req, res) => {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    });

    app.post("/", async (req: Request, res: Response) => {
        try {
            const jsonRPCResponse = await server.receive(req.body);

            if (jsonRPCResponse?.error)
                res.status(400).json(jsonRPCResponse);

            else
                res.status(200).json(jsonRPCResponse);

        } catch (error) {
            res.status(400).json({
                jsonrpc: "2.0",
                error,
                test: false
            });
        }
    });


    io.adapter(createAdapter());
    setupWorker(io);
    initSocket(io);
    initMethods(server, io);

    console.log(`[Notification-Server]: worker ${process.pid} is running on http://${ip()}:${PORT}`);
}