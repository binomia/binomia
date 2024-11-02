import { z } from 'zod'

export class AccountAuthSchema {
    static account = z.object({
        id: z.number().optional(),
        balance: z.number().optional(),
        status: z.string().optional(),
        sendLimit: z.number().optional(),
        receiveLimit: z.number().optional(),
        withdrawLimit: z.number().optional(),
        withdrawAmount: z.number().optional(),
        receivedAmount: z.number().optional(),
        sentAmount: z.number().optional(),
        hash: z.string().optional(),
        currency: z.string().optional(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
    })

    static jwtDecoded = z.object({
        sid: z.string(),
        iat: z.number().optional(),
        exp: z.number().optional(),
        username: z.string()
    })
}
