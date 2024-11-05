import { z } from 'zod'

export class SessionAuthSchema {
    static verifySession = z.object({
        token: z.string().min(1),
        sid: z.string().min(1),
        code: z.string().min(1),
        signature: z.string().min(1)
    })

    static jwtDecoded = z.object({
        sid: z.string(),
        iat: z.number().optional(),
        exp: z.number().optional(),
        username: z.string()
    })
}
