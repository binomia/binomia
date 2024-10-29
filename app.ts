import "dotenv/config"
import { JSONRPCServer } from "json-rpc-2.0";
import { initMethods } from "@/rpc";
import express, { Express, Request, Response } from 'express';
import { ip } from 'address';
import cors from 'cors';
import bodyParser from "body-parser";
import { validateSchema } from "@/auth/zodSchemas";
import cluster from "cluster";
import os from "os";
import { createServer } from "http";
import { initSocket } from "@/sockets";
import { Server } from "socket.io";
import { initRedisEventSubcription } from "@/redis";
import http from "http";
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
    httpServer.listen(8000);

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

    initSocket(io);
    initRedisEventSubcription(io)
}