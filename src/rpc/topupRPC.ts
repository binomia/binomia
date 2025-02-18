import { topUpQueue, transactionsQueue } from "@/queues";
import { JSONRPCServer } from "json-rpc-2.0";
import shortUUID from "short-uuid";

export const topUpMethods = (server: JSONRPCServer) => {
    server.addMethod("createTopUp", async ({ amount, userId, data }: { amount: number, userId: number, data: any }) => {
        try {
            const job = await topUpQueue.createJobs({
                jobId: `queueTopUp@${shortUUID.generate()}${shortUUID.generate()}`,
                jobName: "queueTopUp",
                jobTime: "queueTopUp",
                referenceData: null,
                amount,
                userId,
                data
            });

            return job

        } catch (error) {
            console.log({ createTransaction: error });
            throw error
        }
    });
}