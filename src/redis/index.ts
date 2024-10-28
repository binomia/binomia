import { REDIS_HOST, REDIS_PORT, REDIS_SUBSCRIPTION_CHANNEL } from "@/constants";
import { createClient } from "redis";
import Redis from "ioredis";

export const pubClient = createClient({
    url: "redis://redis:6379",
});

export const publisher = new Redis({
    host: "redis",
    port: 6379,
})

export const subscriber = new Redis({
    host: "redis",
    port: 6379,
    
})


export const subClient = pubClient.duplicate();

