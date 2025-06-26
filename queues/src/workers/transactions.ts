import { connection } from "@/redis";
import { Job, Worker } from "bullmq";


const createWorker = async (name: string, callback: (job: Job) => Promise<void>): Promise<Worker> => {
    const worker = new Worker(name, async (job) => await callback(job), { connection });
    return worker
}

export default async () => {
    await createWorker('transactions', async (job) => {
        switch (job.name) {
            case "weekly":
                console.log({ job: job.data });
                break;

            default:
                console.log({ job: job.data });
                break;
        }
    })
}