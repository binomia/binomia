import { connection } from "@/redis";
import { Queue } from "bullmq";

export const createQueue = async (name: string): Promise<Queue> => {
    const queue = new Queue(name, { connection });
    return queue
}

export const initQueues = async () => {
    const message = await createQueue("messages")
    message.add('print', { color: 'blue' }, { delay: 1000 * 30, repeat: { every: 1000 * 10 } });
}
