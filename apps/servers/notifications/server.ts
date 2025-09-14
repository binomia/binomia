import "dotenv/config"
import cluster from "cluster";
import os from "os";
import { Server, Extensions, ServerTypes } from "cromio"
import { Server as SocketIOServer } from 'socket.io';
import { setupMaster, setupWorker } from "@socket.io/sticky";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";
// import { subscriber } from "@/redis";
// import { NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL } from "@/constants";
import { globalTriggers } from "@/triggers";
import { ip } from "address";
import { initSocket } from "@/sockets";

const PORT = process.env.PORT || 8001;
const PROMETHEUS_PORT = process.env.PROMETHEUS_PORT || 7001;
export const server = new Server({
    port: Number(PORT)
})

const httpServer = server.getHttpServerInstance();
if (cluster.isPrimary) {

    setupMaster(httpServer, {
        loadBalancingMethod: "least-connection"
    });

    setupPrimary();
    cluster.setupPrimary({
        serialization: "advanced"
    });

    os.cpus().forEach(() => {
        cluster.fork()
    })

    // subscriber.subscribe(...[
    //     ...Object.values(NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL)
    // ])

    // subscriber.on("message", async (channel, payload) => {
    //     if (!cluster.workers) return;

    //     const workerIds = Object.keys(cluster.workers);
    //     const randomWorkerId = workerIds[Math.floor(Math.random() * workerIds.length)];
    //     const selectedWorker = cluster.workers[randomWorkerId];

    //     if (selectedWorker) {
    //         selectedWorker.send({ payload, channel }); // Send task to selected worker
    //         console.log(`Master dispatched task to worker ${selectedWorker.process.pid}`);
    //     }
    // })

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });

} else {
    const io = new SocketIOServer(server.getHttpServerInstance());
    io.adapter(createAdapter());
    setupWorker(io);
    initSocket(io);

    server.addExtension(Extensions.serverPrometheusMetrics({
        port: Number(PROMETHEUS_PORT)
    }));
    
    server.registerTriggerDefinition(globalTriggers);
    server.onTrigger("socketEventEmitter", async ({ body }: ServerTypes.OnTriggerType) => {
        try {
            const { data, channel, senderSocketRoom, recipientSocketRoom } = body;
            io.to([recipientSocketRoom, senderSocketRoom]).emit(channel, data)
            return true

        } catch (error) {
            console.log(error);
        }
    });

    server.start(async (url: string) => {
        console.log(`\n[Notification]: worker ${process.pid} is running on ${url}`);
    })
}