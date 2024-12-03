import { z } from 'zod'
import { AccountAuthSchema } from './accountAuth'
import { UserAuthSchema } from './userAuth'

export class TransactionAuthSchema {
    static transactionLocation = z.object({
        latitude: z.number().default(0).transform(v => v ?? 0),
        longitude: z.number().default(0).transform(v => v ?? 0),
        neighbourhood: z.string().nullish().transform(v => v ?? ""),
        road: z.string().nullish().transform(v => v ?? ""),
        town: z.string().nullish().transform(v => v ?? ""),
        county: z.string().nullish().transform(v => v ?? ""),
        state: z.string().nullish().transform(v => v ?? ""),
        postcode: z.string().nullish().transform(v => v ?? ""),
        country: z.string().nullish().transform(v => v ?? "")
    })

    static createTransaction = z.object({
        receiver: z.string(),
        amount: z.number().gt(0, "Amount must be greater than 0"),
        transactionType: z.enum(["transfer", "request"]).default("transfer"),
        currency: z.string().default("DOP"),
        location: TransactionAuthSchema.transactionLocation
    })

    static createBankingTransaction = z.object({
        cardId: z.number(),
        data: z.object({
            amount: z.number().min(10, "la cantidad debe ser mayor o igual a 10"),
            currency: z.string().default("DOP"),
            transactionType: z.enum(["deposit", "withdraw"]).default("deposit"),
            location: z.object({
                latitude: z.number().default(0),
                longitude: z.number().default(0),
            })
        })
    })


    static createTransactionDetails = z.object({
        username: z.string(),
        profileImageUrl: z.string().nullish().transform((val) => val ?? ""),
        fullName: z.string(),
        isFromMe: z.boolean(),
        amount: z.number(),
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

    static weeklyQueueTitle = z.enum(["everySunday", "everyMonday", "everyTuesday", "everyWednesday", "everyThursday", "everyFriday", "everySaturday"])

}