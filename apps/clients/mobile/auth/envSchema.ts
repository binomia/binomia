import { z } from 'zod'

export class ENVSchema {
    static evironmentVariables = z.object({
        ZERO_ENCRYPTION_KEY: z.string().nullish().transform(v => v ?? "").nullish().transform(v => v ?? ""),
        SUPPORT_PHONE_NUMBER: z.string().nullish().transform(v => v ?? ""),
        SUPPORT_EMAIL: z.string().nullish().transform(v => v ?? ""),

        MAIN_SERVER_URL: z.string().nullish().transform(v => v ?? ""),
        NOTIFICATION_SERVER_URL: z.string().nullish().transform(v => v ?? ""),
        AUTHENTICATION_SERVER_URL: z.string().nullish().transform(v => v ?? ""),

        NODEMAILER_EMAIL: z.string().nullish().transform(v => v ?? ""),
        NODEMAILER_PASSWORD: z.string().nullish().transform(v => v ?? ""),

        OCR_SPACE_API_KEY: z.string().nullish().transform(v => v ?? ""),
        CLOUDINARY_API_KEY: z.string().nullish().transform(v => v ?? ""),
        CLOUDINARY_SECRET_KEY: z.string().nullish().transform(v => v ?? ""),
        CLOUDINARY_CLOUD_NAME: z.string().nullish().transform(v => v ?? ""),
        CLOUDINARY_ID_UPLOAD_PRESET: z.string().nullish().transform(v => v ?? ""),
        CLOUDINARY_VIDEO_UPLOAD_PRESET: z.string().nullish().transform(v => v ?? ""),
        CLOUDINARY_API_URL: z.string().nullish().transform(v => v ?? ""),
        CLOUDINARY_AUDIO_API_URL: z.string().nullish().transform(v => v ?? ""),

        GOOGLE_MAPS_API_KEY: z.string().nullish().transform(v => v ?? ""),
    })
}

