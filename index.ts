import cluster from "cluster";
import http from "http";
import os from "os";
import { Server } from "socket.io";
import { setupMaster, setupWorker } from "@socket.io/sticky";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";

const PORT = process.env.PORT || 8000;
if (cluster.isPrimary) {
    console.log(`Master ${process.pid} started on http://localhost:${PORT}`);

    const httpServer = http.createServer();

    setupMaster(httpServer, {
        loadBalancingMethod: "least-connection"
    });

    setupPrimary();
    httpServer.listen(PORT);

    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });

} else {
    console.log(`Worker ${process.pid} started on http://localhost:${PORT}`);

    const httpServer = http.createServer();
    const io = new Server(httpServer);

    io.adapter(createAdapter());
    setupWorker(io);

    io.on("connection", (socket) => {
        console.log("a user connected:", socket.id);
    });
}