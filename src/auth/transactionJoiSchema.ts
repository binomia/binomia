import { z } from 'zod'
import { AccountZodSchema } from './accountZodSchema'


export class TransactionJoiSchema {
    static transactionLocation = z.object({
        latitude: z.number().default(0).transform(v => v ?? 0),
        longitude: z.number().default(0).transform(v => v ?? 0),
        neighbourhood: z.string().nullish().transform(v => v ?? ""),
        sublocality: z.string().nullish().transform(v => v ?? ""),
        municipality: z.string().nullish().transform(v => v ?? ""),
        fullArea: z.string().nullish().transform(v => v ?? ""),
    })

    static createTransaction = z.object({
        amount: z.number().gt(0),
        currency: z.enum(["DOP"]),
        receiver: z.string(),
        sender: z.string(),
        transactionType: z.enum(["transfer", "request"]),
        location: TransactionJoiSchema.transactionLocation
    })

    static createFromRecurrenceTransaction = TransactionJoiSchema.createTransaction.extend({
        transactionId: z.string(),
        fromAccount: z.number(),
        toAccount: z.number(),
        senderFullName: z.string(),
        receiverFullName: z.string(),
        signature: z.string()
    })

    static recurrenceTransaction = z.object({
        title: z.string(),
        time: z.string()
    })

    static bankingCreateTransaction = z.object({
        transactionId: z.string(),
        amount: z.number().gt(0),
        transactionType: z.enum(["deposit", "withdraw"]),
        deliveredAmount: z.number().gt(0),
        voidedAmount: z.number().gt(0),
        currency: z.enum(["DOP"]),
        status: z.string(),
        location: TransactionJoiSchema.transactionLocation,
        data: z.object({}).passthrough(),
        signature: z.string(),
        cardId: z.number(),
        accountId: z.number(),
        userId: z.number(),
    })


    static validateTransaction = z.object({
        amount: z.number(),
        currency: z.string(),
        transactionType: z.string(),
        sender: z.object({}).passthrough(),
        receiver: z.object({}).passthrough(),
        location: z.object({
            latitude: z.number(),
            longitude: z.number()
        })
    })

    static weeklyQueueTitle = z.enum(["everySunday", "everyMonday", "everyTuesday", "everyWednesday", "everyThursday", "everyFriday", "everySaturday"])
    static monthlyQueueTitle = z.enum([
        'everyFirst',
        'everySecond',
        'everyThird',
        'everyFourth',
        'everyFifth',
        'everySixth',
        'everySeventh',
        'everyEighth',
        'everyNinth',
        'everyTenth',
        'everyEleventh',
        'everyTwelfth',
        'everyThirteenth',
        'everyFourteenth',
        'everyFifteenth',
        'everySixteenth',
        'everySeventeenth',
        'everyEighteenth',
        'everyNineteenth',
        'everyTwentieth',
        'everyTwentyFirst',
        'everyTwentySecond',
        'everyTwentyThird',
        'everyTwentyFourth',
        'everyTwentyFifth',
        'everyTwentySixth',
        'everyTwentySeventh',
        'everyTwentyEighth',
    ])

    static transaction = z.object({
        id: z.number(),
        transactionId: z.string(),
        amount: z.number(),
        deliveredAmount: z.number(),
        voidedAmount: z.number(),
        transactionType: z.string(),
        currency: z.string(),
        status: z.string(),
        location: TransactionJoiSchema.transactionLocation,
        createdAt: z.date(),
        updatedAt: z.date(),
        from: AccountZodSchema.account,
        to: AccountZodSchema.account,
    })

    static transactionFeatures = z.object({
        speed: z.number(),
        distance: z.number(),
        amount: z.number(),
        currency: z.number(),
        transactionType: z.number(),
        platform: z.number(),
        isRecurring: z.number(),
    });
}
