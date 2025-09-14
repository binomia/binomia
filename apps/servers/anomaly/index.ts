// @ts-nocheck
import path from 'path';
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { Server, Extensions } from "cromio"

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const addon = require(path.join(__dirname, "./build/Release/iforest"));

const PORT = process.env.PORT || 8003
const server = new Server({
    port: Number(PORT),
    clients: [
        {
            ip: "*",
            secretKey: "secret",
            language: "nodejs"
        }
    ]
})

// raudulentTransaction

server.onTrigger("predictTransaction", ({ body, reply }) => {
    const result = addon.predictTransaction(body);

    reply(result)
})

server.start((url) => {
    console.log(`Server running at ${url}`);
})




