import cluster from "cluster";
import os from "os";
import redis, { initRedisEventSubcription } from "@/redis";
import { JSONRPCServer } from "json-rpc-2.0";
import { DASHBOARD_FAVICON_URL, DASHBOARD_LOGO_URL, QUEUE_JOBS_NAME } from "@/constants";
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { unAuthorizedResponse } from "@/helpers";
import { initMethods } from "@/rpc";

import { createBullBoard, } from '@bull-board/api';
import { ExpressAdapter, } from '@bull-board/express';
import { queuesBullAdapter } from "@/queues";
import { DateFormats } from "@bull-board/api/dist/typings/app";

const app: Express = express();
// const a: DateFormats
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/')

app.use(express.json());
app.use(cors({
    origin: "*",
}));

app.use('/', serverAdapter.getRouter());


createBullBoard({
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
                width: 80,
                height: 35,
                path: DASHBOARD_LOGO_URL,
            },
            locale: {
                lng: "es",
            },
            dateFormats: {
                common: "EEEE, MMM. d yyyy, h:mma",  
                short: "EEEE, MMM. d yyyy, h:mma",  
                full: "EEEE, MMM. d yyyy, h:mma",  

            }
        }
    }
});



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

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });


} else {
    // app.get("*", unAuthorizedResponse);
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