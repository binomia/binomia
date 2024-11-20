import "dotenv/config"
import cluster from "cluster";
import os from "os";
import http from "http";
import { initSocket } from "@/sockets";
import { Server } from "socket.io";
import { initRedisEventSubcription, subscriber } from "@/redis";
import { setupMaster, setupWorker } from "@socket.io/sticky";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";
import { REDIS_SUBSCRIPTION_CHANNEL } from "@/constants";
import { ip } from "address"
const PORT = process.env.PORT || 8001;

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
        ...Object.values(REDIS_SUBSCRIPTION_CHANNEL)
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
    console.log(`[Notification-Server]: worker ${process.pid} is running on http://${ip()}:${PORT}`);

    const httpServer = http.createServer();
    const io = new Server(httpServer);

    io.adapter(createAdapter());
    setupWorker(io);
    initSocket(io);
    initRedisEventSubcription(io);
}