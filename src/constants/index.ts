export const NODEMAILER_EMAIL: string = process.env.NODEMAILER_EMAIL || "";
export const NODEMAILER_PASSWORD: string = process.env.NODEMAILER_PASSWORD || "";
export const ZERO_ENCRYPTION_KEY: string = process.env.ZERO_ENCRYPTION_KEY || "";
export const ZERO_SIGN_PRIVATE_KEY: string = process.env.ZERO_SIGN_PRIVATE_KEY || "";
export const AUTH_SERVER_URL: string = process.env.AUTH_SERVER_URL || "";
export const SENDGRID_API_KEY: string = process.env.SENDGRID_API_KEY || "";


export const DASHBOARD_LOGO_URL: string = "https://res.cloudinary.com/brayhandeaza/image/upload/v1731676496/ccb2rr0ixpbrjxe9e73j.png";
export const DASHBOARD_FAVICON_URL: string = 'https://res.cloudinary.com/brayhandeaza/image/upload/v1731649234/yphdze0x2k2unxwoj6vy.png';

export const REDIS_SUBSCRIPTION_CHANNEL = {
    TRANSACTION_CREATED: "TRANSACTION_CREATED",
    TRANSACTION_CREATED_FROM_QUEUE: "TRANSACTION_CREATED_FROM_QUEUE",
    LOGIN_VERIFICATION_CODE: "LOGIN_VERIFICATION_CODE"
}

export const QUEUE_JOBS_NAME = {
    CREATE_TRANSACTION: "CREATE_TRANSACTION",
    CREATE_NEW_QUEUE: "CREATE_NEW_QUEUE",
    PENDING_TRANSACTION: "PENDING_TRANSACTION",
    REMOVE_TRANSACTION_FROM_QUEUE: "REMOVE_TRANSACTION_FROM_QUEUE"
}




Object.keys(REDIS_SUBSCRIPTION_CHANNEL)