import cluster from "cluster";
import os from "os";
import { redis, initRedisEventSubcription } from "@/redis";
import { JSONRPCServer } from "json-rpc-2.0";
import { DASHBOARD_FAVICON_URL, DASHBOARD_LOGO_URL, NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL, QUEUE_JOBS_NAME, REDIS_SUBSCRIPTION_CHANNEL } from "@/constants";
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { unAuthorizedResponse } from "@/helpers";
import { initMethods } from "@/rpc";

import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { queuesBullAdapter, topUpQueue, transactionsQueue } from "@/queues";
import { dbConnection } from "@/config";
import { initTracing } from "@/tracing";
import { Queue } from "bullmq";

const app: Express = express();
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/')
const server = new JSONRPCServer();

initTracing();

if (cluster.isPrimary) {
    console.log(`[Queue-Server]: Master(${process.pid}) started`);

    for (let i = 0; i < os.cpus().length; i++)
        cluster.fork();


    redis.subscribe(...[
        REDIS_SUBSCRIPTION_CHANNEL.LOGIN_VERIFICATION_CODE,
        REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED_FROM_QUEUE,
        REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_REQUEST_PAIED,
        REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED,
        REDIS_SUBSCRIPTION_CHANNEL.TRANSACTION_CREATED,

        QUEUE_JOBS_NAME.CREATE_TRANSACTION,
        QUEUE_JOBS_NAME.REMOVE_TRANSACTION_FROM_QUEUE,
        QUEUE_JOBS_NAME.PENDING_TRANSACTION,
        QUEUE_JOBS_NAME.QUEUE_TRANSACTION,
        QUEUE_JOBS_NAME.QUEUE_REQUEST_TRANSACTION,
        QUEUE_JOBS_NAME.PENDING_TOPUP,
        QUEUE_JOBS_NAME.CREATE_TOPUP,
        QUEUE_JOBS_NAME.QUEUE_TOPUP,
        QUEUE_JOBS_NAME.CREATE_NEW_QUEUE,

        ...Object.values(NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL)
    ])


    redis.on("message", async (channel, payload) => {
        if (channel === QUEUE_JOBS_NAME.CREATE_NEW_QUEUE) {
            for (const id in cluster.workers) {
                if (cluster.workers[id])
                    cluster.workers[id].send({ payload, channel });
                // console.log(`Master received message from Worker ${id}:`, payload);
            }

        } else {
            if (!cluster.workers) return;

            const workerIds = Object.keys(cluster.workers);
            const randomWorkerId = workerIds[Math.floor(Math.random() * workerIds.length)];
            const selectedWorker = cluster.workers[randomWorkerId];


            if (selectedWorker) {
                selectedWorker.send({ payload, channel }); // Send task to selected worker
                console.log(`Master dispatched task to worker ${selectedWorker.process.pid}`);
            }
        }
    })

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });


} else {
    app.use(express.json());
    app.use('/', serverAdapter.getRouter());
    app.use('/metrics', async (req, res) => {
        const transactionsQueueMetrics = await transactionsQueue.queue.exportPrometheusMetrics();
        const topUpQueueMetrics = await topUpQueue.queue.exportPrometheusMetrics();

        res.set('Content-Type', 'text/plain');
        res.send(transactionsQueueMetrics + "\n".repeat(2) + topUpQueueMetrics);
    });
    
    
    app.use(cors({
        origin: "*",
    }));
    app.patch("*", unAuthorizedResponse);
    app.put("*", unAuthorizedResponse);
    app.delete("*", unAuthorizedResponse);

    const bullDashboard = createBullBoard({
        queues: queuesBullAdapter,
        serverAdapter: serverAdapter,
        options: {

            uiConfig: {
                boardTitle: "",
                favIcon: {
                    default: DASHBOARD_FAVICON_URL,
                    alternative: DASHBOARD_FAVICON_URL,
                },
                boardLogo: {
                    width: 200,
                    height: 35,
                    path: DASHBOARD_LOGO_URL,
                },
                locale: {
                    lng: "es",
                },
                dateFormats: {
                    common: "EEEE, MMM. d yyyy, h:mma",
                    short: "EEEE, MMM. d yyyy, h:mma",
                    full: "EEEE, MMM. d yyyy, h:mma"
                }
            }
        }
    });

    dbConnection()
    initMethods(server);
    initRedisEventSubcription(bullDashboard)

    app.get('/metrics', async (req, res) => {
        try {

            const metrics = await transactionsQueue.queue.getMetrics("completed");
            res.send(metrics);

        } catch (err) {
            // res.status(500).send(err.message);
        }
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

    const PORT = process.env.PORT || 8002
    app.listen(PORT, () => {
        console.log(`[Queue-Server]: worker ${process.pid} is running at http://localhost:${PORT}`);
    });
}