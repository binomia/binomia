import { z } from 'zod'


export class GlobalZodSchema {
    
    static header = z.object({
        "session-auth-identifier": z.string().length(64, 'base64').transform((val) => val.trim()),
        authorization: z.string(),
        device: z.object({}).passthrough().optional().default({}),
    })
    static registerHeader = z.object({
        "session-auth-identifier": z.string().length(64, 'base64').transform((val) => val.trim()),
        device: z.string(),
    })

    static evironmentVariables = z.object({
        SESSION_SECRET_SECRET_KEY: z.string(),
        ZERO_ENCRYPTION_KEY: z.string(),
        AUTH_SERVER_URL: z.string(),
        NOTIFICATION_SERVER_URL: z.string(),
        ZERO_SIGN_PRIVATE_KEY: z.string(),
        REDIS_HOST: z.string(),
        REDIS_PORT: z.string(),
        PORT: z.string()
    })
}
