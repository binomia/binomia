import { z } from 'zod'


export class TopUpAuthSchema {
    static company = z.object({
        id: z.number(),
        uuid: z.string(),
        status: z.string(),
        name: z.string(),
        logo: z.string().url(),
        createdAt: z.string(),
        updatedAt: z.string()
    })
    static topUp = z.object({
        id: z.number(),
        fullName: z.string(),
        amount: z.number(),
        phone: z.string().length(10),       
        referenceId: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        company: TopUpAuthSchema.company
    })
    static createTopUp = z.object({       
        fullName: z.string(),
        amount: z.number(),
        phone: z.string().length(10),
        companyId: z.number() 
    })
}
