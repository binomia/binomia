import { z } from 'zod'
import { AccountAuthSchema } from './accountAuth'
import { UserAuthSchema } from './userAuth'

export class TransactionAuthSchema {
    static createTransaction = z.object({
        receiver: z.string(),
        amount: z.number().gt(0, "Amount must be greater than 0"),
        transactionType: z.string().default("send"),
        currency: z.string().default("DOP"),
        location: z.object({
            latitude: z.number(),
            longitude: z.number(),
        })
    })

    static singleTransaction = z.object({
        transactionId: z.string(),
        amount: z.number(),
        deliveredAmount: z.number(),
        voidedAmount: z.number(),
        transactionType: z.string(),
        currency: z.string(),
        status: z.string(),
        location: z.object({
            latitude: z.number(),
            longitude: z.number(),
        }),
        createdAt: z.string(),
        updatedAt: z.string(),
        from: AccountAuthSchema.account.extend({
            user: UserAuthSchema.userProfileData
        }),
        to: AccountAuthSchema.account.extend({
            user: UserAuthSchema.userProfileData
        })
    })
    static singleSentTransaction = z.object({
        transactionId: z.string(),
        amount: z.number(),
        deliveredAmount: z.number(),
        voidedAmount: z.number(),
        transactionType: z.string(),
        currency: z.string(),
        status: z.string(),
        location: z.object({
            latitude: z.number(),
            longitude: z.number(),
        }),
        createdAt: z.string(),
        updatedAt: z.string(),
        from: UserAuthSchema.userProfileData,
        to: UserAuthSchema.userProfileData
    })
}