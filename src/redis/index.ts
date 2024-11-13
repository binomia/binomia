import KeyvRedis from "@keyv/redis";
import Redis from "ioredis";
import Keyv from "keyv";


export default new Redis({
    host: "redis",
    port: 6379,
})

export const keyvRedis = new Keyv({
    store: new KeyvRedis({
        uri: "redis://redis:6379",
    }),
});


