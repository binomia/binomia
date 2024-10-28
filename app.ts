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


const app: Express = express();
const server = new JSONRPCServer();

const httpServer = createServer(app);
const io = new Server(httpServer);

initSocket(io);
initRedisEventSubcription(io)
initMethods(server);


app.use(bodyParser.json());
app.use(cors({
    methods: ["POST"],
    origin: "*",
}));


app.post("/", async (req: Request, res: Response) => {
    try {
        console.log("request received");

        // const body = await validateSchema(req.body);
        // console.log(body);

        const jsonRPCResponse = await server.receive(req.body);
        res.status(200).json(jsonRPCResponse);

    } catch (error) {
        res.status(400).json({
            jsonrpc: "2.0",
            error
        });
    }
});


const unAuthorizedResponse = (req: Request, res: Response) => {
    res.status(401).json({
        jsonrpc: "2.0",
        error: {
            code: 401,
            message: "Unauthorized",
        }
    });
}

// UnAuthorized routes
app.get("*", unAuthorizedResponse);
app.patch("*", unAuthorizedResponse);
app.put("*", unAuthorizedResponse);
app.delete("*", unAuthorizedResponse);


// if (cluster.isPrimary) {
//     console.log(`Master ${process.pid} is running`);

//     for (let i = 0; i < os.cpus().length; i++) {
//         cluster.fork();
//     }

//     cluster.on("exit", (worker, code, signal) => {
//         console.log(`worker ${worker.process.pid} died`);
//         cluster.fork();
//     });

// } else {
//     httpServer.listen(8000, () => {
//         console.log(`[JSON-RPC]: Server is running at http://${ip()}:8000`);
//     });
// }


httpServer.listen(8000, () => {
    console.log(`[JSON-RPC]: Server is running at http://${ip()}:8000`);
});