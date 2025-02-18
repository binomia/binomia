import Redis from "ioredis";


export const redis = new Redis({
    host: "redis",
    port: 6379,
})

export const subscriber = new Redis({
    host: "redis",
    port: 6379,
})


