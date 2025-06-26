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
export interface CreateRequestQueueedTransactionType {
    receiverUsername: string
    sender: {
        id: number
        fullName: string
        username: string
        accountId: number
        balance: number
    },
    transaction: {
        transactionId: string
        amount: number
        location: z.infer<typeof TransactionJoiSchema.transactionLocation>
        currency: string
        transactionType: string
        signature: string
        recurrenceData: any
        status: string
        isRecurring: boolean
    },
    device: {
        deviceId: string
        sessionId: string
        ipAddress: string
        platform: string
    }
}

export interface CreateQueueedTransactionType extends CreateRequestQueueedTransactionType { }

export type PayQueuedRequestedTransactionType = {
    transactionId: string
    toAccount: number
    paymentApproved: boolean
}

export type CancelRequestedTransactionType = {
    transactionId: string
    fromAccount: number
    senderUsername: string
}

export interface CreateBankingTransactionType {
    transactionId: string
    amount: number
    transactionType: string
    deliveredAmount: number
    voidedAmount: number
    currency: string
    status: string
    location: z.infer<typeof TransactionJoiSchema.transactionLocation>
    data: any
    signature: string
    cardId: number
    accountId: number
    userId: number,
}
