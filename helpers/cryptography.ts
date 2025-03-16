import * as Crypto from 'expo-crypto'; // Import expo-crypto
import { Buffer } from "buffer";
import CryptoJS from "crypto-js";


export class Cryptography {
    // AES Encryption
    static async AESEncrypt(plainText: string, aesKey: string): Promise<string> {
        const keyWordArray = CryptoJS.enc.Hex.parse(aesKey);
        const encrypted = CryptoJS.AES.encrypt(plainText, keyWordArray, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: keyWordArray // First 16 bytes as IV
        });
        return encrypted.toString();
    }

    // AES Decryption
    static async AESDecrypt(cipherText: string, aesKey: string): Promise<string> {
        const keyWordArray = CryptoJS.enc.Hex.parse(aesKey);
        const decrypted = CryptoJS.AES.decrypt(cipherText, keyWordArray, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: keyWordArray
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    // RSA Encryption
    static async encrypt(message: string, publicKey: string): Promise<string> {
        const aesKey = await Cryptography.generateRandomAESKey(); // Use expo-crypto for AES key generation

        // Encrypt the message using AES
        const encryptedMessage = await Cryptography.AESEncrypt(message, aesKey);

        // Encrypt the AES key using RSA
        const encryptedAESKey = Cryptography.encryptAESKeyWithRSA(aesKey, publicKey);

        return `${encryptedAESKey}.${encryptedMessage}`;
    }

    // RSA Decryption
    static async decrypt(cipherText: string, privateKey: string): Promise<string> {
        const [encryptedAESKey, encryptedMessage] = cipherText.split(".");

        // Decrypt the AES key using RSA
        const aesKey = Cryptography.decryptAESKeyWithRSA(encryptedAESKey, privateKey);

        // Decrypt the message using AES
        return await Cryptography.AESDecrypt(encryptedMessage, aesKey);
    }

    // Encrypt AES key using RSA
    private static encryptAESKeyWithRSA(aesKey: string, publicKey: string): string {
        const [eHex, nHex] = publicKey.split(".");
        const e = Cryptography.hexToBigInt(eHex);
        const n = Cryptography.hexToBigInt(nHex);
        const m = Cryptography.textToBigInt(aesKey);

        if (m >= n) throw new Error("AES key too large for RSA key size");

        return Cryptography.bigIntToHex(Cryptography.modExp(m, e, n));
    }

    // Decrypt AES key using RSA
    private static decryptAESKeyWithRSA(encryptedAESKey: string, privateKey: string): string {
        const [dHex, nHex] = privateKey.split(".");
        const d = Cryptography.hexToBigInt(dHex);
        const n = Cryptography.hexToBigInt(nHex);
        const c = Cryptography.hexToBigInt(encryptedAESKey);

        const decryptedBigInt = Cryptography.modExp(c, d, n);
        return Cryptography.bigIntToText(decryptedBigInt);
    }

    // Utility functions for RSA
    private static bigIntToText(big: bigint): string {
        let hex = big.toString(16);
        if (hex.length % 2 !== 0) hex = "0" + hex;
        return Buffer.from(hex, "hex").toString("utf8");
    }

    private static textToBigInt(text: string): bigint {
        const hex = Buffer.from(text, "utf8").toString("hex");
        if (!hex) throw new Error("Invalid input for BigInt conversion");
        return BigInt("0x" + hex);
    }

    private static bigIntToHex(big: bigint): string {
        return big.toString(16);
    }

    private static hexToBigInt(hex: string): bigint {
        return BigInt(`0x${hex}`);
    }

    private static modExp(base: bigint, exp: bigint, mod: bigint): bigint {
        let result = BigInt(1);
        base = base % mod;
        while (exp > BigInt(0)) {
            if (exp % BigInt(2) === BigInt(1)) result = (result * base) % mod;
            base = (base * base) % mod;
            exp /= BigInt(2);
        }
        return result;
    }

    private static modInverse(a: bigint, m: bigint): bigint {
        let [m0, x0, x1] = [m, BigInt(0), BigInt(1)];
        while (a > BigInt(1)) {
            let q = a / m;
            [m, a] = [a % m, m];
            [x0, x1] = [x1 - q * x0, x0];
        }
        return x1 < BigInt(0) ? x1 + m0 : x1;
    }

    private static gcd(a: bigint, b: bigint): bigint {
        return b === BigInt(0) ? a : Cryptography.gcd(b, a % b);
    }

    private static generatePrime(bits: number): bigint {
        let prime;
        do {
            prime = Cryptography.randomBigInt(bits);
        } while (!Cryptography.isPrime(prime));
        return prime;
    }

    private static isPrime(n: bigint, k: number = 5): boolean {
        if (n < BigInt(2)) return false;
        if (n % BigInt(2) === BigInt(0)) return n === BigInt(2);
        let d = n - BigInt(1);
        let r = 0;
        while (d % BigInt(2) === BigInt(0)) {
            d /= BigInt(2);
            r++;
        }

        for (let i = 0; i < k; i++) {
            const a = BigInt(2) + (Cryptography.randomBigInt(n.toString(2).length) % (n - BigInt(3)));
            let x = Cryptography.modExp(a, d, n);
            if (x === BigInt(1) || x === n - BigInt(1)) continue;
            let isComposite = true;
            for (let j = 0; j < r - 1; j++) {
                x = (x * x) % n;
                if (x === n - BigInt(1)) {
                    isComposite = false;
                    break;
                }
            }
            if (isComposite) return false;
        }
        return true;
    }

    private static randomBigInt(bits: number): bigint {
        let randStr = "1";
        for (let i = 1; i < bits; i++) randStr += Math.random() > 0.5 ? "1" : "0";
        return BigInt("0b" + randStr);
    }

    // Generate random AES key using expo-crypto (SHA-256)
    private static async generateRandomAESKey(): Promise<string> {
        // Generate a hash of random data (like a timestamp or other source of entropy)
        const randomBytes = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, Date.now().toString());
        return randomBytes.substring(0, 32); // Use the first 32 characters as the AES key
    }
}
