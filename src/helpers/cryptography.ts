import { ZERO_ENCRYPTION_KEY } from '@/constants';
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = Buffer.from(ZERO_ENCRYPTION_KEY, 'hex'); // Convert hex string to Buffer
const iv = crypto.randomBytes(16);


export class Cryptography {
    static encrypt(text: string): string {
        const cipher = crypto.createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    }

    static decrypt(text: string): string {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);

        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    }
}