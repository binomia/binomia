import crypto from 'crypto';


export class Cryptography {


    static hash = async (text: string): Promise<string> => {
        const hash = crypto.createHash('sha256');
        hash.update(text);

        return hash.digest('hex');
    }


}