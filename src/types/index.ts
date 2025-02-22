import { TransactionJoiSchema } from "@/auth/transactionJoiSchema"
import { z } from "zod"

export type WeeklyQueueTitleType = z.infer<typeof TransactionJoiSchema.weeklyQueueTitle>
export type MonthlyQueueTitleType = z.infer<typeof TransactionJoiSchema.monthlyQueueTitle>
export type CreateTransactionType = z.infer<typeof TransactionJoiSchema.createTransaction>
export type FraudulentTransactionType = z.infer<typeof TransactionJoiSchema.transaction>


export type CreateTransactionRPCParamsType = {
    transactionId: string
    senderUsername: string
    receiverUsername: string
    amount: number
    recurrenceData: any
    senderFullName: string
    location: z.infer<typeof TransactionJoiSchema.transactionLocation>
    currency: string
    transactionType: string
    userId: number
    jobTime: string
    jobName: string
    signature: string

    deviceId: string
    sessionId: string
    ipAddress: string
    isRecurring: boolean
    platform: string
}