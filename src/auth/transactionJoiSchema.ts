import { z } from 'zod'

export class TransactionJoiSchema {
    static createTransaction = z.object({
        amount: z.number().gt(0),
        currency: z.enum(["DOP"]),
        receiver: z.string(),
        transactionType: z.enum(["transfer", "request"]),
        location: z.object({
            latitude: z.number(),
            longitude: z.number()
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

    static recurrenceQueueTransaction = TransactionJoiSchema.createTransaction.extend({
        id: z.number(),
        transactionId: z.string(),  
        sender: z.string()      
    })

    static weeklyQueueTitle = z.enum(["everySunday", "everyMonday", "everyTuesday", "everyWednesday", "everyThursday", "everyFriday", "everySaturday"])


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
}
