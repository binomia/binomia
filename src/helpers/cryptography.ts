import { ZERO_ENCRYPTION_KEY } from '../constants';
import crypto from 'crypto';
import elliptic from 'elliptic';


const EC = elliptic.ec;
const ec = new EC('secp256k1');

const algorithm = 'aes-256-cbc';
const signAlgorithm = 'SHA256'
const key = Buffer.from(ZERO_ENCRYPTION_KEY, 'hex'); // Convert hex string to Buffer
const iv = crypto.randomBytes(16);


export class Cryptography {
    static encrypt = async (text: string): Promise<string> => {
        const cipher = crypto.createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    }

    static hash = async (text: string): Promise<string> => {
        const hash = crypto.createHash('sha256');
        hash.update(text);

        return hash.digest('hex');
    }

    static decrypt = async (text: string): Promise<string> => {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);

        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    }

    static sign = async (data: string, privateKey: string): Promise<string> => {
        const key = ec.keyFromPrivate(privateKey, 'hex');
        const signature = key.sign(data, { canonical: true });
        return signature.toDER('hex');
    }

    static verify = async (message: string, signature: string, privateKey: string): Promise<boolean> => {
        const keyPair = ec.keyFromPrivate(privateKey, 'hex');
        const publicKeyCompressed = keyPair.getPublic(true, "hex");

        const key = ec.keyFromPublic(publicKeyCompressed, 'hex');
        const verified = key.verify(message, signature);

        return verified
    }
}