import { transactionsQueue } from "@/queues";
import { WeeklyQueueTitleType } from "@/types";
import { JSONRPCServer } from "json-rpc-2.0";

export const initMethods = (server: JSONRPCServer) => {
    // gloabal methods
    server.addMethod("test", () => {
        return true
    });

    // queue methods
    server.addMethod("removeJob", async ({ jobKey }: { jobKey: string }) => {
        try {
            const job = await transactionsQueue.removeJob(jobKey)
            return job

        } catch (error: any) {
            throw new Error(error.toString());
        }
    });

    server.addMethod("updateJob", async ({ jobKey, jobName, jobTime }: { jobKey: string, jobName: string, jobTime: WeeklyQueueTitleType }) => {
        try {
            const job = await transactionsQueue.updateJob(jobKey, jobName, jobTime)
            return job

        } catch (error: any) {
            throw new Error(error.toString());
        }
    });
}