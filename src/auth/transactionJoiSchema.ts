import { z } from 'zod'


export class TransactionJoiSchema {
    static createTransaction = z.object({
        amount: z.number().gt(0),
        currency: z.enum(["DOP"]),
        receiver: z.string(),
        sender: z.string(),
        transactionType: z.enum(["transfer"]),
        location: z.object({
            latitude: z.number().default(0),
            longitude: z.number().default(0)
        })
    })


    static recurrenceTransaction = z.object({
        title: z.string(),
        time: z.string()
    })

    // extende the create transaction schema but forbid the receiver
    static bankingCreateTransaction = TransactionJoiSchema.createTransaction.extend({
        receiver: z.string().nullish().optional(),
        transactionType: z.enum(["deposit", "withdraw"])
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
}
