import { z } from 'zod'
import { UserJoiSchema } from './userJoiSchema'


export class AccountZodSchema {
    static updateAccountPermissions = z.object({
        allowReceive: z.boolean().nullish().optional(),
        allowWithdraw: z.boolean().nullish().optional(),
        allowSend: z.boolean().nullish().optional(),
        allowAsk: z.boolean().nullish().optional()
    })

    static account = z.object({
        id: z.number(),
        balance: z.number().min(0.01),
        allowReceive: z.boolean(),
        blacklisted: z.boolean(),
        allowWithdraw: z.boolean(),
        allowSend: z.boolean(),
        allowRequestMe: z.boolean(),
        allowDeposit: z.boolean(),
        status: z.string(),
        sendLimit: z.number().min(0.01),
        receiveLimit: z.number().min(0.01),
        withdrawLimit: z.number().min(0.01),
        depositLimit: z.number().min(0.01),
        hash: z.string(),
        currency: z.enum(["DOP"]),
        createdAt: z.number(),
        updatedAt: z.number(),
        user: UserJoiSchema.user,
        transactionHistory: z.array(z.object({}))
    })
}