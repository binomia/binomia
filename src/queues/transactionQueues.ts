import { Job, JobJson, Queue, Worker } from "bullmq";

export default class TransactionsQueue {
    queue: Queue;

    constructor() {
        this.queue = new Queue("transactions", { connection: { host: "redis", port: 6379 } });
    }


}