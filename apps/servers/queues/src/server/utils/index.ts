import { ZERO_ENCRYPTION_KEY } from "@/constants";
import { LANGUAGES } from "cromio";
import fs from 'fs';
import path from 'path';

export const clients = [
    {
        secretKey: ZERO_ENCRYPTION_KEY,
        language: LANGUAGES.NODEJS,
        ip: "*",
    }
]


const key = fs.readFileSync(path.join(__dirname, '../../certs/server/key.pem'))
const cert = fs.readFileSync(path.join(__dirname, '../../certs/server/cert.pem'))
const ca = fs.readFileSync(path.join(__dirname, '../../certs/ca.pem'))
export const mTLS = {
    key,
    cert,
    ca,
    requestCert: true,
    rejectUnauthorized: true
}
