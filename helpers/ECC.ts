import CryptoJS from "crypto-js";
import elliptic from "elliptic"


export class ECC {
    private static ec = new elliptic.ec("secp256k1");

    // Generate EC key pair
    static generateKeyPairs(): { publicKey: string; privateKey: string } {
        const keyPair = ECC.ec.genKeyPair();
        return {
            publicKey: keyPair.getPublic("hex"),
            privateKey: keyPair.getPrivate("hex"),
        };
    }

    // Encrypt using ECIES
    static encrypt(message: string, publicKeyHex: string): string {
        const key = ECC.ec.keyFromPublic(publicKeyHex, "hex");
        const ephemeralKeyPair = ECC.ec.genKeyPair();
        const sharedSecret = ephemeralKeyPair.derive(key.getPublic());
        
        const aesKey = CryptoJS.SHA256(sharedSecret.toString(16)).toString(CryptoJS.enc.Hex).substring(0, 32);
        const encryptedMessage = ECC.AESEncrypt(message, aesKey);

        return `${ephemeralKeyPair.getPublic("hex")}.${encryptedMessage}`;
    }

    // Decrypt using ECIES
    static decrypt(cipherText: string, privateKeyHex: string): string {
        const [ephemeralPublicKeyHex, encryptedMessage] = cipherText.split(".");
        if (!ephemeralPublicKeyHex || !encryptedMessage) throw new Error("Invalid encrypted format");

        const privateKey = ECC.ec.keyFromPrivate(privateKeyHex, "hex");
        const ephemeralPublicKey = ECC.ec.keyFromPublic(ephemeralPublicKeyHex, "hex");
        const sharedSecret = privateKey.derive(ephemeralPublicKey.getPublic());

        const aesKey = CryptoJS.SHA256(sharedSecret.toString(16)).toString(CryptoJS.enc.Hex).substring(0, 32);
        return ECC.AESDecrypt(encryptedMessage, aesKey);
    }

    // AES Encryption
    private static AESEncrypt(plainText: string, aesKey: string): string {
        const keyWordArray = CryptoJS.enc.Hex.parse(aesKey);
        const encrypted = CryptoJS.AES.encrypt(plainText, keyWordArray, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: keyWordArray,
        });
        return encrypted.toString();
    }

    // AES Decryption
    private static AESDecrypt(cipherText: string, aesKey: string): string {
        const keyWordArray = CryptoJS.enc.Hex.parse(aesKey);
        const decrypted = CryptoJS.AES.decrypt(cipherText, keyWordArray, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: keyWordArray,
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
}

