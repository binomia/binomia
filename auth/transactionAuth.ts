import { z } from 'zod'

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
}
