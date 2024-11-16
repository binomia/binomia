import { Queue } from "bullmq";
import { WeeklyQueueTitleType } from "@/types";
import { getNextDay } from "@/helpers";


export default class TransactionsQueue {
    queue: Queue;

    constructor() {
        this.queue = new Queue("transactions", { connection: { host: "redis", port: 6379 } });
    }

    createJobs = async (jobName: string, jobTime: WeeklyQueueTitleType, data: any) => {
        switch (jobName) {
            case "weekly":
                const time = getNextDay(jobTime)

                const job = this.add(jobName, data, time);
                return job

            default:
                break;
        }
    }


    add = async (jobName: string, data: any, delay: number = 0) => {
        const job = this.queue.add(jobName, data, { delay, repeat: { every: delay } })
        return job
    }
}