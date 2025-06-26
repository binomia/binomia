import { ZERO_ENCRYPTION_KEY } from "@/constants";
import CryptoJS from "crypto-js";

export const AES = {
    generateKey: async (): Promise<string> => {
        try {
            const left = CryptoJS.SHA256(Date.now().toString()).toString()
            const right = CryptoJS.SHA1(Date.now().toString()).toString()

            return Promise.resolve(`${left}${right}`)

        } catch (error) {
            return Promise.reject(error)
        }
    },

    encrypt: async (message: string): Promise<string> => {
        try {
            const keyWordArray = CryptoJS.enc.Utf8.parse(ZERO_ENCRYPTION_KEY);
            const encrypted = CryptoJS.AES.encrypt(message, keyWordArray, {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
                iv: keyWordArray
            });

            return Promise.resolve(encrypted.toString());

        } catch (error) {
            return Promise.reject(error)
        }
    },
    decrypt: async (message: string): Promise<string> => {
        try {
            const keyWordArray = CryptoJS.enc.Utf8.parse(ZERO_ENCRYPTION_KEY);
            const decrypted = CryptoJS.AES.decrypt(message, keyWordArray, {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
                iv: keyWordArray
            });
            return Promise.resolve(decrypted.toString(CryptoJS.enc.Utf8));

        } catch (error) {
            return Promise.reject(error)
        }
    }
}