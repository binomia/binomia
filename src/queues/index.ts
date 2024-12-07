import { connection } from "@/redis";
import { Queue } from "bullmq";
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import TransactionsQueue from "./transactionQueues";

export const createQueue = (name: string): Queue => {
    const queue = new Queue(name, { connection });
    return queue
}

export const transactionsQueue = new TransactionsQueue()

export const queuesBullAdapter = [
    new BullMQAdapter(transactionsQueue.queue)
];


