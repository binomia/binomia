import { topUpQueue } from "@/queues";
import { JSONRPCServer } from "json-rpc-2.0";
import shortUUID from "short-uuid";

export const topUpMethods = (server: JSONRPCServer) => {
    server.addMethod("createTopUp", async ({ amount, userId, data }: { amount: number, userId: number, data: any }) => {
        try {
            const jobId = `queueTopUp@${shortUUID.generate()}${shortUUID.generate()}`
            const job = await topUpQueue.queue.add(jobId, data, {
                jobId,
                removeOnComplete: {
                    age: 20 // 30 minutes
                },
                removeOnFail: {
                    age: 60 * 30 // 24 hours
                }
            });

            return job.asJSON().id

        } catch (error) {
            console.log({ createTransaction: error });
            throw error
        }
    });
}