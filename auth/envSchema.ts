import { z } from 'zod'

export class ENVSchema {
    static evironmentVariables = z.object({
        ZERO_ENCRYPTION_KEY: z.string(),
        SUPPORT_PHONE_NUMBER: z.string(),
        SUPPORT_EMAIL: z.string(),

        MAIN_SERVER_URL: z.string(),
        NOTIFICATION_SERVER_URL: z.string(),
        AUTHENTICATION_SERVER_URL: z.string(),

        AZURE_FACE_API_ENDPOINT: z.string(),
        AZURE_FACE_API_KEY: z.string(),

        NODEMAILER_EMAIL: z.string(),
        NODEMAILER_PASSWORD: z.string(),

        OCR_SPACE_API_KEY: z.string(),
        CLOUDINARY_API_KEY: z.string(),
        CLOUDINARY_SECRET_KEY: z.string(),
        CLOUDINARY_CLOUD_NAME: z.string(),
        CLOUDINARY_ID_UPLOAD_PRESET: z.string(),
        CLOUDINARY_VIDEO_UPLOAD_PRESET: z.string(),
        CLOUDINARY_API_URL: z.string(),
        CLOUDINARY_AUDIO_API_URL: z.string(),

        GOOGLE_MAPS_API_KEY: z.string(),
    })
}



// ZERO_ENCRYPTION_KEY="7335a5f1600b4d506acc41665bff99637df61d46b9a998d158b746a72539cbfd"
// SUPPORT_PHONE_NUMBER="8298027293"
// SUPPORT_EMAIL="soporte@binomia.com"

// MAIN_SERVER_URL="http://192.168.1.93:8000/graphql"
// NOTIFICATION_SERVER_URL="http://192.168.1.93:8001"
// AUTHENTICATION_SERVER_URL="http://192.168.1.93:8003/"

// AZURE_FACE_API_ENDPOINT="https://devdinero.cognitiveservices.azure.com"
// AZURE_FACE_API_KEY="4449ba8bab7745b48eb18ebc0739a613"

// NODEMAILER_EMAIL="brayhandeaza@gmail.com";
// NODEMAILER_PASSWORD="eeuj ghvo cxfh irab";

// OCR_SPACE_API_KEY="K81383019488957"

// CLOUDINARY_API_KEY="523739952833227";
// CLOUDINARY_SECRET_KEY="JENRPc17uhTsEr7ARnYQC9TH-Gc";
// CLOUDINARY_CLOUD_NAME="brayhandeaza";
// CLOUDINARY_ID_UPLOAD_PRESET="dinero-xekxg64n-id";
// CLOUDINARY_VIDEO_UPLOAD_PRESET="dinero-ssxyoum1-video";
// CLOUDINARY_API_URL="https://api.cloudinary.com/v1_1/brayhandeaza/auto/upload";
// CLOUDINARY_AUDIO_API_URL="https://api.cloudinary.com/v1_1/brayhandeaza/image/upload"
