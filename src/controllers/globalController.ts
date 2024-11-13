import { checkForProtectedRequests } from '@/helpers'
import { GraphQLError } from 'graphql';
import { Cryptography } from '@/helpers/cryptography';
import { ZERO_SIGN_PRIVATE_KEY, ZERO_ENCRYPTION_KEY, REDIS_SUBSCRIPTION_CHANNEL, QUEUE_JOBS_NAME } from '@/constants';
import redis from '@/redis';


export class GlobalController {
    static signData = async (_: unknown, { hash }: { hash: string }, context: any) => {
        try {
            await checkForProtectedRequests(context.req);
            const hashData = await Cryptography.hash(JSON.stringify({
                hash,
                ZERO_ENCRYPTION_KEY,
                ZERO_SIGN_PRIVATE_KEY
            }))

            console.log({ hashData, ZERO_ENCRYPTION_KEY, hash });

            const signature = Cryptography.sign(hashData, ZERO_SIGN_PRIVATE_KEY)
            return signature

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static test = async (_: unknown, { hash }: { hash: string }, { req }: { req: any }) => {
        try {
            redis.publish(QUEUE_JOBS_NAME.CREATE_TRANSACTION, JSON.stringify({
                headers: Date.now(),
            }))

            return null

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

}