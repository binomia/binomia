import { z } from 'zod'


export class TopUpSchema {
    static createTopUp = z.object({
        fullName: z.string(),
        phone: z.string(),
        amount: z.number().positive(),
        companyId: z.number()
    })

    static createFromQueueTopUp = z.object({
        phone: z.string(),
        amount: z.number().positive(),
        companyId: z.number(),
        userId: z.number(),
        phoneId: z.number(),
    })
}
