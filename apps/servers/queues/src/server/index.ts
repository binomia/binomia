import { Server } from "cromio";
import { mTLS, clients } from "./utils";
import { topUpsTriggerDefinition } from "./triggers";

const PORT = Number(process.env.PORT || 8002)
export const server = new Server({
    port: Number(PORT),
    tls: mTLS,
    clients
})


server.registerTriggerDefinition(topUpsTriggerDefinition);
