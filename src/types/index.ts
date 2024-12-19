import { TransactionJoiSchema } from "@/auth/transactionJoiSchema"
import { z } from "zod"

export type WeeklyQueueTitleType = z.infer<typeof TransactionJoiSchema.weeklyQueueTitle>
export type MonthlyQueueTitleType = z.infer<typeof TransactionJoiSchema.monthlyQueueTitle>
export type CreateTransactionType = z.infer<typeof TransactionJoiSchema.createTransaction>
