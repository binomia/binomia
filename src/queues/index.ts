import { connection } from "@/redis";
import { Queue } from "bullmq";
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from "@bull-board/express";
import TransactionsQueue from "./transactions";


const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/');

export const createQueue = (name: string): Queue => {
    const queue = new Queue(name, { connection });
    return queue
}

export const transactionsQueue = new TransactionsQueue()

export const queuesBullAdapter = [
    new BullMQAdapter(transactionsQueue.queue)
];

