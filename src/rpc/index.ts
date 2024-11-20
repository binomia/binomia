import { transactionsQueue } from "@/queues";
import { JSONRPCServer } from "json-rpc-2.0";

export const initMethods = (server: JSONRPCServer) => {
    // gloabal methods
    server.addMethod("test", () => {
        return true
    });

    // queue methods
    server.addMethod("removeJob", async ({ jobKey }: { jobKey: string }) => {
        try {
            // const validatedRepeatJobKey = z.string().parse(repeatJobKey)            
            console.log({ jobKey });

            const job = await transactionsQueue.removeJob(jobKey)
            return job

        } catch (error: any) {
            throw error.message
        }
    });
}