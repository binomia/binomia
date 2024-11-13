import { JSONRPCServer } from "json-rpc-2.0";

export const initMethods = (server: JSONRPCServer) => {
    // gloabal methods
    server.addMethod("test", () => {
        return true
    });
}