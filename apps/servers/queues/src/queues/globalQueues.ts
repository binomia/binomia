import { Job, JobJson, Queue, Worker } from "bullmq";
import { WeeklyQueueTitleType } from "@/types";


export default class GlobalQueues {
    queue: Queue;

    constructor() {
        this.queue = new Queue("global", { connection: { host: "redis", port: 6379 } });
        this.workers()
    }

    private executeJob = async (job: JobJson) => {
        
    }

    private workers = async () => {
        const worker = new Worker('transactions', async (job) => this.executeJob(job.asJSON()), {
            connection: { host: "redis", port: 6379 },
            settings: {
                backoffStrategy: (attemptsMade: number) => attemptsMade * 1000
            }
        });

        worker.on('completed', (job: Job) => {
            console.log('Job completed', job.repeatJobKey);
        })
    }

    createJobs = async ({ jobId, jobName, jobTime, amount, receiverId, senderId, data }: { jobId: string, amount: number, jobName: string, jobTime: WeeklyQueueTitleType, senderId: number, receiverId: number, data: string }) => {
        
    }

    addJob = async (jobName: string, data: string, delay: number = 0, every: number = 0) => {
        const job = await this.queue.add(jobName, data, { delay, repeat: { every, startDate: delay } })
        return job
    }

    removeJob = async (repeatJobKey: string) => {
        
    }

    updateJob = async (repeatJobKey: string, jobName: string, jobTime: WeeklyQueueTitleType): Promise<any> => {
       
    }
}