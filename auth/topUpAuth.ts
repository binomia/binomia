import { z } from 'zod'


export class TopUpAuthSchema {
    static topUp = z.object({
        id: z.number(),
        fullName: z.string(),
        amount: z.number(),
        phone: z.string().length(10),
        provider: z.string(),
        providerLogo: z.string().url(),
        externalId: z.string(),
        createdAt: z.string(),
        updatedAt: z.string()
    })
}
