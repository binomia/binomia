import { z } from 'zod'


export class TopUpAuthSchema {
    static topUpLocation = z.object({
        latitude: z.number().default(0).transform(v => v ?? 0),
        longitude: z.number().default(0).transform(v => v ?? 0),
        neighbourhood: z.string().nullish().transform(v => v ?? ""),
        sublocality: z.string().nullish().transform(v => v ?? ""),
        municipality: z.string().nullish().transform(v => v ?? ""),
        fullArea: z.string().nullish().transform(v => v ?? ""),
    }).partial()
    static company = z.object({
        id: z.number(),
        uuid: z.string(),
        status: z.string(),
        name: z.string(),
        logo: z.string().url(),
        createdAt: z.string(),
        updatedAt: z.string()
    }).partial().nullable().default(null)

    static phone = z.object({
        id: z.number(),
        fullName: z.string(),
        phone: z.string().length(10),
        createdAt: z.string(),
        updatedAt: z.string(),
        company: TopUpAuthSchema.company
    })
    static createTopUp = z.object({
        fullName: z.string(),
        amount: z.number(),
        phone: z.string().length(10),
        companyId: z.number(),
        location: TopUpAuthSchema.topUpLocation,
        response: z.object({
            userId: z.number(),
            amount: z.number().positive(),
            status: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            user: z.object({
                fullName: z.string(),
            }),
            company: z.object({
                logo: z.string(),
            }),
            phone: z.object({
                fullName: z.string(),
                phone: z.string(),
                lastUpdated: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
                companyId: z.number(),
                userId: z.number()
            })
        })
    })
}
