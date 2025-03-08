import TopUpController from "@/controllers/topUpController";
import { topUpQueue, transactionsQueue } from "@/queues";
import { JSONRPCServer } from "json-rpc-2.0";
import shortUUID from "short-uuid";

export const topUpMethods = (server: JSONRPCServer) => {
    server.addMethod("createTopUp", async ({ amount, userId, data }: { amount: number, userId: number, data: any }) => {
        try {
            const toptup = await TopUpController.createTopUp(data)
            return toptup

        } catch (error) {
            console.log({ createTransaction: error });
            throw error
        }
    });
}