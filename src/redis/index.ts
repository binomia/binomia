import Redis from "ioredis";
import TransactionController from "@/controllers/transactionController";
import MainController from "@/controllers/mainController";
import { createBullBoard } from "@bull-board/api";
import TopUpController from "@/controllers/topUpController";


export const connection = {
    host: "redis",
    port: 6379
}

export const redis = new Redis({
    host: "redis",
    port: 6379
})


export const initRedisEventSubcription = async (bullDashboard: ReturnType<typeof createBullBoard>) => {
    process.on("message", async ({ channel, payload }: { channel: string, payload: string }) => {
        await MainController.listenToRedisEvent({ channel, payload, bullDashboard })
    })
}
