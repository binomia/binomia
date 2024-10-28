import { GlobalZodSchema } from "@/joi"


const evironmentVariables = GlobalZodSchema.evironmentVariables.parse(process.env)
export const {
    REDIS_HOST,
    REDIS_PORT,
    SESSION_SECRET_SECRET_KEY,
    ZERO_ENCRYPTION_KEY,
    AUTH_SERVER_URL,
    NOTIFICATION_SERVER_URL,
    ZERO_SIGN_PRIVATE_KEY

} = evironmentVariables


export const REDIS_SUBSCRIPTION_CHANNEL = {
    TRANSACTION_CREATED: "TRANSACTION_CREATED"
}