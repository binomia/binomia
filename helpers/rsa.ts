import CryptoJS from "crypto-js";

export class Cryptography {
    static AESEncrypt(plainText: string, key: string): string {
        const keyWordArray = CryptoJS.enc.Utf8.parse(key);
        const encrypted = CryptoJS.AES.encrypt(plainText, keyWordArray, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: keyWordArray // First 16 bytes as IV
        });
        return encrypted.toString();
    }

    static AESdecrypt(cipherText: string, key: string): string {
        const keyWordArray = CryptoJS.enc.Utf8.parse(key);
        const decrypted = CryptoJS.AES.decrypt(cipherText, keyWordArray, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: keyWordArray
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
    
}
