// @ts-nocheck

export const NODEMAILER_EMAIL: string = process.env.NODEMAILER_EMAIL || "";
export const NODEMAILER_PASSWORD: string = process.env.NODEMAILER_PASSWORD || "";
export const ZERO_ENCRYPTION_KEY: string = process.env.ZERO_ENCRYPTION_KEY || "";
export const ZERO_SIGN_PRIVATE_KEY: string = process.env.ZERO_SIGN_PRIVATE_KEY || "";
export const SENDGRID_API_KEY: string = process.env.SENDGRID_API_KEY || "";
export const PORT: number = process.env.PORT ? Number(process.env.PORT) : 8003