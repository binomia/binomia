import { z } from 'zod'


export class TopUpSchema {
    static topUpLocation = z.object({
        latitude: z.number().default(0).transform(v => v ?? 0),
        longitude: z.number().default(0).transform(v => v ?? 0),
        neighbourhood: z.string().nullish().transform(v => v ?? ""),
        sublocality: z.string().nullish().transform(v => v ?? ""),
        municipality: z.string().nullish().transform(v => v ?? ""),
        fullArea: z.string().nullish().transform(v => v ?? ""),
    })
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

    static topup = z.object({
        topupId: z.number(),
        amount: z.number().positive(),
        status: z.string(),
        createdAt: z.number(),
        updatedAt: z.number(),
    })
}
