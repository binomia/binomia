import { z } from 'zod'


export class GlobalZodSchema {
    static evironmentVariables = z.object({
        SESSION_SECRET_SECRET_KEY: z.string().nullish().transform(v => v ?? ''),
        ZERO_ENCRYPTION_KEY: z.string().nullish().transform(v => v ?? ''),
        QUEUE_SERVER_URL: z.string().nullish().transform(v => v ?? ''),
        ZERO_SIGN_PRIVATE_KEY: z.string().nullish().transform(v => v ?? ''),
        REDIS_HOST: z.string().nullish().transform(v => v ?? ''),
        REDIS_PORT: z.string().nullish().transform(v => v ?? ''),
        PORT: z.string().nullish().transform(v => v ?? ''),

        NODEMAILER_EMAIL: z.string().nullish().transform(v => v ?? ''),
        NODEMAILER_PASSWORD: z.string().nullish().transform(v => v ?? ''),
        PRODUCTION_OR_DEVELOPMENT_MODE: z.string().nullish().transform(v => v ?? ''),
        SENDGRID_API_KEY: z.string().nullish().transform(v => v ?? ''),

        POSTGRES_PASSWORD: z.string().nullish().transform(v => v ?? ''),
        POSTGRES_USER: z.string().nullish().transform(v => v ?? ''),
        POSTGRES_DB: z.string().nullish().transform(v => v ?? ''),
        POSTGRES_URL: z.string().nullish().transform(v => v ?? ''),

        NOTIFICATION_SERVER_URL: z.string().nullish().transform(v => v ?? ''),

        EXPO_ACCESS_TOKEN: z.string().nullish().transform(v => v ?? ''),

        BITNOMIA_LOCAL_HOST: z.string().nullish().transform(v => v ?? ''),
        BITNOMIA_WALLET_PUBLIC_KEY: z.string().nullish().transform(v => v ?? ''),
        BITNOMIA_WALLET_PRIVATE_KEY: z.string().nullish().transform(v => v ?? ''),
        WALLET_PUBLIC_KEY: z.string().nullish().transform(v => v ?? ''),
        WALLET_PRIVATE_KEY: z.string().nullish().transform(v => v ?? ''),
        STAKE_WALLET_PUBLIC_KEY: z.string().nullish().transform(v => v ?? ''),
        STAKE_WALLET_PRIVATE_KEY: z.string().nullish().transform(v => v ?? ''),
        LOST_WALLET_PUBLIC_KEY: z.string().nullish().transform(v => v ?? ''),
        LOST_WALLET_PRIVATE_KEY: z.string().nullish().transform(v => v ?? ''),        
    })
}
