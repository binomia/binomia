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
        NOTIFICATION_SERVER_URL: z.string(),
        ANOMALY_SERVER_URL: z.string(),
        ZERO_SIGN_PRIVATE_KEY: z.string(),
        ZERO_SIGN_PUBLIC_KEY: z.string(),
        REDIS_HOST: z.string(),
        REDIS_PORT: z.string(),
        PORT: z.string()
    })

    static bullDashboard = z.object({
        setQueues: z.function().args(z.array(z.any())).returns(z.void()),
        replaceQueues: z.function().args(z.array(z.any())).returns(z.void()),
        addQueue: z.function().args(z.any()).returns(z.void()),
        removeQueue: z.function().args(z.any()).returns(z.void())
    })

}



